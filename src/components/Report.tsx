import { buildReport } from "../domain/report";
import { tierMeta } from "../domain/tiers";
import type { AnswerMap, ScenarioTier } from "../domain/types";

interface ReportProps {
  answers: AnswerMap;
  tier: ScenarioTier;
  onBackToReview: () => void;
}

export function Report({ answers, tier, onBackToReview }: ReportProps) {
  const report = buildReport(answers, tier);
  const selected = report.selected;
  const financial = selected.financial;

  return (
    <section aria-labelledby="report-title">
      <h1 id="report-title">你的 FIRE 估算</h1>
      <div className="summary-panel">
        <p>主版本：{tierMeta[tier].label}</p>
        <p>目标资产：{formatCurrency(selected.fire.targetAssets)}</p>
        <p>
          预计达成：
          {selected.fire.yearsToFire === null ? "暂无法达成" : `${selected.fire.yearsToFire} 年`}
        </p>
        <p>
          预计 FIRE 年龄：
          {selected.fire.fireAge === null ? "需要改善现金流或资产假设" : `${selected.fire.fireAge} 岁`}
        </p>
        {report.cashflowWarning ? <p className="warning-text">{report.cashflowWarning}</p> : null}
        {report.propertyNote ? <p className="section-copy">{report.propertyNote}</p> : null}
      </div>

      <div className="metric-grid">
        <Metric label="年度收入" value={financial.income.totalAnnualBeforeFire} />
        <Metric label="FIRE 前年度支出" value={financial.expenses.totalCurrentAnnual} />
        <Metric label="年度可投资结余" value={financial.annualContribution} />
        <Metric label="当前可投资资产" value={financial.assets.investableAssets} />
        <Metric label="FIRE 后年度支出" value={financial.expenses.totalRetirementAnnual} />
        <Metric label="FIRE 后持续收入" value={financial.income.totalAnnualAfterFire} />
        <Metric label="FIRE 后净支出" value={financial.netAnnualFireExpense} />
        <Metric label="一次性风险储备" value={financial.reserves.oneTimeReserves} />
      </div>

      <h2>三档对比</h2>
      <div className="comparison-grid">
        {report.comparison.map((row) => (
          <article className="comparison-card" key={row.tier}>
            <h3>{tierMeta[row.tier].label}</h3>
            <p>{formatCurrency(row.fire.targetAssets)}</p>
            <span>{row.fire.yearsToFire === null ? "暂无法达成" : `${row.fire.yearsToFire} 年`}</span>
          </article>
        ))}
      </div>

      <h2>最大影响项</h2>
      <ol className="impact-list">
        {report.impactItems.map((item) => (
          <li key={item.category}>
            {item.label}：{formatCurrency(item.annualCost)}/年
          </li>
        ))}
      </ol>

      <button type="button" onClick={onBackToReview}>
        返回 Review
      </button>
    </section>
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

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return "无法计算";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value);
}
