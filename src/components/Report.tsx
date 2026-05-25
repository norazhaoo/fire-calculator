import { buildReport } from "../domain/report";
import { tierMeta } from "../domain/tiers";
import type { AnswerMap, ScenarioTier } from "../domain/types";

interface ReportProps {
  answers: AnswerMap;
  tier: ScenarioTier;
  onBackToReview: () => void;
}

const categoryLabels = {
  basics: "基础信息",
  dailyLife: "日常生活",
  housing: "居住",
  transport: "交通",
  travel: "旅游",
  largePurchases: "大件和兴趣",
  children: "孩子教育",
  family: "家庭责任",
  medical: "医疗风险"
};

export function Report({ answers, tier, onBackToReview }: ReportProps) {
  const report = buildReport(answers, tier);
  const selected = report.selected;

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
          {selected.fire.fireAge === null ? "需要补充投资输入" : `${selected.fire.fireAge} 岁`}
        </p>
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
            {categoryLabels[item.category]}：{formatCurrency(item.annualCost)}/年
          </li>
        ))}
      </ol>

      <button type="button" onClick={onBackToReview}>
        返回 Review
      </button>
    </section>
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
