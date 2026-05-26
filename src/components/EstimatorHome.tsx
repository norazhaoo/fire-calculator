import { buildReport } from "../domain/report";
import { tierMeta } from "../domain/tiers";
import type { AnswerMap, ScenarioTier } from "../domain/types";
import { questions, getQuestionDefaultValue } from "../domain/questions";
import { FormField } from "./FormField";

type EditableSection = "income" | "assets" | "expenses";

interface EstimatorHomeProps {
  answers: AnswerMap;
  tier: ScenarioTier;
  onAnswerChange: (questionId: string, value: number | string | boolean) => void;
  onEditSection: (section: EditableSection) => void;
  onReview: () => void;
  onGenerateReport: () => void;
}

const currentAgeQuestion = questions.find((question) => question.id === "currentAge");

export function EstimatorHome({
  answers,
  tier,
  onAnswerChange,
  onEditSection,
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
          title="收入"
          summary={`年收入：${formatCurrency(financial.income.totalAnnualBeforeFire)}`}
          note="主要影响 FIRE 前结余"
          buttonLabel="编辑收入"
          onClick={() => onEditSection("income")}
        />
        <SectionCard
          title="资产和投资"
          summary={`可投资资产：${formatCurrency(financial.assets.investableAssets)}`}
          note={`预期收益率：${financial.assets.expectedReturnRate.toFixed(1)}%`}
          buttonLabel="编辑资产和投资"
          onClick={() => onEditSection("assets")}
        />
        <SectionCard
          title="支出"
          summary={`FIRE 后支出：${formatCurrency(financial.expenses.totalRetirementAnnual)}/年`}
          note="主要决定目标资产"
          buttonLabel="编辑支出"
          onClick={() => onEditSection("expenses")}
        />
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
  note,
  onClick,
  summary,
  title
}: {
  buttonLabel: string;
  note: string;
  onClick: () => void;
  summary: string;
  title: string;
}) {
  return (
    <article className="home-card">
      <h2>{title}</h2>
      <strong>{summary}</strong>
      <p>{note}</p>
      <button type="button" onClick={onClick}>
        {buttonLabel}
      </button>
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
