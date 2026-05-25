export interface FireCalculationInput {
  currentAge: number;
  currentAssets: number;
  monthlyInvestment: number;
  expectedReturnRate: number;
  withdrawalRate: number;
  totalAnnualExpense: number;
  maxYears?: number;
}

export interface ProjectionRow {
  year: number;
  age: number;
  startAssets: number;
  contributions: number;
  growth: number;
  endAssets: number;
}

export interface FireResult {
  targetAssets: number;
  yearsToFire: number | null;
  fireAge: number | null;
  projection: ProjectionRow[];
}

export function calculateFireResult(input: FireCalculationInput): FireResult {
  const currentAge = finiteNonNegative(input.currentAge);
  const currentAssets = finiteNonNegative(input.currentAssets);
  const monthlyInvestment = finiteNonNegative(input.monthlyInvestment);
  const expectedReturnRate = finiteNumber(input.expectedReturnRate);
  const withdrawalRate = finiteNumber(input.withdrawalRate);
  const totalAnnualExpense = finiteNonNegative(input.totalAnnualExpense);
  const maxYears = positiveInteger(input.maxYears, 80);

  if (withdrawalRate <= 0) {
    return {
      targetAssets: Number.POSITIVE_INFINITY,
      yearsToFire: null,
      fireAge: null,
      projection: []
    };
  }

  const targetAssets = totalAnnualExpense / (withdrawalRate / 100);
  const annualContribution = monthlyInvestment * 12;
  const annualReturn = expectedReturnRate / 100;
  const projection: ProjectionRow[] = [];
  let assets = currentAssets;

  if (assets >= targetAssets) {
    return {
      targetAssets,
      yearsToFire: 0,
      fireAge: currentAge,
      projection: []
    };
  }

  for (let year = 1; year <= maxYears; year += 1) {
    const startAssets = assets;
    const contributions = annualContribution;
    const growth = (startAssets + contributions) * annualReturn;
    const endAssets = startAssets + contributions + growth;

    projection.push({
      year,
      age: currentAge + year,
      startAssets,
      contributions,
      growth,
      endAssets
    });

    assets = endAssets;

    if (assets >= targetAssets) {
      return {
        targetAssets,
        yearsToFire: year,
        fireAge: currentAge + year,
        projection
      };
    }
  }

  return {
    targetAssets,
    yearsToFire: null,
    fireAge: null,
    projection
  };
}

function finiteNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function finiteNonNegative(value: number) {
  return Math.max(0, finiteNumber(value));
}

function positiveInteger(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;
}
