import { createDefaultAnswers } from "./answers";
import { buildReport } from "./report";

it("builds a selected-tier report plus three-tier comparison", () => {
  const report = buildReport(createDefaultAnswers("safe"), "safe");

  expect(report.selectedTier).toBe("safe");
  expect(report.comparison).toHaveLength(3);
  expect(report.comparison.map((row) => row.tier)).toEqual(["baseline", "safe", "abundant"]);
  expect(report.impactItems.length).toBeGreaterThan(0);
});
