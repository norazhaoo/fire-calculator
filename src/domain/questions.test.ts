import { getQuestionDefaultValue, getQuestionsForSection, getQuestionsForTier, questions } from "./questions";

it("shows core income, asset, and expense questions for every tier", () => {
  const safeQuestionIds = getQuestionsForTier("safe").map((question) => question.id);

  expect(safeQuestionIds).toContain("currentAge");
  expect(safeQuestionIds).toContain("income.fixed.monthly");
  expect(safeQuestionIds).toContain("asset.cash.value");
  expect(safeQuestionIds).toContain("expense.daily.quickAnnual");
  expect(safeQuestionIds).toContain("reserve.majorMedical");
});

it("uses tier-specific defaults for lifestyle expense questions", () => {
  const dailyQuick = questions.find((question) => question.id === "expense.daily.quickAnnual");

  expect(dailyQuick).toBeDefined();
  expect(getQuestionDefaultValue(dailyQuick!, "baseline")).toBe(36000);
  expect(getQuestionDefaultValue(dailyQuick!, "safe")).toBe(60000);
  expect(getQuestionDefaultValue(dailyQuick!, "abundant")).toBe(96000);
});

it("filters questionnaire fields by section", () => {
  const incomeQuestionIds = getQuestionsForSection("safe", "income").map((question) => question.id);
  const expenseQuestionIds = getQuestionsForSection("safe", "expenses").map((question) => question.id);

  expect(incomeQuestionIds).toContain("income.fixed.monthly");
  expect(incomeQuestionIds).not.toContain("expense.daily.quickAnnual");
  expect(expenseQuestionIds).toContain("expense.daily.quickAnnual");
  expect(expenseQuestionIds).not.toContain("expense.daily.retirementAnnual");
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
    selectQuestions.every((question) => {
      const defaultValue = getQuestionDefaultValue(question, "safe");

      return question.options?.some((option) => option.value === defaultValue);
    })
  ).toBe(true);
});
