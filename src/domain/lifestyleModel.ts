import type { AnswerMap, QuestionCategory, ScenarioTier } from "./types";

type ExpenseCategories = Record<QuestionCategory, number>;

export interface LifestyleModel {
  tier: ScenarioTier;
  categories: ExpenseCategories;
  totalAnnualExpense: number;
}

const emptyCategories: ExpenseCategories = {
  basics: 0,
  dailyLife: 0,
  housing: 0,
  transport: 0,
  travel: 0,
  largePurchases: 0,
  children: 0,
  family: 0,
  medical: 0
};

const educationAnnualCost: Record<string, number> = {
  none: 0,
  public: 30000,
  private: 120000,
  international: 300000
};

export function buildLifestyleModel(answers: AnswerMap, tier: ScenarioTier): LifestyleModel {
  const categories: ExpenseCategories = { ...emptyCategories };

  categories.dailyLife = numberAnswer(answers, "dailyFoodBudget") * 365;
  categories.housing = numberAnswer(answers, "monthlyHousingCost") * 12;
  categories.travel = numberAnswer(answers, "annualTravelBudget");
  categories.medical =
    annualizedBuffer(numberAnswer(answers, "basicMedicalBuffer")) +
    numberAnswer(answers, "commercialInsuranceAnnual") +
    numberAnswer(answers, "privateMedicalBudget");
  categories.children = educationAnnualCost[stringAnswer(answers, "childrenEducationTrack")] ?? 0;
  categories.family = numberAnswer(answers, "parentsSupportAnnual");
  categories.largePurchases = numberAnswer(answers, "lifestyleUpgradeAnnual");

  const totalAnnualExpense = Object.values(categories).reduce((sum, value) => sum + value, 0);

  return {
    tier,
    categories,
    totalAnnualExpense
  };
}

function numberAnswer(answers: AnswerMap, questionId: string) {
  const value = answers[questionId]?.value;

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stringAnswer(answers: AnswerMap, questionId: string) {
  const value = answers[questionId]?.value;

  return typeof value === "string" ? value : "";
}

function annualizedBuffer(buffer: number) {
  return buffer / 20;
}
