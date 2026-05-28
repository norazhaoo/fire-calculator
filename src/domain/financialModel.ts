import {
  annualize,
  assetEntries,
  expenseCategories,
  incomeSources,
  propertyEstimatedValueQuestionId,
  reserveItems,
  type ExpenseEntryMode,
  type Period
} from "./catalog";
import type { AnswerMap, ExpenseCategoryId, ScenarioTier } from "./types";

export interface IncomeModel {
  totalAnnualBeforeFire: number;
  totalAnnualAfterFire: number;
  sources: Array<{
    id: string;
    label: string;
    annualBeforeFire: number;
    annualAfterFire: number;
    continuesAfterFire: boolean;
  }>;
}

export interface AssetModel {
  investableAssets: number;
  expectedReturnRate: number;
  propertyCount: number;
  propertyValue: number;
  totalNetWorth: number;
  buckets: Array<{
    id: string;
    label: string;
    value: number;
    returnRate: number;
    included: boolean;
    unit: "yuan" | "count";
  }>;
}

export interface ExpenseCategoryModel {
  id: ExpenseCategoryId;
  label: string;
  mode: ExpenseEntryMode;
  currentAnnual: number;
  retirementAnnual: number;
}

export interface ExpenseModel {
  categories: Record<ExpenseCategoryId, ExpenseCategoryModel>;
  totalCurrentAnnual: number;
  totalRetirementAnnual: number;
}

export interface ReserveModel {
  emergencyReserve: number;
  oneTimeReserves: number;
  items: Array<{ id: string; label: string; value: number }>;
}

export interface FinancialModel {
  tier: ScenarioTier;
  income: IncomeModel;
  assets: AssetModel;
  expenses: ExpenseModel;
  reserves: ReserveModel;
  annualContribution: number;
  netAnnualFireExpense: number;
}

export function buildFinancialModel(answers: AnswerMap, tier: ScenarioTier): FinancialModel {
  const income = buildIncomeModel(answers);
  const assets = buildAssetModel(answers);
  const expenses = buildExpenseModel(answers);
  const reserves = buildReserveModel(answers, expenses.totalRetirementAnnual);
  const annualContribution = Math.max(
    0,
    income.totalAnnualBeforeFire - expenses.totalCurrentAnnual
  );
  const netAnnualFireExpense = Math.max(
    0,
    expenses.totalRetirementAnnual - income.totalAnnualAfterFire
  );

  return {
    tier,
    income,
    assets,
    expenses,
    reserves,
    annualContribution,
    netAnnualFireExpense
  };
}

function buildIncomeModel(answers: AnswerMap): IncomeModel {
  const sources = incomeSources.map((source) => {
    const annualBeforeFire = annualize(
      numberAnswer(answers, source.amountQuestionId),
      source.period
    );
    const continuesAfterFire = booleanAnswer(answers, source.continuesQuestionId);
    const annualAfterFire = continuesAfterFire ? annualBeforeFire : 0;

    return {
      id: source.id,
      label: source.label,
      annualBeforeFire,
      annualAfterFire,
      continuesAfterFire
    };
  });

  return {
    sources,
    totalAnnualBeforeFire: sum(sources.map((source) => source.annualBeforeFire)),
    totalAnnualAfterFire: sum(sources.map((source) => source.annualAfterFire))
  };
}

function buildAssetModel(answers: AnswerMap): AssetModel {
  const buckets = assetEntries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    value: numberAnswer(answers, entry.valueQuestionId),
    returnRate:
      entry.includedInFire && entry.unit === "yuan"
        ? numberAnswer(answers, entry.returnRateQuestionId, entry.defaultReturnRate)
        : entry.defaultReturnRate,
    included: entry.includedInFire,
    unit: entry.unit
  }));
  const includedBuckets = buckets.filter(
    (bucket) => bucket.included && bucket.unit === "yuan"
  );
  const investableAssets = sum(includedBuckets.map((bucket) => bucket.value));
  const weightedReturn =
    investableAssets > 0
      ? sum(includedBuckets.map((bucket) => bucket.value * bucket.returnRate)) / investableAssets
      : 4;
  const propertyCount = numberAnswer(answers, "asset.property.count");
  const propertyValue = numberAnswer(answers, propertyEstimatedValueQuestionId);

  return {
    buckets,
    investableAssets,
    expectedReturnRate: weightedReturn,
    propertyCount,
    propertyValue,
    totalNetWorth: investableAssets + propertyValue
  };
}

function buildExpenseModel(answers: AnswerMap): ExpenseModel {
  const categories = Object.fromEntries(
    expenseCategories.map((category) => {
      const mode =
        stringAnswer(answers, category.modeQuestionId) === "itemized" ? "itemized" : "quick";
      const itemizedAnnual = sum(
        category.items.map((item) =>
          annualize(
            numberAnswer(answers, item.questionId),
            periodAnswer(answers, item.periodQuestionId, item.period)
          )
        )
      );
      const quickAnnual = annualize(
        numberAnswer(answers, category.quickAnnualQuestionId),
        periodAnswer(answers, category.quickPeriodQuestionId, "annual")
      );
      const currentAnnual = mode === "itemized" ? itemizedAnnual : quickAnnual;
      const retirementOverride = answers[category.retirementAnnualQuestionId];
      const retirementAnnual =
        retirementOverride?.source === "user" && typeof retirementOverride.value === "number"
          ? Math.max(0, retirementOverride.value)
          : currentAnnual;

      return [
        category.id,
        {
          id: category.id,
          label: category.label,
          mode,
          currentAnnual,
          retirementAnnual
        }
      ];
    })
  ) as Record<ExpenseCategoryId, ExpenseCategoryModel>;

  return {
    categories,
    totalCurrentAnnual: sum(Object.values(categories).map((category) => category.currentAnnual)),
    totalRetirementAnnual: sum(
      Object.values(categories).map((category) => category.retirementAnnual)
    )
  };
}

function buildReserveModel(answers: AnswerMap, retirementAnnualExpense: number): ReserveModel {
  const emergencyMonths = numberAnswer(answers, "reserve.emergencyMonths");
  const emergencyReserve = (retirementAnnualExpense / 12) * emergencyMonths;
  const items = reserveItems
    .filter((item) => item.id !== "emergencyMonths")
    .map((item) => ({
      id: item.id,
      label: item.label,
      value: numberAnswer(answers, item.questionId)
    }));
  const oneTimeReserves = emergencyReserve + sum(items.map((item) => item.value));

  return {
    emergencyReserve,
    oneTimeReserves,
    items: [
      {
        id: "emergencyMonths",
        label: "生活费安全垫",
        value: emergencyReserve
      },
      ...items
    ]
  };
}

function numberAnswer(answers: AnswerMap, questionId: string, fallback = 0) {
  const value = answers[questionId]?.value;

  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function booleanAnswer(answers: AnswerMap, questionId: string, fallback = false) {
  const value = answers[questionId]?.value;

  return typeof value === "boolean" ? value : fallback;
}

function stringAnswer(answers: AnswerMap, questionId: string) {
  const value = answers[questionId]?.value;

  return typeof value === "string" ? value : "";
}

function periodAnswer(answers: AnswerMap, questionId: string, fallback: Period): Period {
  const value = stringAnswer(answers, questionId);

  return value === "daily" || value === "weekly" || value === "monthly" || value === "annual"
    ? value
    : fallback;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
