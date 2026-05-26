import type { ExpenseCategoryId, ScenarioTier } from "./types";

export type Period = "daily" | "weekly" | "monthly" | "annual";
export type ExpenseEntryMode = "quick" | "itemized";

export interface IncomeSourceDefinition {
  id: string;
  label: string;
  description: string;
  amountQuestionId: string;
  continuesQuestionId: string;
  period: Period;
}

export interface AssetBucketDefinition {
  id: string;
  label: string;
  description: string;
  valueQuestionId: string;
  returnRateQuestionId: string;
  includeQuestionId: string;
  defaultReturnRate: number;
  defaultIncluded: boolean;
}

export interface ExpenseItemDefinition {
  id: string;
  label: string;
  description: string;
  questionId: string;
  periodQuestionId: string;
  period: Period;
  defaultValue: Partial<Record<ScenarioTier, number>>;
}

export interface ExpenseCategoryDefinition {
  id: ExpenseCategoryId;
  label: string;
  description: string;
  modeQuestionId: string;
  quickAnnualQuestionId: string;
  quickPeriodQuestionId: string;
  retirementAnnualQuestionId: string;
  quickAnnualDefaults: Record<ScenarioTier, number>;
  items: ExpenseItemDefinition[];
}

export interface ReserveDefinition {
  id: string;
  label: string;
  description: string;
  questionId: string;
  defaultValue: Record<ScenarioTier, number>;
}

export const periodOptions = [
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
  { value: "annual", label: "每年" }
] as const;

export const incomeSources: IncomeSourceDefinition[] = [
  source("fixed", "固定工资", "稳定工作的税后月收入，比如工资卡每月到账。", "monthly"),
  source("bonus", "奖金/十三薪", "年终奖、项目奖、十三薪等不固定月发的税后收入。", "annual"),
  source("partTime", "兼职/自由职业", "主业之外比较稳定的接单、咨询、写作、课程等收入。", "monthly"),
  source("business", "副业经营", "小生意、店铺、内容账号或其他经营活动带来的净收入。", "monthly"),
  source("rent", "房租收入", "出租房屋、车位或其他资产带来的租金收入。", "monthly"),
  source("investmentCashflow", "投资现金流", "股息、债息、基金分红等可持续现金流，不含资产涨跌。", "monthly"),
  source("other", "其他收入", "不适合放入前面类别的收入，按保守值填写。", "monthly")
];

export const assetBuckets: AssetBucketDefinition[] = [
  bucket("cash", "现金/活期", "随时可用、波动很低的钱，比如现金、活期、货币基金。", 2, true),
  bucket("lowRisk", "低风险理财/债基", "低波动资产，比如存款、国债、债券基金、稳健理财。", 3, true),
  bucket("mediumRisk", "中风险基金/指数", "长期可能有波动但预期收益更高的基金、指数或组合。", 5, true),
  bucket("highRisk", "高风险股票/权益", "波动很大的股票、权益基金、创业投资等高风险资产。", 8, true),
  bucket("home", "自住房", "自己住的房子，默认不卖出变现，所以不计入 FIRE 可投资资产。", 0, false),
  bucket("investmentProperty", "投资房/其他资产", "可出租、可出售或能产生现金流的房产和其他资产。", 2.5, true)
];

