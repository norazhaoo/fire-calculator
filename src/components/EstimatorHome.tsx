import type { ReactNode } from "react";
import { buildReport } from "../domain/report";
import { tierMeta } from "../domain/tiers";
import type { AnswerMap, ScenarioTier } from "../domain/types";
import { questions, getQuestionDefaultValue } from "../domain/questions";
import { FormField } from "./FormField";
import { Questionnaire } from "./Questionnaire";

type EditableSection = "income" | "assets" | "expenses";
type SavedSections = Record<EditableSection, boolean>;

interface EstimatorHomeProps {
  answers: AnswerMap;
  expandedSection: EditableSection | null;
  savedSections: SavedSections;
  tier: ScenarioTier;
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
  onEditSection: (section: EditableSection) => void;
  onSaveSection: (section: EditableSection) => void;
  onReview: () => void;
  onGenerateReport: () => void;
}

const currentAgeQuestion = questions.find((question) => question.id === "currentAge");

export function EstimatorHome({
  answers,
  expandedSection,
  savedSections,
  tier,
  onAnswerChange,
  onEditSection,
  onSaveSection,
  onReview,
  onGenerateReport
}: EstimatorHomeProps) {
  const report = buildReport(answers, tier);
  const selected = report.selected;
  const financial = selected.financial;

  if (!currentAgeQuestion) {
    throw new Error("Missing currentAge question");
  }

  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title">{tierMeta[tier].label} FIRE 估算</h1>
      <p className="section-copy">先填三块核心信息，随时可以直接 Review 或生成粗估报告。</p>

      <div className="home-summary">
        <div className="profile-strip">
          <FormField
            question={currentAgeQuestion}
            value={answers.currentAge?.value ?? getQuestionDefaultValue(currentAgeQuestion, tier)}
            onChange={(value) => onAnswerChange(currentAgeQuestion.id, value)}
          />
        </div>
        <div className="summary-panel">
          <p>预计：{selected.fire.fireAge === null ? "暂无法达成" : `${selected.fire.fireAge} 岁`}</p>
          <p>当前可投资资产：{formatCurrency(financial.assets.investableAssets)}</p>
          <p>年度可投资结余：{formatCurrency(financial.annualContribution)}</p>
        </div>
      </div>

      <div className="home-card-grid">
        <SectionCard
          id="income"
          isExpanded={expandedSection === "income"}
          isSaved={savedSections.income}
          title="收入"
          summary={`年收入：${formatCurrency(financial.income.totalAnnualBeforeFire)}`}
          note="主要影响 FIRE 前结余"
          buttonLabel="编辑收入"
          onEdit={() => onEditSection("income")}
          onSave={() => onSaveSection("income")}
        >
          <Questionnaire
            answers={answers}
            tier={tier}
            section="income"
            onAnswerChange={onAnswerChange}
          />
        </SectionCard>
        <SectionCard
          id="assets"
          isExpanded={expandedSection === "assets"}
          isSaved={savedSections.assets}
          title="资产和投资"
          summary={`可投资资产：${formatCurrency(financial.assets.investableAssets)}`}
          note={`预期收益率：${financial.assets.expectedReturnRate.toFixed(1)}%`}
          buttonLabel="编辑资产和投资"
          onEdit={() => onEditSection("assets")}
          onSave={() => onSaveSection("assets")}
        >
          <Questionnaire
            answers={answers}
            tier={tier}
            section="assets"
            onAnswerChange={onAnswerChange}
          />
        </SectionCard>
        <SectionCard
          id="expenses"
          isExpanded={expandedSection === "expenses"}
          isSaved={savedSections.expenses}
          title="支出"
          summary={`FIRE 后支出：${formatCurrency(financial.expenses.totalRetirementAnnual)}/年`}
          note="主要决定目标资产"
          buttonLabel="编辑支出"
          onEdit={() => onEditSection("expenses")}
          onSave={() => onSaveSection("expenses")}
        >
          <Questionnaire
            answers={answers}
            tier={tier}
            section="expenses"
            onAnswerChange={onAnswerChange}
          />
        </SectionCard>
      </div>

      <div className="action-row">
        <button type="button" onClick={onReview}>
          Review 假设
        </button>
        <button className="primary-button" type="button" onClick={onGenerateReport}>
          生成报告
        </button>
      </div>
    </section>
  );
}

function SectionCard({
  buttonLabel,
  children,
  id,
  isExpanded,
  isSaved,
  note,
  onEdit,
  onSave,
  summary,
  title
}: {
  buttonLabel: string;
  children: ReactNode;
  id: EditableSection;
  isExpanded: boolean;
  isSaved: boolean;
  note: string;
  onEdit: () => void;
  onSave: () => void;
  summary: string;
  title: string;
}) {
  const panelId = `${id}-editor-panel`;

  return (
    <article className={`home-card${isExpanded ? " is-expanded" : ""}`}>
      <div className="home-card-header">
        <div>
          <h2>{title}</h2>
          <span className="home-card-status">{isSaved ? "已保存" : "可直接使用默认值"}</span>
        </div>
        <button
          type="button"
          aria-controls={panelId}
          aria-expanded={isExpanded}
          onClick={isExpanded ? onSave : onEdit}
        >
          {isExpanded ? `保存${title}` : buttonLabel}
        </button>
      </div>
      <strong>{summary}</strong>
      <p>{note}</p>
      {isExpanded ? (
        <div className="home-card-editor" id={panelId}>
          {children}
        </div>
      ) : null}
    </article>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value);
}
