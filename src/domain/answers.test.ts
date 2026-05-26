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
  expect(answers["income.fixed.monthly"]).toMatchObject({
    value: 0,
    source: "default"
  });
});

it("inherits existing fact answers when upgrading", () => {
  const baseline = setAnswerValue(
    createDefaultAnswers("baseline"),
    "income.fixed.monthly",
    12000,
    "baseline"
  );

  const upgraded = switchTier(baseline, "baseline", "abundant");

  expect(upgraded["income.fixed.monthly"]).toMatchObject({
    value: 12000,
    source: "inherited"
  });
  expect(upgraded["expense.daily.quickAnnual"]).toMatchObject({
    value: 96000,
    source: "default"
  });
});

it("derives lower-tier values when downgrading", () => {
  const abundant = setAnswerValue(
    createDefaultAnswers("abundant"),
    "expense.travel.quickAnnual",
    120000,
    "abundant"
  );

  const downgraded = switchTier(abundant, "abundant", "baseline");

  expect(downgraded["expense.travel.quickAnnual"]).toMatchObject({
    value: 8000,
    source: "derived"
  });
  expect(getVisibleAnswers(downgraded, "baseline")["expense.travel.quickAnnual"]).toBeDefined();
});

it("preserves lower-tier user provenance across upgrade and downgrade", () => {
  const baseline = setAnswerValue(
    createDefaultAnswers("baseline"),
    "income.fixed.monthly",
    12000,
    "baseline"
  );

  const abundant = switchTier(baseline, "baseline", "abundant");
  const returned = switchTier(abundant, "abundant", "baseline");

  expect(returned["income.fixed.monthly"]).toMatchObject({
    value: 12000,
    source: "user",
    editedInTier: "baseline"
  });
});

it("preserves abundant-tier lifestyle provenance across downgrade and upgrade", () => {
  const abundant = setAnswerValue(
    createDefaultAnswers("abundant"),
    "expense.medical.privateMedicalAnnual",
    80000,
    "abundant"
  );

  const baseline = switchTier(abundant, "abundant", "baseline");
  const returned = switchTier(baseline, "baseline", "abundant");

  expect(returned["expense.medical.privateMedicalAnnual"]).toMatchObject({
    value: 80000,
    source: "user",
    editedInTier: "abundant"
  });
});

it("preserves shared higher-tier user provenance across downgrade and upgrade", () => {
  const abundant = setAnswerValue(
    createDefaultAnswers("abundant"),
    "expense.family.parentsSupportMonthly",
    88000,
    "abundant"
  );

  const safe = switchTier(abundant, "abundant", "safe");
  const returned = switchTier(safe, "safe", "abundant");

  expect(returned["expense.family.parentsSupportMonthly"]).toMatchObject({
    value: 88000,
    source: "user",
    editedInTier: "abundant"
  });
});
