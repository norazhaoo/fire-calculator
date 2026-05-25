import type { ScenarioTier } from "./types";

export const tierOrder: ScenarioTier[] = ["baseline", "safe", "abundant"];

export const tierRank: Record<ScenarioTier, number> = {
  baseline: 0,
  safe: 1,
  abundant: 2
};

export const tierMeta: Record<
  ScenarioTier,
  { label: string; shortLabel: string; description: string }
> = {
  baseline: {
    label: "保底版",
    shortLabel: "保底",
    description: "必要生活稳定，不追求消费升级，重点是尽快自由。"
  },
  safe: {
    label: "安全版",
    shortLabel: "安全",
    description: "维持体面生活，有医疗、大病、父母、孩子等缓冲。"
  },
  abundant: {
    label: "富足版",
    shortLabel: "富足",
    description: "生活选择更宽裕，旅行、教育、医疗、家庭支持都更充分。"
  }
};

export function isUpgrade(from: ScenarioTier, to: ScenarioTier) {
  return tierRank[to] > tierRank[from];
}

export function isDowngrade(from: ScenarioTier, to: ScenarioTier) {
  return tierRank[to] < tierRank[from];
}
