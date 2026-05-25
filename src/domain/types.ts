export type ScenarioTier = "baseline" | "safe" | "abundant";

export type AnswerSource = "user" | "inherited" | "derived" | "default";

export type QuestionCategory =
  | "basics"
  | "dailyLife"
  | "housing"
  | "transport"
  | "travel"
  | "largePurchases"
  | "children"
  | "family"
  | "medical";

export type QuestionInputType = "number" | "select" | "boolean";

export interface SelectOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  category: QuestionCategory;
  inputType: QuestionInputType;
  unit?: "yuan" | "percent" | "years" | "count";
  tiers: ScenarioTier[];
  defaultValue: number | string | boolean;
  options?: SelectOption[];
  helperText?: string;
}

export interface Answer {
  questionId: string;
  value: number | string | boolean;
  source: AnswerSource;
  editedInTier: ScenarioTier;
}

export type AnswerMap = Record<string, Answer>;
