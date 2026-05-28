import {
  assetEntries,
  expenseCategories,
  incomeSources,
  propertyEstimatedValueQuestionId
} from "../domain/catalog";
import { getQuestionDefaultValue, questions } from "../domain/questions";
import type { AnswerMap, Question, QuestionSection, ScenarioTier } from "../domain/types";
import { FormField } from "./FormField";

interface QuestionnaireProps {
  answers: AnswerMap;
  tier: ScenarioTier;
  section: Extract<QuestionSection, "income" | "assets" | "expenses">;
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
}

const questionById = new Map(questions.map((question) => [question.id, question]));

export function Questionnaire({
  answers,
  tier,
  section,
  onAnswerChange,
}: QuestionnaireProps) {
  return (
    <>
      {section === "income" ? (
        <IncomeSection
          answers={answers}
          tier={tier}
          onAnswerChange={onAnswerChange}
        />
      ) : null}
      {section === "assets" ? (
        <AssetSection
          answers={answers}
          tier={tier}
          onAnswerChange={onAnswerChange}
        />
      ) : null}
      {section === "expenses" ? (
        <ExpenseSection
          answers={answers}
          tier={tier}
          onAnswerChange={onAnswerChange}
        />
      ) : null}
    </>
  );
}

function IncomeSection({
  answers,
  tier,
  onAnswerChange
}: SectionProps) {
  return (
    <div className="section-stack">
      {incomeSources.map((source) => {
        const amountQuestion = requireQuestion(source.amountQuestionId);
        const continuesQuestion = requireQuestion(source.continuesQuestionId);

        return (
          <article className="entry-card" key={source.id}>
            <div>
              <h2>{source.label}</h2>
              <p className="muted">{source.description}</p>
            </div>
            <div className="paired-fields">
              <FormField
                question={amountQuestion}
                value={answerValue(answers, amountQuestion, tier)}
                onChange={(value) => onAnswerChange(amountQuestion.id, value)}
              />
              <FormField
                question={continuesQuestion}
                value={answerValue(answers, continuesQuestion, tier)}
                onChange={(value) => onAnswerChange(continuesQuestion.id, value)}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function AssetSection({
  answers,
  tier,
  onAnswerChange
}: SectionProps) {
  return (
    <div className="asset-entry-grid">
      {assetEntries.map((entry) => {
        const valueQuestion = requireQuestion(entry.valueQuestionId);
        const secondaryQuestion = requireQuestion(
          entry.id === "property" ? propertyEstimatedValueQuestionId : entry.returnRateQuestionId
        );

        return (
          <article className="entry-card asset-entry-card" key={entry.id}>
            <div>
              <h2>{entry.label}</h2>
              <p className="muted">{entry.description}</p>
              <p className="asset-treatment">{entry.treatment}</p>
            </div>
            <div className="asset-fields">
              <FormField
                question={valueQuestion}
                value={answerValue(answers, valueQuestion, tier)}
                onChange={(value) => onAnswerChange(valueQuestion.id, value)}
              />
              <FormField
                question={secondaryQuestion}
                value={answerValue(answers, secondaryQuestion, tier)}
                onChange={(value) => onAnswerChange(secondaryQuestion.id, value)}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ExpenseSection({
  answers,
  tier,
  onAnswerChange
}: SectionProps) {
  return (
    <div className="expense-stack">
      {expenseCategories.map((category) => {
        const modeQuestion = requireQuestion(category.modeQuestionId);
        const quickQuestion = requireQuestion(category.quickAnnualQuestionId);
        const quickPeriodQuestion = requireQuestion(category.quickPeriodQuestionId);
        const mode = answerValue(answers, modeQuestion, tier);
        const isItemized = mode === "itemized";

        return (
          <article className="expense-card" key={category.id}>
            <div className="expense-card-header">
              <div>
                <h2>{category.label}</h2>
                <p className="muted">{category.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onAnswerChange(modeQuestion.id, isItemized ? "quick" : "itemized")}
              >
                {isItemized ? `收起${category.label}明细` : `展开${category.label}明细`}
              </button>
            </div>
            {isItemized ? (
              <div className="itemized-stack">
                {category.items.map((item) => {
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
          </article>
        );
      })}
    </div>
  );
}

interface SectionProps {
  answers: AnswerMap;
  tier: ScenarioTier;
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
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
