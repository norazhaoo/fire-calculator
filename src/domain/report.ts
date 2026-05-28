import { createDefaultAnswers, getVisibleAnswers } from "./answers";
import { calculateFireResult, type FireResult } from "./fire";
import { buildFinancialModel, type FinancialModel } from "./financialModel";
import { questions } from "./questions";
import { tierOrder } from "./tiers";
import type { AnswerMap, ExpenseCategoryId, ScenarioTier } from "./types";

export interface TierReport {
  tier: ScenarioTier;
  financial: FinancialModel;
  fire: FireResult;
}

export interface Report {
  selectedTier: ScenarioTier;
  selected: TierReport;
  comparison: TierReport[];
  impactItems: { category: ExpenseCategoryId; label: string; annualCost: number }[];
  cashflowWarning: string | null;
  propertyNote: string | null;
}

const questionById = new Map(questions.map((question) => [question.id, question]));

export function buildReport(answers: AnswerMap, selectedTier: ScenarioTier): Report {
  const comparison = tierOrder.map((tier) => buildTierReport(answersForTier(answers, tier), tier));
  const selected = comparison.find((row) => row.tier === selectedTier) ?? comparison[0];
  const impactItems = Object.values(selected.financial.expenses.categories)
    .map((category) => ({
      category: category.id,
      label: category.label,
      annualCost: category.retirementAnnual
    }))
    .filter((item) => item.annualCost > 0)
    .sort((a, b) => b.annualCost - a.annualCost)
    .slice(0, 5);
  const cashflowWarning =
    selected.financial.annualContribution <= 0
      ? "按当前收入和支出，年度可投资结余为 0，FIRE 时间主要依赖已有资产增长。"
      : null;
  const propertyNote =
    selected.financial.assets.propertyCount > 0 || selected.financial.assets.propertyValue > 0
      ? `已记录房产 ${selected.financial.assets.propertyCount} 套${formatPropertyValue(selected.financial.assets.propertyValue)}，未计入 FIRE 可投资资产；如果未来出租或出售，可以再做高级版估算。`
      : null;

  return {
    selectedTier,
    selected,
    comparison,
    impactItems,
    cashflowWarning,
    propertyNote
  };
}

function buildTierReport(answers: AnswerMap, tier: ScenarioTier): TierReport {
  const financial = buildFinancialModel(answers, tier);

  return {
    tier,
    financial,
    fire: calculateFireResult({
      currentAge: numberAnswer(answers, "currentAge"),
      currentAssets: financial.assets.investableAssets,
      annualContribution: financial.annualContribution,
      expectedReturnRate: financial.assets.expectedReturnRate,
      withdrawalRate: numberAnswer(answers, "withdrawalRate"),
      netAnnualFireExpense: financial.netAnnualFireExpense,
      oneTimeReserves: financial.reserves.oneTimeReserves
    })
  };
}

function answersForTier(sourceAnswers: AnswerMap, tier: ScenarioTier): AnswerMap {
  const defaults = createDefaultAnswers(tier);
  const visibleAnswers = getVisibleAnswers(sourceAnswers, tier);
  const overlays = Object.fromEntries(
    Object.entries(visibleAnswers).filter(([questionId, answer]) => {
      const question = questionById.get(questionId);

      if (!question) {
        return false;
      }

      if (question.behavior === "fact" && answer.source === "user") {
        return true;
      }

      return answer.editedInTier === tier && answer.source === "user";
    })
  );

  return {
    ...defaults,
    ...overlays
  };
}

function numberAnswer(answers: AnswerMap, questionId: string) {
  const value = answers[questionId]?.value;

  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function formatPropertyValue(value: number) {
  if (value <= 0) {
    return "";
  }

  return `，估值 ${new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value)}`;
}
