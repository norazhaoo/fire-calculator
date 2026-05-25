import { getQuestionsForTier } from "../domain/questions";
import { tierMeta } from "../domain/tiers";
import type { AnswerMap, ScenarioTier } from "../domain/types";
import { FormField } from "./FormField";

interface QuestionnaireProps {
  answers: AnswerMap;
  tier: ScenarioTier;
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
  onReview: () => void;
}

export function Questionnaire({ answers, tier, onAnswerChange, onReview }: QuestionnaireProps) {
  const questions = getQuestionsForTier(tier);

  return (
    <section aria-labelledby="questionnaire-title">
      <h1 id="questionnaire-title">{tierMeta[tier].label}生活问卷</h1>
      <div className="form-grid">
        {questions.map((question) => (
          <FormField
            key={question.id}
            question={question}
            value={answers[question.id]?.value ?? question.defaultValue}
            onChange={(value) => onAnswerChange(question.id, value)}
          />
        ))}
      </div>
      <button className="primary-button" type="button" onClick={onReview}>
        Review 假设
      </button>
    </section>
  );
}
