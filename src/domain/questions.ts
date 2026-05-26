import {
  assetBuckets,
  expenseCategories,
  incomeSources,
  periodOptions,
  reserveItems
} from "./catalog";
import { tierRank } from "./tiers";
import type {
  Question,
  QuestionDefaultValue,
  QuestionSection,
  ScenarioTier
} from "./types";

const allTiers = ["baseline", "safe", "abundant"] as const satisfies readonly ScenarioTier[];

export const questions: Question[] = [
  {
    id: "currentAge",
    label: "当前年龄",
    category: "profile",
    section: "profile",
    inputType: "number",
    unit: "years",
    tiers: allTiers,
    defaultValue: 30,
    behavior: "fact"
  },
  {
    id: "withdrawalRate",
    label: "安全提现率",
    category: "profile",
    section: "profile",
    inputType: "number",
    unit: "percent",
    tiers: allTiers,
    defaultValue: { baseline: 4, safe: 3.5, abundant: 3.2 },
    behavior: "tiered"
  },
  ...incomeSources.flatMap((source) => [
    {
      id: source.amountQuestionId,
      label: `${source.label}${source.period === "annual" ? "（每年）" : "（每月）"}`,
      category: "income",
      section: "income",
      inputType: "number",
      unit: "yuan",
      tiers: allTiers,
      defaultValue: 0,
      behavior: "fact",
      groupId: source.id,
      helperText: source.description
    } satisfies Question,
    {
      id: source.continuesQuestionId,
      label: `${source.label} FIRE 后继续`,
      category: "income",
      section: "income",
      inputType: "boolean",
      tiers: allTiers,
      defaultValue: false,
      behavior: "fact",
      groupId: source.id,
      helperText: "勾选后，这笔收入会在 FIRE 后继续抵扣退休支出。"
    } satisfies Question
  ]),
  ...assetBuckets.flatMap((bucket) => [
    {
      id: bucket.valueQuestionId,
      label: `${bucket.label}金额`,
      category: "assets",
      section: "assets",
      inputType: "number",
      unit: "yuan",
      tiers: allTiers,
      defaultValue: 0,
      behavior: "fact",
      groupId: bucket.id,
      helperText: bucket.description
    } satisfies Question,
    {
      id: bucket.returnRateQuestionId,
      label: `${bucket.label}预期年化收益率`,
      category: "assets",
      section: "assets",
      inputType: "number",
      unit: "percent",
      tiers: allTiers,
      defaultValue: bucket.defaultReturnRate,
      behavior: "fact",
      groupId: bucket.id,
      helperText: "用于模拟资产增长，不代表投资建议。"
    } satisfies Question,
    {
      id: bucket.includeQuestionId,
      label: `${bucket.label}计入 FIRE 资产`,
      category: "assets",
      section: "assets",
      inputType: "boolean",
      tiers: allTiers,
      defaultValue: bucket.defaultIncluded,
      behavior: "fact",
      groupId: bucket.id,
      helperText: "只有可变现或可持续用于生活的资产才建议计入。"
    } satisfies Question
  ]),
  ...expenseCategories.flatMap((category) => [
    {
      id: category.modeQuestionId,
      label: `${category.label}填写方式`,
      category: "expenses",
      section: "expenses",
      inputType: "select",
      tiers: allTiers,
      defaultValue: "quick",
      options: [
        { value: "quick", label: "快速估算总额" },
        { value: "itemized", label: "展开明细" }
      ],
      behavior: "tiered",
      groupId: category.id,
      helperText: category.description
    } satisfies Question,
    {
      id: category.quickAnnualQuestionId,
      label: `${category.label}估算金额`,
      category: "expenses",
      section: "expenses",
      inputType: "number",
      unit: "yuan",
      tiers: allTiers,
      defaultValue: category.quickAnnualDefaults,
      behavior: "tiered",
      groupId: category.id,
      helperText: "不想展开明细时，直接填这个大类的估算金额，再选择对应周期。"
    } satisfies Question,
    {
      id: category.quickPeriodQuestionId,
      label: `${category.label}金额周期`,
      category: "expenses",
      section: "expenses",
      inputType: "select",
      tiers: allTiers,
      defaultValue: "annual",
      options: periodOptions,
      behavior: "tiered",
      groupId: category.id,
      helperText: "系统会把金额按周期自动折算成年支出。"
    } satisfies Question,
    {
      id: category.retirementAnnualQuestionId,
      label: `${category.label} FIRE 后年度支出`,
      category: "review",
      section: "review",
      inputType: "number",
      unit: "yuan",
      tiers: allTiers,
      defaultValue: category.quickAnnualDefaults,
      behavior: "tiered",
      groupId: category.id,
      helperText: "默认等于当前支出，只在 FIRE 后会明显变化时修改。",
      hiddenFromQuestionnaire: true
    } satisfies Question,
    ...category.items.flatMap((item) => [
      {
          id: item.questionId,
          label: item.label,
          category: "expenses",
          section: "expenses",
          inputType: "number",
          unit: "yuan",
          tiers: allTiers,
          defaultValue: item.defaultValue,
          behavior: "tiered",
          groupId: category.id,
          helperText: item.description
        } satisfies Question,
      {
        id: item.periodQuestionId,
        label: `${item.label}周期`,
        category: "expenses",
        section: "expenses",
        inputType: "select",
        tiers: allTiers,
        defaultValue: item.period,
        options: periodOptions,
        behavior: "tiered",
        groupId: category.id,
        helperText: "系统会把金额按周期自动折算成年支出。"
      } satisfies Question
    ])
  ]),
  ...reserveItems.map(
    (item) =>
      ({
        id: item.questionId,
        label: item.label,
        category: "reserves",
        section: "reserves",
        inputType: "number",
        unit: item.id === "emergencyMonths" ? "count" : "yuan",
        tiers: allTiers,
        defaultValue: item.defaultValue,
        behavior: "tiered",
        helperText: item.description
      }) satisfies Question
  )
];

export function getQuestionsForTier(tier: ScenarioTier) {
  return questions.filter((question) => question.tiers.includes(tier));
}

export function getQuestionsForSection(tier: ScenarioTier, section: QuestionSection) {
  return getQuestionsForTier(tier).filter(
    (question) => question.section === section && !question.hiddenFromQuestionnaire
  );
}

export function getQuestionDefaultValue(question: Question, tier: ScenarioTier) {
  const defaultValue = question.defaultValue;

  if (typeof defaultValue !== "object") {
    return defaultValue;
  }

  return defaultValue[tier] ?? defaultValue.baseline ?? 0;
}

export function getTierLevel(question: Question) {
  return Math.min(...question.tiers.map((tier) => tierRank[tier]));
}

export function resolveQuestionDefaultValue(
  defaultValue: QuestionDefaultValue,
  tier: ScenarioTier
) {
  if (typeof defaultValue !== "object") {
    return defaultValue;
  }

  return defaultValue[tier] ?? defaultValue.baseline ?? 0;
}
