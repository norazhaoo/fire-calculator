import { calculateFireResult } from "./fire";

it("calculates target assets from annual expense and withdrawal rate", () => {
  const result = calculateFireResult({
    currentAge: 30,
    currentAssets: 800000,
    monthlyInvestment: 20000,
    expectedReturnRate: 4.5,
    withdrawalRate: 3.5,
    totalAnnualExpense: 300000
  });

  expect(result.targetAssets).toBeCloseTo(8571428.57, 1);
  expect(result.yearsToFire).toBeGreaterThan(0);
  expect(result.fireAge).toBeGreaterThan(30);
});

it("marks impossible timelines when no contribution and no growth can close the gap", () => {
  const result = calculateFireResult({
    currentAge: 30,
    currentAssets: 0,
    monthlyInvestment: 0,
    expectedReturnRate: 0,
    withdrawalRate: 4,
    totalAnnualExpense: 200000
  });

  expect(result.yearsToFire).toBeNull();
  expect(result.fireAge).toBeNull();
});
