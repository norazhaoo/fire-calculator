import { createDefaultAnswers } from "./answers";
import { buildReport } from "./report";

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
  expect(baseline?.lifestyle.categories.children).toBe(0);
  expect(baseline?.lifestyle.categories.family).toBe(0);
  expect(baseline?.lifestyle.categories.medical).toBe(10000);
});

it("does not leak abundant-only expenses into baseline comparison", () => {
  const report = buildReport(createDefaultAnswers("abundant"), "abundant");
  const baseline = report.comparison.find((row) => row.tier === "baseline");
  const abundant = report.comparison.find((row) => row.tier === "abundant");

  expect(baseline).toBeDefined();
  expect(abundant).toBeDefined();
  expect(baseline?.lifestyle.categories.medical).toBe(10000);
  expect(baseline?.lifestyle.categories.largePurchases).toBe(0);
  expect(abundant?.lifestyle.categories.medical).toBeGreaterThan(10000);
  expect(abundant?.lifestyle.categories.largePurchases).toBeGreaterThan(0);
});
