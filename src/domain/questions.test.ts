import { getQuestionsForTier, questions } from "./questions";

it("shows baseline questions for every tier", () => {
  const safeQuestionIds = getQuestionsForTier("safe").map((question) => question.id);

  expect(safeQuestionIds).toContain("currentAge");
  expect(safeQuestionIds).toContain("dailyFoodBudget");
  expect(safeQuestionIds).toContain("basicMedicalBuffer");
});

it("adds abundant-only questions only for abundant tier", () => {
  const baselineQuestionIds = getQuestionsForTier("baseline").map((question) => question.id);
  const safeQuestionIds = getQuestionsForTier("safe").map((question) => question.id);
  const abundantQuestionIds = getQuestionsForTier("abundant").map((question) => question.id);

  expect(baselineQuestionIds).not.toContain("privateMedicalBudget");
  expect(safeQuestionIds).not.toContain("privateMedicalBudget");
  expect(abundantQuestionIds).toContain("privateMedicalBudget");
});

it("keeps question IDs unique", () => {
  const questionIds = questions.map((question) => question.id);

  expect(new Set(questionIds).size).toBe(questionIds.length);
});

it("defines options for select questions", () => {
  const selectQuestions = questions.filter((question) => question.inputType === "select");

  expect(selectQuestions.length).toBeGreaterThan(0);
  expect(selectQuestions.every((question) => question.options && question.options.length > 0)).toBe(
    true
  );
});

it("uses default values present in select question options", () => {
  const selectQuestions = questions.filter((question) => question.inputType === "select");

  expect(
    selectQuestions.every((question) =>
      question.options?.some((option) => option.value === question.defaultValue)
    )
  ).toBe(true);
});
