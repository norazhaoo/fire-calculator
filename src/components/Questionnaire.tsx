import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  annualize,
  assetBuckets,
  expenseCategories,
  incomeSources
} from "../domain/catalog";
import { buildFinancialModel } from "../domain/financialModel";
import {
  getQuestionDefaultValue,
  getQuestionsForSection,
  questions
} from "../domain/questions";
import type { AnswerMap, Question, QuestionSection, ScenarioTier } from "../domain/types";
import { FormField } from "./FormField";

interface QuestionnaireProps {
  answers: AnswerMap;
  tier: ScenarioTier;
  section: QuestionSection;
  title: string;
  description: string;
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
  onBack?: () => void;
  onNext: () => void;
}

const questionById = new Map(questions.map((question) => [question.id, question]));

export function Questionnaire({
  answers,
  tier,
  section,
  title,
  description,
  onAnswerChange,
  onBack,
  onNext
}: QuestionnaireProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedGroupId(null);
  }, [section]);

  const content = useMemo(() => {
    if (section === "income") {
      return (
        <IncomeSection
          answers={answers}
          selectedGroupId={selectedGroupId}
          tier={tier}
          onAnswerChange={onAnswerChange}
          onOpenGroup={setSelectedGroupId}
        />
      );
    }

    if (section === "assets") {
      return (
        <AssetSection
          answers={answers}
          selectedGroupId={selectedGroupId}
          tier={tier}
          onAnswerChange={onAnswerChange}
          onOpenGroup={setSelectedGroupId}
        />
      );
    }

    if (section === "expenses") {
      return (
        <ExpenseSection
          answers={answers}
          selectedGroupId={selectedGroupId}
          tier={tier}
          onAnswerChange={onAnswerChange}
          onOpenGroup={setSelectedGroupId}
        />
      );
    }

    return (
      <div className="form-grid">
        {getQuestionsForSection(tier, section).map((question) => (
          <FormField
            key={question.id}
            question={question}
            value={answerValue(answers, question, tier)}
            onChange={(value) => onAnswerChange(question.id, value)}
          />
        ))}
      </div>
    );
  }, [answers, onAnswerChange, section, selectedGroupId, tier]);

  return (
    <section aria-labelledby="questionnaire-title">
      <h1 id="questionnaire-title">{title}</h1>
      <p className="section-copy">{description}</p>
      {content}
      <div className="action-row">
        {selectedGroupId ? (
          <button type="button" onClick={() => setSelectedGroupId(null)}>
            返回大类
          </button>
        ) : (
          <>
            {onBack ? (
              <button type="button" onClick={onBack}>
                上一步
              </button>
            ) : null}
            <button className="primary-button" type="button" onClick={onNext}>
              下一步
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function IncomeSection({
  answers,
  selectedGroupId,
  tier,
  onAnswerChange,
  onOpenGroup
}: SectionProps) {
  const selectedSource = incomeSources.find((source) => source.id === selectedGroupId);

  if (selectedSource) {
    return (
      <DetailPanel title={selectedSource.label} description={selectedSource.description}>
        <FormField
          question={requireQuestion(selectedSource.amountQuestionId)}
          value={answerValue(answers, requireQuestion(selectedSource.amountQuestionId), tier)}
          onChange={(value) => onAnswerChange(selectedSource.amountQuestionId, value)}
        />
        <FormField
          question={requireQuestion(selectedSource.continuesQuestionId)}
          value={answerValue(answers, requireQuestion(selectedSource.continuesQuestionId), tier)}
          onChange={(value) => onAnswerChange(selectedSource.continuesQuestionId, value)}
        />
      </DetailPanel>
    );
  }

  return (
    <div className="overview-grid">
      {incomeSources.map((source) => (
        <OverviewCard
          description={source.description}
          key={source.id}
          label={source.label}
          summary={`${formatCurrency(
            annualize(numberAnswer(answers, source.amountQuestionId), source.period)
          )}/年`}
          edited={isEdited(answers, source.amountQuestionId)}
          onClick={() => onOpenGroup(source.id)}
        />
      ))}
    </div>
  );
}

function AssetSection({
  answers,
  selectedGroupId,
  tier,
  onAnswerChange,
  onOpenGroup
}: SectionProps) {
  const selectedBucket = assetBuckets.find((bucket) => bucket.id === selectedGroupId);

  if (selectedBucket) {
    return (
      <DetailPanel title={selectedBucket.label} description={selectedBucket.description}>
        <FormField
          question={requireQuestion(selectedBucket.valueQuestionId)}
          value={answerValue(answers, requireQuestion(selectedBucket.valueQuestionId), tier)}
          onChange={(value) => onAnswerChange(selectedBucket.valueQuestionId, value)}
        />
        <FormField
          question={requireQuestion(selectedBucket.returnRateQuestionId)}
          value={answerValue(answers, requireQuestion(selectedBucket.returnRateQuestionId), tier)}
          onChange={(value) => onAnswerChange(selectedBucket.returnRateQuestionId, value)}
        />
        <FormField
          question={requireQuestion(selectedBucket.includeQuestionId)}
          value={answerValue(answers, requireQuestion(selectedBucket.includeQuestionId), tier)}
          onChange={(value) => onAnswerChange(selectedBucket.includeQuestionId, value)}
        />
      </DetailPanel>
    );
  }

  return (
    <div className="overview-grid">
      {assetBuckets.map((bucket) => {
        const included = booleanAnswer(answers, bucket.includeQuestionId, bucket.defaultIncluded);

        return (
          <OverviewCard
            description={bucket.description}
            key={bucket.id}
            label={bucket.label}
            summary={`${formatCurrency(numberAnswer(answers, bucket.valueQuestionId))} · ${
              included ? "计入 FIRE" : "不计入 FIRE"
            }`}
            edited={isEdited(answers, bucket.valueQuestionId)}
            onClick={() => onOpenGroup(bucket.id)}
          />
        );
      })}
    </div>
  );
}

function ExpenseSection({
  answers,
  selectedGroupId,
  tier,
  onAnswerChange,
  onOpenGroup
}: SectionProps) {
  const selectedCategory = expenseCategories.find((category) => category.id === selectedGroupId);
  const model = buildFinancialModel(answers, tier);

  if (selectedCategory) {
    const modeQuestion = requireQuestion(selectedCategory.modeQuestionId);
    const quickQuestion = requireQuestion(selectedCategory.quickAnnualQuestionId);
    const quickPeriodQuestion = requireQuestion(selectedCategory.quickPeriodQuestionId);
    const mode = answerValue(answers, modeQuestion, tier);
    const isItemized = mode === "itemized";

    return (
      <DetailPanel title={selectedCategory.label} description={selectedCategory.description}>
        <FormField
          question={modeQuestion}
          value={mode}
          onChange={(value) => onAnswerChange(modeQuestion.id, value)}
        />
        {isItemized ? (
          <div className="itemized-stack">
            {selectedCategory.items.map((item) => {
              const itemQuestion = requireQuestion(item.questionId);
              const itemPeriodQuestion = requireQuestion(item.periodQuestionId);

              return (
                <div className="item-row" key={item.id}>
                  <FormField
                    question={itemQuestion}
                    value={answerValue(answers, itemQuestion, tier)}
                    onChange={(value) => onAnswerChange(itemQuestion.id, value)}
                  />
                  <FormField
                    question={itemPeriodQuestion}
                    value={answerValue(answers, itemPeriodQuestion, tier)}
                    onChange={(value) => onAnswerChange(itemPeriodQuestion.id, value)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="item-row">
            <FormField
              question={quickQuestion}
              value={answerValue(answers, quickQuestion, tier)}
              onChange={(value) => onAnswerChange(quickQuestion.id, value)}
            />
            <FormField
              question={quickPeriodQuestion}
              value={answerValue(answers, quickPeriodQuestion, tier)}
              onChange={(value) => onAnswerChange(quickPeriodQuestion.id, value)}
            />
          </div>
        )}
      </DetailPanel>
    );
  }

  return (
    <div className="overview-grid">
      {expenseCategories.map((category) => (
        <OverviewCard
          description={category.description}
          key={category.id}
          label={category.label}
          summary={`${formatCurrency(model.expenses.categories[category.id].currentAnnual)}/年`}
          edited={isEdited(answers, category.quickAnnualQuestionId)}
          onClick={() => onOpenGroup(category.id)}
        />
      ))}
    </div>
  );
}

function DetailPanel({
  children,
  description,
  title
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <article className="detail-panel">
      <h2>{title}</h2>
      <p className="section-copy">{description}</p>
      <div className="detail-fields">{children}</div>
    </article>
  );
}

function OverviewCard({
  description,
  edited,
  label,
  onClick,
  summary
}: {
  description: string;
  edited: boolean;
  label: string;
  onClick: () => void;
  summary: string;
}) {
  return (
    <button className="overview-card" type="button" onClick={onClick}>
      <strong>{label}</strong>
      <span>{description}</span>
      <em>{summary}</em>
      <small>{edited ? "已编辑" : "默认值"}</small>
    </button>
  );
}

interface SectionProps {
  answers: AnswerMap;
  selectedGroupId: string | null;
  tier: ScenarioTier;
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
  onOpenGroup: (groupId: string) => void;
}

function answerValue(answers: AnswerMap, question: Question, tier: ScenarioTier) {
  return answers[question.id]?.value ?? getQuestionDefaultValue(question, tier);
}

function requireQuestion(questionId: string) {
  const question = questionById.get(questionId);

  if (!question) {
    throw new Error(`Missing question ${questionId}`);
  }

  return question;
}

function numberAnswer(answers: AnswerMap, questionId: string, fallback = 0) {
  const value = answers[questionId]?.value;

  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function booleanAnswer(answers: AnswerMap, questionId: string, fallback = false) {
  const value = answers[questionId]?.value;

  return typeof value === "boolean" ? value : fallback;
}

function isEdited(answers: AnswerMap, questionId: string) {
  return answers[questionId]?.source === "user";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value);
}
