import { createDefaultAnswers, setAnswerValue } from "./answers";
import { buildLifestyleModel } from "./lifestyleModel";

it("turns daily, monthly, and annual answers into annual categories", () => {
  const answers = setAnswerValue(
    setAnswerValue(createDefaultAnswers("safe"), "dailyFoodBudget", 100, "safe"),
    "monthlyHousingCost",
    8000,
    "safe"
  );

  const model = buildLifestyleModel(answers, "safe");

  expect(model.categories.dailyLife).toBe(36500);
  expect(model.categories.housing).toBe(96000);
  expect(model.totalAnnualExpense).toBeGreaterThan(96000);
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
