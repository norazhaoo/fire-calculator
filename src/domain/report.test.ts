import { createDefaultAnswers, setAnswerValue } from "./answers";
import { expenseCategories, reserveItems } from "./catalog";
import { buildReport } from "./report";
import type { AnswerMap, ScenarioTier } from "./types";

it("builds a selected-tier report plus three-tier comparison", () => {
  const report = buildReport(createDefaultAnswers("safe"), "safe");

  expect(report.selectedTier).toBe("safe");
  expect(report.comparison).toHaveLength(3);
  expect(report.comparison.map((row) => row.tier)).toEqual(["baseline", "safe", "abundant"]);
  expect(report.impactItems.length).toBeGreaterThan(0);
});

it("does not leak safe-only expenses into baseline comparison", () => {
  const report = buildReport(createDefaultAnswers("safe"), "safe");
  const baseline = report.comparison.find((row) => row.tier === "baseline");

  expect(baseline).toBeDefined();
  expect(baseline?.financial.expenses.categories.children.currentAnnual).toBe(0);
  expect(baseline?.financial.expenses.categories.family.currentAnnual).toBe(0);
  expect(baseline?.financial.expenses.categories.medical.currentAnnual).toBe(18000);
});

it("does not leak abundant-only expenses into baseline comparison", () => {
  const report = buildReport(createDefaultAnswers("abundant"), "abundant");
  const baseline = report.comparison.find((row) => row.tier === "baseline");
  const abundant = report.comparison.find((row) => row.tier === "abundant");

  expect(baseline).toBeDefined();
  expect(abundant).toBeDefined();
  expect(baseline?.financial.expenses.categories.medical.currentAnnual).toBe(18000);
  expect(baseline?.financial.expenses.categories.largePurchases.currentAnnual).toBe(8000);
  expect(abundant?.financial.expenses.categories.medical.currentAnnual).toBe(90000);
  expect(abundant?.financial.expenses.categories.largePurchases.currentAnnual).toBe(60000);
});

it("feeds income, current expenses, assets, and reserves into the selected FIRE result", () => {
  const answers = setAnswers(emptyScenario("safe"), "safe", [
    ["income.fixed.monthly", 30000],
    ["expense.daily.quickAnnual", 120000],
    ["asset.deposit.value", 1000000],
    ["withdrawalRate", 4]
  ]);

  const report = buildReport(answers, "safe");

  expect(report.selected.financial.annualContribution).toBe(240000);
  expect(report.selected.fire.targetAssets).toBe(3000000);
  expect(report.selected.fire.yearsToFire).toBeGreaterThan(0);
});

it("adds a property note when property count and value are recorded", () => {
  const answers = setAnswers(emptyScenario("safe"), "safe", [
    ["asset.property.count", 2],
    ["asset.property.estimatedValue", 4200000]
  ]);

  const report = buildReport(answers, "safe");

  expect(report.propertyNote).toBe(
    "已记录房产 2 套，估值 ¥4,200,000，未计入 FIRE 可投资资产；如果未来出租或出售，可以再做高级版估算。"
  );
  expect(report.selected.financial.assets.investableAssets).toBe(0);
});

function emptyScenario(tier: ScenarioTier) {
  const answers = createDefaultAnswers(tier);
  const zeroExpenseAnswers = expenseCategories.flatMap((category) => [
    [category.quickAnnualQuestionId, 0] as const
  ]);
  const zeroReserves = reserveItems.flatMap((item) => [[item.questionId, 0] as const]);

  return setAnswers(answers, tier, [...zeroExpenseAnswers, ...zeroReserves]);
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
