export type ScenarioTier = "baseline" | "safe" | "abundant";

export type AnswerSource = "user" | "inherited" | "derived" | "default";

export type QuestionSection = "profile" | "income" | "assets" | "expenses" | "reserves" | "review";

export type QuestionCategory = QuestionSection;

export type ExpenseCategoryId =
  | "daily"
  | "housing"
  | "transport"
  | "entertainment"
  | "travel"
  | "largePurchases"
  | "medical"
  | "family"
  | "children"
  | "buffer";

export type QuestionInputType = "number" | "select" | "boolean";

export type QuestionDefaultValue =
  | number
  | string
  | boolean
  | Partial<Record<ScenarioTier, number | string | boolean>>;

export interface SelectOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  category: QuestionCategory;
  section?: QuestionSection;
  inputType: QuestionInputType;
  unit?: "yuan" | "percent" | "years" | "count";
  tiers: readonly ScenarioTier[];
  defaultValue: QuestionDefaultValue;
  options?: readonly SelectOption[];
  helperText?: string;
  groupId?: string;
  behavior?: "fact" | "tiered";
  hiddenFromQuestionnaire?: boolean;
}

export interface Answer {
  questionId: string;
  value: number | string | boolean;
  source: AnswerSource;
  editedInTier: ScenarioTier;
  history?: Partial<Record<ScenarioTier, AnswerSnapshot>>;
}

export interface AnswerSnapshot {
  value: number | string | boolean;
  source: AnswerSource;
  editedInTier: ScenarioTier;
}

export type AnswerMap = Record<string, Answer>;
