import { getVisibleAnswers } from "../domain/answers";
import { getQuestionsForTier } from "../domain/questions";
import { tierMeta, tierOrder } from "../domain/tiers";
import type { AnswerMap, ScenarioTier } from "../domain/types";
import { FormField } from "./FormField";

interface ReviewProps {
  answers: AnswerMap;
  tier: ScenarioTier;
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
  onSwitchTier: (tier: ScenarioTier) => void;
  onBack: () => void;
  onGenerateReport: () => void;
}

export function Review({
  answers,
  tier,
  onAnswerChange,
  onSwitchTier,
  onBack,
  onGenerateReport
}: ReviewProps) {
  const visibleAnswers = getVisibleAnswers(answers, tier);
  const questions = getQuestionsForTier(tier);

  return (
    <section aria-labelledby="review-title">
      <h1 id="review-title">{tierMeta[tier].label} Review</h1>
      <div className="tier-switcher" aria-label="切换版本">
        {tierOrder
          .filter((item) => item !== tier)
          .map((item) => (
            <button key={item} type="button" onClick={() => onSwitchTier(item)}>
              切换到{tierMeta[item].label}
            </button>
          ))}
      </div>
      <div className="review-list">
        {questions.map((question) => {
          const answer = visibleAnswers[question.id];

          return (
            <div className="review-row" key={question.id}>
              <FormField
                question={question}
                value={answer?.value ?? question.defaultValue}
                onChange={(value) => onAnswerChange(question.id, value)}
              />
              <span className="source-pill">{answer?.source ?? "default"}</span>
            </div>
          );
        })}
      </div>
      <div className="action-row">
        <button type="button" onClick={onBack}>
          修改问卷
        </button>
        <button className="primary-button" type="button" onClick={onGenerateReport}>
          生成报告
        </button>
      </div>
    </section>
  );
}