export const expenseCategories: ExpenseCategoryDefinition[] = [
  expenseCategory("daily", "日常吃喝用", "每天会发生的吃饭、外卖、日用品、衣物和订阅会员。", { baseline: 36000, safe: 60000, abundant: 96000 }, [
    item("foodDaily", "在家吃饭/普通外食", "自己做饭、食堂、普通工作餐和基础外食。", "daily", { baseline: 80, safe: 120, abundant: 180 }),
    item("diningMonthly", "餐厅/外卖/聚餐", "外卖、餐厅、朋友聚餐等比基础吃饭更弹性的部分。", "monthly", { baseline: 600, safe: 1800, abundant: 4000 }),
    item("necessitiesMonthly", "日用品/衣物/会员", "纸巾洗护、衣服鞋包、视频音乐和软件会员。", "monthly", { baseline: 500, safe: 1200, abundant: 2500 })
  ]),
  expenseCategory("housing", "居住", "为了住在当前或目标城市而持续付出的成本。", { baseline: 48000, safe: 84000, abundant: 144000 }, [
    item("rentOrMortgageMonthly", "房租或房贷", "租金、月供或退休后等价的居住成本。", "monthly", { baseline: 3000, safe: 6000, abundant: 10000 }),
    item("utilitiesMonthly", "物业水电燃气宽带", "物业费、水电燃气、宽带、取暖等居住附带成本。", "monthly", { baseline: 600, safe: 1000, abundant: 1800 }),
    item("maintenanceAnnual", "维修/搬家/家具家电折旧", "维修、搬家、软装和家具家电长期更新。", "annual", { baseline: 4800, safe: 12000, abundant: 24000 })
  ]),
  expenseCategory("transport", "交通", "通勤、打车、公共交通、养车和换车折旧。", { baseline: 6000, safe: 24000, abundant: 60000 }, [
    item("publicMonthly", "公交地铁/打车", "公共交通、网约车、出租车和共享出行。", "monthly", { baseline: 500, safe: 1200, abundant: 2500 }),
    item("carMonthly", "养车油电停车保养", "油费或电费、停车、保险、保养和洗车。", "monthly", { baseline: 0, safe: 1600, abundant: 3500 }),
    item("carReplacementAnnual", "购车/换车年化", "把购车或换车预算摊到每一年。", "annual", { baseline: 0, safe: 4800, abundant: 18000 })
  ]),
  expenseCategory("entertainment", "休闲娱乐", "社交、兴趣、运动、宠物和让生活有质感的日常体验。", { baseline: 12000, safe: 30000, abundant: 72000 }, [
    item("socialMonthly", "社交/人情/礼物", "朋友聚会、红包礼金、节日礼物和社交活动。", "monthly", { baseline: 500, safe: 1500, abundant: 3500 }),
    item("hobbyMonthly", "运动/课程/兴趣", "健身、课程、乐器、摄影、游戏等兴趣投入。", "monthly", { baseline: 300, safe: 800, abundant: 1800 }),
    item("petAnnual", "宠物/宠物医疗", "宠物食品、用品、美容和医疗。", "annual", { baseline: 0, safe: 6000, abundant: 18000 })
  ]),
  expenseCategory("travel", "旅行体验", "短途、国内、出境和长期旅居等体验型支出。", { baseline: 8000, safe: 30000, abundant: 80000 }, [
    item("domesticAnnual", "国内/短途旅行", "周边游、国内长线、回家探亲以外的旅行。", "annual", { baseline: 8000, safe: 18000, abundant: 30000 }),
    item("asiaAnnual", "亚洲/海岛旅行", "亚洲、海岛或中短途出境旅行。", "annual", { baseline: 0, safe: 12000, abundant: 30000 }),
    item("longHaulAnnual", "欧美/长途旅行", "欧美、澳新、长途机票或更长周期旅行。", "annual", { baseline: 0, safe: 0, abundant: 20000 })
  ]),
  expenseCategory("largePurchases", "大件消费", "手机电脑、家具家电、装修维修等低频但金额较大的消费。", { baseline: 8000, safe: 24000, abundant: 60000 }, [
    item("devicesAnnual", "手机电脑相机设备", "手机、电脑、相机、游戏设备等电子产品更新。", "annual", { baseline: 3000, safe: 8000, abundant: 18000 }),
    item("appliancesAnnual", "家具家电更新", "冰箱洗衣机、床垫沙发、空调等大件更新。", "annual", { baseline: 3000, safe: 9000, abundant: 22000 }),
    item("renovationAnnual", "装修维修/消费升级", "装修、局部维修和生活品质升级预算。", "annual", { baseline: 2000, safe: 7000, abundant: 20000 })
  ]),
  expenseCategory("medical", "医疗保险", "保险、门诊、体检、牙眼科、慢性病和更高等级医疗。", { baseline: 18000, safe: 42000, abundant: 90000 }, [
    item("insuranceAnnual", "商业医疗/重疾/意外险", "医保之外的商业医疗、重疾、意外等保费。", "annual", { baseline: 8000, safe: 18000, abundant: 36000 }),
    item("outpatientAnnual", "门诊牙科眼科体检", "门诊、体检、牙科、眼科和常见自费项目。", "annual", { baseline: 6000, safe: 14000, abundant: 24000 }),
    item("privateMedicalAnnual", "私立/异地医疗", "私立医院、跨城就医、陪诊、住宿交通等额外医疗成本。", "annual", { baseline: 4000, safe: 10000, abundant: 30000 })
  ]),
  expenseCategory("family", "家庭责任", "父母支持、父母医疗、护工陪诊和家庭突发支援。", { baseline: 0, safe: 36000, abundant: 80000 }, [
    item("parentsSupportMonthly", "父母日常支持", "每月给父母或长辈的固定支持。", "monthly", { baseline: 0, safe: 2500, abundant: 5000 }),
    item("parentsMedicalAnnual", "父母医疗/陪诊", "父母体检、门诊、买药、陪诊和小额自费。", "annual", { baseline: 0, safe: 6000, abundant: 20000 }),
    item("familyEmergencyAnnual", "家庭突发支持", "亲属急用钱、临时照护和其他家庭兜底。", "annual", { baseline: 0, safe: 0, abundant: 0 })
  ]),
  expenseCategory("children", "子女教育", "孩子从托育、学校、课外班到留学准备的持续支出。", { baseline: 0, safe: 0, abundant: 0 }, [
    item("childcareAnnual", "托育/月嫂/保姆", "低龄阶段托育、月嫂、保姆或育儿支持。", "annual", { baseline: 0, safe: 30000, abundant: 80000 }),
    item("schoolAnnual", "学校/课外班", "学费、课外班、兴趣班、夏令营和学习用品。", "annual", { baseline: 0, safe: 60000, abundant: 240000 }),
    item("studyAbroadAnnual", "大学/留学准备", "大学、海外交换、留学或海外生活准备金。", "annual", { baseline: 0, safe: 0, abundant: 100000 })
  ]),
  expenseCategory("buffer", "其他缓冲", "暂时不好分类的花费、漏记支出和通胀余量。", { baseline: 12000, safe: 24000, abundant: 48000 }, [
    item("miscMonthly", "难分类支出", "临时购物、办事、杂费和不想细分的小额支出。", "monthly", { baseline: 600, safe: 1200, abundant: 2500 }),
    item("inflationAnnual", "通胀/漏记余量", "给价格上涨、记账遗漏和计划外小额支出留余地。", "annual", { baseline: 4800, safe: 9600, abundant: 18000 })
  ])
];

