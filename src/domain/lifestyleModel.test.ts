import { createDefaultAnswers, setAnswerValue } from "./answers";
import { buildLifestyleModel } from "./lifestyleModel";
import type { AnswerMap, ScenarioTier } from "./types";

it("turns lifestyle answers into exact annual category totals", () => {
  const answers = setAnswerValues(createDefaultAnswers("abundant"), "abundant", [
    ["dailyFoodBudget", 100],
    ["monthlyHousingCost", 8000],
    ["annualTravelBudget", 42000],
    ["basicMedicalBuffer", 400000],
    ["commercialInsuranceAnnual", 12000],
    ["privateMedicalBudget", 8000],
    ["childrenEducationTrack", "private"],
    ["parentsSupportAnnual", 30000],
    ["lifestyleUpgradeAnnual", 24000]
  ]);

  const model = buildLifestyleModel(answers, "abundant");

  expect(model.categories).toEqual({
    basics: 0,
    dailyLife: 36500,
    housing: 96000,
    transport: 0,
    travel: 42000,
    largePurchases: 24000,
    children: 120000,
    family: 30000,
    medical: 40000
  });
  expect(model.totalAnnualExpense).toBe(388500);
});

it("clamps negative numeric answers to zero", () => {
  const answers = setAnswerValues(createDefaultAnswers("abundant"), "abundant", [
    ["dailyFoodBudget", -100],
    ["monthlyHousingCost", -8000],
    ["annualTravelBudget", -42000],
    ["basicMedicalBuffer", -400000],
    ["commercialInsuranceAnnual", -12000],
    ["privateMedicalBudget", -8000],
    ["childrenEducationTrack", "none"],
    ["parentsSupportAnnual", -30000],
    ["lifestyleUpgradeAnnual", -24000]
  ]);

  const model = buildLifestyleModel(answers, "abundant");

  expect(model.categories).toEqual({
    basics: 0,
    dailyLife: 0,
    housing: 0,
    transport: 0,
    travel: 0,
    largePurchases: 0,
    children: 0,
    family: 0,
    medical: 0
  });
  expect(model.totalAnnualExpense).toBe(0);
});

it("excludes child education when the user chooses no children", () => {
  const answers = setAnswerValue(
    createDefaultAnswers("safe"),
    "childrenEducationTrack",
    "none",
    "safe"
  );

  const model = buildLifestyleModel(answers, "safe");

  expect(model.categories.children).toBe(0);
});

function setAnswerValues(
  answers: AnswerMap,
  tier: ScenarioTier,
  values: Array<[string, Parameters<typeof setAnswerValue>[2]]>
) {
  return values.reduce(
    (nextAnswers, [questionId, value]) => setAnswerValue(nextAnswers, questionId, value, tier),
    answers
  );
}
