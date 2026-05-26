import { expenseCategories } from "../domain/catalog";
import { buildFinancialModel } from "../domain/financialModel";
import {
  getQuestionDefaultValue,
  getQuestionsForSection,
  questions
} from "../domain/questions";
import { tierMeta, tierOrder } from "../domain/tiers";
import type { AnswerMap, Question, ScenarioTier } from "../domain/types";
import { FormField } from "./FormField";

interface ReviewProps {
  answers: AnswerMap;
  tier: ScenarioTier;
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
  onSwitchTier: (tier: ScenarioTier) => void;
  onBack: () => void;
  onGenerateReport: () => void;
}

const questionById = new Map(questions.map((question) => [question.id, question]));

export function Review({
  answers,
  tier,
  onAnswerChange,
  onSwitchTier,
  onBack,
  onGenerateReport
}: ReviewProps) {
  const model = buildFinancialModel(answers, tier);

  return (
    <section aria-labelledby="review-title">
      <h1 id="review-title">{tierMeta[tier].label} Review</h1>
      <div className="tier-switcher" aria-label="切换版本" role="group">
        {tierOrder
          .filter((item) => item !== tier)
          .map((item) => (
            <button key={item} type="button" onClick={() => onSwitchTier(item)}>
              切换到{tierMeta[item].label}
            </button>
          ))}
      </div>

      <div className="metric-grid">
        <Metric label="年度收入" value={model.income.totalAnnualBeforeFire} />
        <Metric label="FIRE 前年度支出" value={model.expenses.totalCurrentAnnual} />
        <Metric label="年度可投资结余" value={model.annualContribution} />
        <Metric label="当前可投资资产" value={model.assets.investableAssets} />
      </div>

      <ReviewGroup
        answers={answers}
        title="高级假设"
        tier={tier}
        questions={getQuestionsForSection(tier, "profile").filter(
          (question) => question.id === "withdrawalRate"
        )}
        onAnswerChange={onAnswerChange}
      />

      <ReviewGroup
        answers={answers}
        title="收入"
        tier={tier}
        questions={getQuestionsForSection(tier, "income")}
        onAnswerChange={onAnswerChange}
      />
      <ReviewGroup
        answers={answers}
        title="资产和投资"
        tier={tier}
        questions={getQuestionsForSection(tier, "assets")}
        onAnswerChange={onAnswerChange}
      />

      <h2>FIRE 后支出调整</h2>
      <p className="section-copy">默认沿用当前支出；只改退休后会变化的类别。</p>
      <div className="review-list">
        {expenseCategories.map((category) => {
          const categoryModel = model.expenses.categories[category.id];
          const retirementQuestion = requireQuestion(category.retirementAnnualQuestionId);
          const answer = answers[retirementQuestion.id];
          const value =
            answer?.source === "user"
              ? answer.value
              : categoryModel.currentAnnual;

          return (
            <article className="review-row" key={category.id}>
              <div>
                <strong>{category.label}</strong>
                <p className="muted">当前：{formatCurrency(categoryModel.currentAnnual)}/年</p>
              </div>
              <FormField
                question={retirementQuestion}
                value={value}
                onChange={(nextValue) => onAnswerChange(retirementQuestion.id, nextValue)}
              />
              <span className="source-pill">{answer?.source === "user" ? "user" : "default"}</span>
            </article>
          );
        })}
      </div>

      <ReviewGroup
        answers={answers}
        title="一次性风险储备"
        tier={tier}
        questions={getQuestionsForSection(tier, "reserves")}
        onAnswerChange={onAnswerChange}
      />

      <div className="action-row">
        <button type="button" onClick={onBack}>
          返回估算首页
        </button>
        <button className="primary-button" type="button" onClick={onGenerateReport}>
          生成报告
        </button>
      </div>
    </section>
  );
}

function ReviewGroup({
  answers,
  tier,
  title,
  questions: groupQuestions,
  onAnswerChange
}: {
  answers: AnswerMap;
  tier: ScenarioTier;
  title: string;
  questions: Question[];
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
}) {
  return (
    <>
      <h2>{title}</h2>
      <div className="form-grid">
        {groupQuestions.map((question) => (
          <div className="review-field" key={question.id}>
            <FormField
              question={question}
              value={answers[question.id]?.value ?? getQuestionDefaultValue(question, tier)}
              onChange={(value) => onAnswerChange(question.id, value)}
            />
            <span className="source-pill">{answers[question.id]?.source ?? "default"}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{formatCurrency(value)}</strong>
    </div>
  );
}

function requireQuestion(questionId: string) {
  const question = questionById.get(questionId);

  if (!question) {
    throw new Error(`Missing question ${questionId}`);
  }

  return question;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value);
}