export const reserveItems: ReserveDefinition[] = [
  {
    id: "emergencyMonths",
    label: "生活费安全垫（月）",
    description: "保留几个月的支出作为现金安全垫，应对失业、空窗期和突发情况。",
    questionId: "reserve.emergencyMonths",
    defaultValue: { baseline: 6, safe: 12, abundant: 18 }
  },
  {
    id: "majorMedical",
    label: "大病自费/康复储备",
    description: "重大疾病时医保和商业保险之外的自费、康复、护理和交通住宿。",
    questionId: "reserve.majorMedical",
    defaultValue: { baseline: 200000, safe: 600000, abundant: 1200000 }
  },
  {
    id: "parentsCare",
    label: "父母护理储备",
    description: "父母长期护理、护工、陪诊和养老支持的额外储备。",
    questionId: "reserve.parentsCare",
    defaultValue: { baseline: 0, safe: 200000, abundant: 600000 }
  },
  {
    id: "childrenEducation",
    label: "子女教育一次性储备",
    description: "大学、留学或关键教育节点需要一次性准备的钱。",
    questionId: "reserve.childrenEducation",
    defaultValue: { baseline: 0, safe: 0, abundant: 0 }
  }
];

export function annualize(amount: number, period: Period) {
  if (period === "daily") {
    return amount * 365;
  }

  if (period === "weekly") {
    return amount * 52;
  }

  if (period === "monthly") {
    return amount * 12;
  }

  return amount;
}

function source(
  id: string,
  label: string,
  description: string,
  period: Period
): IncomeSourceDefinition {
  return {
    id,
    label,
    description,
    amountQuestionId: `income.${id}.${period}`,
    continuesQuestionId: `income.${id}.continuesAfterFire`,
    period
  };
}

function bucket(
  id: string,
  label: string,
  description: string,
  defaultReturnRate: number,
  defaultIncluded: boolean
): AssetBucketDefinition {
  return {
    id,
    label,
    description,
    valueQuestionId: `asset.${id}.value`,
    returnRateQuestionId: `asset.${id}.returnRate`,
    includeQuestionId: `asset.${id}.include`,
    defaultReturnRate,
    defaultIncluded
  };
}

function expenseCategory(
  id: ExpenseCategoryId,
  label: string,
  description: string,
  quickAnnualDefaults: Record<ScenarioTier, number>,
  items: Omit<ExpenseItemDefinition, "questionId" | "periodQuestionId">[]
): ExpenseCategoryDefinition {
  return {
    id,
    label,
    description,
    modeQuestionId: `expense.${id}.mode`,
    quickAnnualQuestionId: `expense.${id}.quickAnnual`,
    quickPeriodQuestionId: `expense.${id}.quickPeriod`,
    retirementAnnualQuestionId: `expense.${id}.retirementAnnual`,
    quickAnnualDefaults,
    items: items.map((expenseItem) => ({
      ...expenseItem,
      questionId: `expense.${id}.${expenseItem.id}`,
      periodQuestionId: `expense.${id}.${expenseItem.id}.period`
    }))
  };
}

function item(
  id: string,
  label: string,
  description: string,
  period: Period,
  defaultValue: Partial<Record<ScenarioTier, number>>
): Omit<ExpenseItemDefinition, "questionId" | "periodQuestionId"> {
  return {
    id,
    label,
    description,
    period,
    defaultValue
  };
}
