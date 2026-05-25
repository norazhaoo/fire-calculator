import { tierRank } from "./tiers";
import type { Question, ScenarioTier } from "./types";

const allTiers: ScenarioTier[] = ["baseline", "safe", "abundant"];
const safeAndUp: ScenarioTier[] = ["safe", "abundant"];
const abundantOnly: ScenarioTier[] = ["abundant"];

export const questions: Question[] = [
  {
    id: "currentAge",
    label: "当前年龄",
    category: "basics",
    inputType: "number",
    unit: "years",
    tiers: allTiers,
    defaultValue: 30
  },
  {
    id: "currentAssets",
    label: "当前可投资资产",
    category: "basics",
    inputType: "number",
    unit: "yuan",
    tiers: allTiers,
    defaultValue: 300000
  },
  {
    id: "monthlyInvestment",
    label: "每月可投资金额",
    category: "basics",
    inputType: "number",
    unit: "yuan",
    tiers: allTiers,
    defaultValue: 10000
  },
  {
    id: "expectedReturnRate",
    label: "预期年化收益率",
    category: "basics",
    inputType: "number",
    unit: "percent",
    tiers: allTiers,
    defaultValue: 4.5
  },
  {
    id: "withdrawalRate",
    label: "安全提现率",
    category: "basics",
    inputType: "number",
    unit: "percent",
    tiers: allTiers,
    defaultValue: 3.5
  },
  {
    id: "dailyFoodBudget",
    label: "每天吃饭预算",
    category: "dailyLife",
    inputType: "number",
    unit: "yuan",
    tiers: allTiers,
    defaultValue: 80
  },
  {
    id: "monthlyHousingCost",
    label: "每月居住成本",
    category: "housing",
    inputType: "number",
    unit: "yuan",
    tiers: allTiers,
    defaultValue: 6000
  },
  {
    id: "annualTravelBudget",
    label: "每年旅游预算",
    category: "travel",
    inputType: "number",
    unit: "yuan",
    tiers: allTiers,
    defaultValue: 15000
  },
  {
    id: "basicMedicalBuffer",
    label: "基础医疗和小额大病缓冲",
    category: "medical",
    inputType: "number",
    unit: "yuan",
    tiers: allTiers,
    defaultValue: 200000
  },
  {
    id: "commercialInsuranceAnnual",
    label: "商业保险年度预算",
    category: "medical",
    inputType: "number",
    unit: "yuan",
    tiers: safeAndUp,
    defaultValue: 12000
  },
  {
    id: "childrenEducationTrack",
    label: "孩子教育路线",
    category: "children",
    inputType: "select",
    tiers: safeAndUp,
    defaultValue: "public",
    options: [
      { value: "none", label: "不要孩子/不计入" },
      { value: "public", label: "公立路线" },
      { value: "private", label: "民办路线" },
      { value: "international", label: "国际学校/留学路线" }
    ]
  },
  {
    id: "parentsSupportAnnual",
    label: "每年父母支持预算",
    category: "family",
    inputType: "number",
    unit: "yuan",
    tiers: safeAndUp,
    defaultValue: 36000
  },
  {
    id: "privateMedicalBudget",
    label: "私立医疗或跨城就医预算",
    category: "medical",
    inputType: "number",
    unit: "yuan",
    tiers: abundantOnly,
    defaultValue: 30000
  },
  {
    id: "lifestyleUpgradeAnnual",
    label: "生活升级预算",
    category: "largePurchases",
    inputType: "number",
    unit: "yuan",
    tiers: abundantOnly,
    defaultValue: 60000
  }
];

export function getQuestionsForTier(tier: ScenarioTier) {
  return questions.filter((question) => question.tiers.includes(tier));
}

export function getTierLevel(question: Question) {
  return Math.min(...question.tiers.map((tier) => tierRank[tier]));
}
