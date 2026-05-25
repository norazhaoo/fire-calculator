import { getQuestionsForTier } from "./questions";

it("shows baseline questions for every tier", () => {
  const safeQuestionIds = getQuestionsForTier("safe").map((question) => question.id);

  expect(safeQuestionIds).toContain("currentAge");
  expect(safeQuestionIds).toContain("dailyFoodBudget");
  expect(safeQuestionIds).toContain("basicMedicalBuffer");
});

it("adds abundant-only questions only for abundant tier", () => {
  const baselineQuestionIds = getQuestionsForTier("baseline").map((question) => question.id);
  const abundantQuestionIds = getQuestionsForTier("abundant").map((question) => question.id);

  expect(baselineQuestionIds).not.toContain("privateMedicalBudget");
  expect(abundantQuestionIds).toContain("privateMedicalBudget");
});
