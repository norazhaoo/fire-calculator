import { getQuestionsForTier, questions } from "./questions";
import { isDowngrade, isUpgrade } from "./tiers";
import type { AnswerMap, ScenarioTier } from "./types";

const questionById = new Map(questions.map((question) => [question.id, question]));

const derivedFallbacks: Record<string, Partial<Record<ScenarioTier, number | string | boolean>>> = {
  annualTravelBudget: {
    baseline: 15000,
    safe: 45000
  },
  basicMedicalBuffer: {
    baseline: 200000,
    safe: 600000
  },
  childrenEducationTrack: {
    baseline: "public",
    safe: "private"
  },
  privateMedicalBudget: {
    baseline: 0,
    safe: 0
  },
  lifestyleUpgradeAnnual: {
    baseline: 0,
    safe: 24000
  }
};

export function createDefaultAnswers(tier: ScenarioTier): AnswerMap {
  return Object.fromEntries(
    getQuestionsForTier(tier).map((question) => [
      question.id,
      {
        questionId: question.id,
        value: question.defaultValue,
        source: "default",
        editedInTier: tier
      }
    ])
  );
}

export function setAnswerValue(
  answers: AnswerMap,
  questionId: string,
  value: number | string | boolean,
  tier: ScenarioTier
): AnswerMap {
  return {
    ...answers,
    [questionId]: {
      questionId,
      value,
      source: "user",
      editedInTier: tier
    }
  };
}

export function getVisibleAnswers(answers: AnswerMap, tier: ScenarioTier): AnswerMap {
  const visibleIds = new Set(getQuestionsForTier(tier).map((question) => question.id));

  return Object.fromEntries(
    Object.entries(answers).filter(([questionId]) => visibleIds.has(questionId))
  );
}

export function switchTier(
  answers: AnswerMap,
  fromTier: ScenarioTier,
  toTier: ScenarioTier
): AnswerMap {
  if (fromTier === toTier) {
    return answers;
  }

  if (isUpgrade(fromTier, toTier)) {
    return upgradeAnswers(answers, toTier);
  }

  if (isDowngrade(fromTier, toTier)) {
    return downgradeAnswers(answers, toTier);
  }

  return answers;
}

function upgradeAnswers(answers: AnswerMap, toTier: ScenarioTier): AnswerMap {
  const next = { ...answers };

  for (const question of getQuestionsForTier(toTier)) {
    const existing = answers[question.id];

    if (existing) {
      next[question.id] = {
        ...existing,
        source:
          existing.source === "user" && existing.editedInTier !== toTier
            ? "inherited"
            : existing.source
      };
    } else {
      next[question.id] = {
        questionId: question.id,
        value: question.defaultValue,
        source: "default",
        editedInTier: toTier
      };
    }
  }

  return next;
}

function downgradeAnswers(answers: AnswerMap, toTier: ScenarioTier): AnswerMap {
  const next = { ...answers };

  for (const question of getQuestionsForTier(toTier)) {
    const fallback = derivedFallbacks[question.id]?.[toTier];
    const existing = answers[question.id];

    if (existing?.editedInTier === toTier) {
      next[question.id] = {
        ...existing,
        source: existing.source === "inherited" ? "user" : existing.source
      };
      continue;
    }

    next[question.id] = {
      questionId: question.id,
      value: fallback ?? existing?.value ?? question.defaultValue,
      source: "derived",
      editedInTier: toTier
    };
  }

  return next;
}

export function getQuestionLabel(questionId: string) {
  return questionById.get(questionId)?.label ?? questionId;
}
