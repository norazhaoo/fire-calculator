import { createDefaultAnswers, setAnswerValue } from "./answers";
import { assetEntries, expenseCategories, reserveItems } from "./catalog";
import { buildFinancialModel } from "./financialModel";
import type { AnswerMap, ScenarioTier } from "./types";

it("combines income and current expenses into annual investment contribution", () => {
  const answers = setAnswers(emptyScenario("safe"), "safe", [
    ["income.fixed.monthly", 30000],
    ["income.partTime.monthly", 3000],
    ["income.rent.monthly", 5000],
    ["income.rent.continuesAfterFire", true],
    ["expense.daily.quickAnnual", 60000],
    ["expense.housing.quickAnnual", 120000]
  ]);

  const model = buildFinancialModel(answers, "safe");

  expect(model.income.totalAnnualBeforeFire).toBe(456000);
  expect(model.income.totalAnnualAfterFire).toBe(60000);
  expect(model.expenses.totalCurrentAnnual).toBe(180000);
  expect(model.annualContribution).toBe(276000);
  expect(model.expenses.totalRetirementAnnual).toBe(180000);
  expect(model.netAnnualFireExpense).toBe(120000);
});

it("uses itemized expense details when a category is expanded", () => {
  const answers = setAnswers(emptyScenario("safe"), "safe", [
    ["expense.daily.mode", "itemized"],
    ["expense.daily.foodDaily", 100],
    ["expense.daily.diningMonthly", 2000],
    ["expense.daily.necessitiesMonthly", 1000]
  ]);

  const model = buildFinancialModel(answers, "safe");

  expect(model.expenses.categories.daily.currentAnnual).toBe(72500);
  expect(model.expenses.totalCurrentAnnual).toBe(72500);
});

it("annualizes quick and itemized expense amounts from selected periods", () => {
  const quickAnswers = setAnswers(emptyScenario("safe"), "safe", [
    ["expense.daily.quickAnnual", 1000],
    ["expense.daily.quickPeriod", "monthly"]
  ]);
  const itemizedAnswers = setAnswers(emptyScenario("safe"), "safe", [
    ["expense.daily.mode", "itemized"],
    ["expense.daily.foodDaily", 1000],
    ["expense.daily.foodDaily.period", "weekly"]
  ]);

  expect(buildFinancialModel(quickAnswers, "safe").expenses.categories.daily.currentAnnual).toBe(
    12000
  );
  expect(buildFinancialModel(itemizedAnswers, "safe").expenses.categories.daily.currentAnnual).toBe(
    52000
  );
});

it("calculates investable assets and weighted return from deposits and investments", () => {
  const answers = setAnswers(emptyScenario("safe"), "safe", [
    ["asset.deposit.value", 100000],
    ["asset.deposit.returnRate", 3],
    ["asset.investment.value", 200000],
    ["asset.investment.returnRate", 8],
    ["asset.property.count", 3],
    ["asset.property.estimatedValue", 5000000]
  ]);

  const model = buildFinancialModel(answers, "safe");

  expect(model.assets.investableAssets).toBe(300000);
  expect(model.assets.expectedReturnRate).toBeCloseTo(6.333, 3);
  expect(model.assets.propertyCount).toBe(3);
  expect(model.assets.propertyValue).toBe(5000000);
  expect(model.assets.totalNetWorth).toBe(5300000);
});

it("defaults retirement expenses to current expenses but allows review overrides", () => {
  const answers = setAnswers(emptyScenario("safe"), "safe", [
    ["expense.daily.quickAnnual", 60000],
    ["expense.housing.quickAnnual", 120000],
    ["expense.housing.retirementAnnual", 24000]
  ]);

  const model = buildFinancialModel(answers, "safe");

  expect(model.expenses.totalCurrentAnnual).toBe(180000);
  expect(model.expenses.totalRetirementAnnual).toBe(84000);
});

function emptyScenario(tier: ScenarioTier) {
  const answers = createDefaultAnswers(tier);
  const zeroExpenseAnswers = expenseCategories.flatMap((category) => [
    [category.quickAnnualQuestionId, 0] as const,
    ...category.items.map((item) => [item.questionId, 0] as const)
  ]);
  const zeroReserves = reserveItems.flatMap((item) => [[item.questionId, 0] as const]);
  const zeroAssets = assetEntries.flatMap((entry) => [[entry.valueQuestionId, 0] as const]);

  return setAnswers(answers, tier, [
    ...zeroExpenseAnswers,
    ...zeroReserves,
    ...zeroAssets
  ]);
}

function setAnswers(
  answers: AnswerMap,
  tier: ScenarioTier,
  values: Array<readonly [string, number | string | boolean]>
) {
  return values.reduce(
    (nextAnswers, [questionId, value]) => setAnswerValue(nextAnswers, questionId, value, tier),
    answers
  );
}
