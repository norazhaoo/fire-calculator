import {
  createDefaultAnswers,
  getVisibleAnswers,
  setAnswerValue,
  switchTier
} from "./answers";

it("creates editable default answers for the selected tier", () => {
  const answers = createDefaultAnswers("baseline");

  expect(answers.currentAge).toMatchObject({
    value: 30,
    source: "default",
    editedInTier: "baseline"
  });
  expect(answers.privateMedicalBudget).toBeUndefined();
});

it("inherits existing answers when upgrading", () => {
  const baseline = setAnswerValue(
    createDefaultAnswers("baseline"),
    "dailyFoodBudget",
    120,
    "baseline"
  );

  const upgraded = switchTier(baseline, "baseline", "abundant");

  expect(upgraded.dailyFoodBudget).toMatchObject({
    value: 120,
    source: "inherited"
  });
  expect(upgraded.privateMedicalBudget).toMatchObject({
    value: 30000,
    source: "default"
  });
});

it("derives lower-tier values when downgrading", () => {
  const abundant = setAnswerValue(
    createDefaultAnswers("abundant"),
    "annualTravelBudget",
    120000,
    "abundant"
  );

  const downgraded = switchTier(abundant, "abundant", "baseline");

  expect(downgraded.annualTravelBudget).toMatchObject({
    value: 15000,
    source: "derived"
  });
  expect(getVisibleAnswers(downgraded, "baseline").privateMedicalBudget).toBeUndefined();
});

it("preserves lower-tier user provenance across upgrade and downgrade", () => {
  const baseline = setAnswerValue(
    createDefaultAnswers("baseline"),
    "dailyFoodBudget",
    120,
    "baseline"
  );

  const abundant = switchTier(baseline, "baseline", "abundant");
  const returned = switchTier(abundant, "abundant", "baseline");

  expect(returned.dailyFoodBudget).toMatchObject({
    value: 120,
    source: "user",
    editedInTier: "baseline"
  });
});

it("preserves abundant-only user provenance across downgrade and upgrade", () => {
  const abundant = setAnswerValue(
    createDefaultAnswers("abundant"),
    "privateMedicalBudget",
    80000,
    "abundant"
  );

  const baseline = switchTier(abundant, "abundant", "baseline");
  const returned = switchTier(baseline, "baseline", "abundant");

  expect(returned.privateMedicalBudget).toMatchObject({
    value: 80000,
    source: "user",
    editedInTier: "abundant"
  });
});
