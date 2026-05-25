import { createDefaultAnswers } from "./answers";
import { calculateFireResult, type FireResult } from "./fire";
import { buildLifestyleModel, type LifestyleModel } from "./lifestyleModel";
import { tierOrder } from "./tiers";
import type { AnswerMap, QuestionCategory, ScenarioTier } from "./types";

export interface TierReport {
  tier: ScenarioTier;
  lifestyle: LifestyleModel;
  fire: FireResult;
}

export interface Report {
  selectedTier: ScenarioTier;
  selected: TierReport;
  comparison: TierReport[];
  impactItems: { category: QuestionCategory; annualCost: number }[];
}

export function buildReport(answers: AnswerMap, selectedTier: ScenarioTier): Report {
  const comparison = tierOrder.map((tier) =>
    buildTierReport({ ...createDefaultAnswers(tier), ...answers }, tier)
  );
  const selected = comparison.find((row) => row.tier === selectedTier) ?? comparison[0];
  const impactItems = Object.entries(selected.lifestyle.categories)
    .map(([category, annualCost]) => ({ category: category as QuestionCategory, annualCost }))
    .filter((item) => item.annualCost > 0)
    .sort((a, b) => b.annualCost - a.annualCost)
    .slice(0, 5);

  return {
    selectedTier,
    selected,
    comparison,
    impactItems
  };
}

function buildTierReport(answers: AnswerMap, tier: ScenarioTier): TierReport {
  const lifestyle = buildLifestyleModel(answers, tier);

  return {
    tier,
    lifestyle,
    fire: calculateFireResult({
      currentAge: numberAnswer(answers, "currentAge"),
      currentAssets: numberAnswer(answers, "currentAssets"),
      monthlyInvestment: numberAnswer(answers, "monthlyInvestment"),
      expectedReturnRate: numberAnswer(answers, "expectedReturnRate"),
      withdrawalRate: numberAnswer(answers, "withdrawalRate"),
      totalAnnualExpense: lifestyle.totalAnnualExpense
    })
  };
}

function numberAnswer(answers: AnswerMap, questionId: string) {
  const value = answers[questionId]?.value;

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
