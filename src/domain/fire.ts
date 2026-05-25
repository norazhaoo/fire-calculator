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
  if (input.withdrawalRate <= 0) {
    return {
      targetAssets: Number.POSITIVE_INFINITY,
      yearsToFire: null,
      fireAge: null,
      projection: []
    };
  }

  const targetAssets = input.totalAnnualExpense / (input.withdrawalRate / 100);
  const maxYears = input.maxYears ?? 80;
  const annualContribution = input.monthlyInvestment * 12;
  const annualReturn = input.expectedReturnRate / 100;
  const projection: ProjectionRow[] = [];
  let assets = input.currentAssets;

  if (assets >= targetAssets) {
    return {
      targetAssets,
      yearsToFire: 0,
      fireAge: input.currentAge,
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
      age: input.currentAge + year,
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
        fireAge: input.currentAge + year,
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
