import { calculateFireResult } from "./fire";

it("calculates target assets from annual expense and withdrawal rate", () => {
  const result = calculateFireResult({
    currentAge: 30,
    currentAssets: 800000,
    annualContribution: 240000,
    expectedReturnRate: 4.5,
    withdrawalRate: 3.5,
    netAnnualFireExpense: 300000,
    oneTimeReserves: 500000
  });

  expect(result.targetAssets).toBeCloseTo(9071428.57, 1);
  expect(result.yearsToFire).toBeGreaterThan(0);
  expect(result.fireAge).toBeGreaterThan(30);
});

it("marks impossible timelines when no contribution and no growth can close the gap", () => {
  const result = calculateFireResult({
    currentAge: 30,
    currentAssets: 0,
    annualContribution: 0,
    expectedReturnRate: 0,
    withdrawalRate: 4,
    netAnnualFireExpense: 200000,
    oneTimeReserves: 0
  });

  expect(result.yearsToFire).toBeNull();
  expect(result.fireAge).toBeNull();
});

it("returns immediate FIRE when current assets already meet the target", () => {
  const result = calculateFireResult({
    currentAge: 42,
    currentAssets: 1000000,
    annualContribution: 0,
    expectedReturnRate: 0,
    withdrawalRate: 4,
    netAnnualFireExpense: 40000,
    oneTimeReserves: 0
  });

  expect(result.targetAssets).toBe(1000000);
  expect(result.yearsToFire).toBe(0);
  expect(result.fireAge).toBe(42);
  expect(result.projection).toEqual([]);
});

it("returns invalid FIRE timeline when withdrawal rate is not positive", () => {
  const result = calculateFireResult({
    currentAge: 30,
    currentAssets: 1000000,
    annualContribution: 120000,
    expectedReturnRate: 4,
    withdrawalRate: 0,
    netAnnualFireExpense: 200000,
    oneTimeReserves: 0
  });

  expect(result.targetAssets).toBe(Number.POSITIVE_INFINITY);
  expect(result.yearsToFire).toBeNull();
  expect(result.fireAge).toBeNull();
  expect(result.projection).toEqual([]);
});

it("calculates first projection row math", () => {
  const result = calculateFireResult({
    currentAge: 40,
    currentAssets: 100,
    annualContribution: 120,
    expectedReturnRate: 10,
    withdrawalRate: 4,
    netAnnualFireExpense: 1000,
    oneTimeReserves: 0,
    maxYears: 1
  });

  expect(result.projection[0]).toEqual({
    year: 1,
    age: 41,
    startAssets: 100,
    contributions: 120,
    growth: 22,
    endAssets: 242
  });
});

it("clamps negative annual contribution to zero without reducing assets", () => {
  const result = calculateFireResult({
    currentAge: 30,
    currentAssets: 1000,
    annualContribution: -100,
    expectedReturnRate: 0,
    withdrawalRate: 4,
    netAnnualFireExpense: 100000,
    oneTimeReserves: 0,
    maxYears: 1
  });

  expect(result.projection[0]?.contributions).toBe(0);
  expect(result.projection[0]?.endAssets).toBe(1000);
});

it("normalizes non-finite values where calculation can continue", () => {
  const result = calculateFireResult({
    currentAge: Number.NaN,
    currentAssets: Number.NaN,
    annualContribution: Number.POSITIVE_INFINITY,
    expectedReturnRate: Number.NaN,
    withdrawalRate: 4,
    netAnnualFireExpense: 1000,
    oneTimeReserves: Number.NaN,
    maxYears: Number.NaN
  });

  expect(Number.isNaN(result.targetAssets)).toBe(false);
  expect(result.targetAssets).toBe(25000);
  expect(result.projection[0]).toEqual({
    year: 1,
    age: 1,
    startAssets: 0,
    contributions: 0,
    growth: 0,
    endAssets: 0
  });
});
