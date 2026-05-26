import { getQuestionDefaultValue, getQuestionsForTier, questions } from "./questions";
import { isDowngrade, isUpgrade } from "./tiers";
import type { Answer, AnswerMap, AnswerSnapshot, ScenarioTier } from "./types";

const questionById = new Map(questions.map((question) => [question.id, question]));

export function createDefaultAnswers(tier: ScenarioTier): AnswerMap {
  return Object.fromEntries(
    getQuestionsForTier(tier).map((question) => {
      const defaultValue = getQuestionDefaultValue(question, tier);

      return [
        question.id,
        {
        questionId: question.id,
        value: defaultValue,
        source: "default",
        editedInTier: tier,
        history: {
          [tier]: {
            value: defaultValue,
            source: "default",
            editedInTier: tier
          }
        }
      }
      ];
    })
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
      editedInTier: tier,
      history: {
        ...answers[questionId]?.history,
        [tier]: {
          value,
          source: "user",
          editedInTier: tier
        }
      }
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
    const history = existing ? saveCurrentSnapshot(existing).history : {};
    const targetSnapshot = history?.[toTier];
    const defaultValue = getQuestionDefaultValue(question, toTier);

    if (targetSnapshot) {
      next[question.id] = answerFromSnapshot(question.id, targetSnapshot, history);
    } else if (
      existing &&
      question.behavior === "tiered" &&
      existing.source === "default" &&
      existing.editedInTier !== toTier
    ) {
      next[question.id] = {
        questionId: question.id,
        value: defaultValue,
        source: "default",
        editedInTier: toTier,
        history: {
          ...history,
          [toTier]: {
            value: defaultValue,
            source: "default",
            editedInTier: toTier
          }
        }
      };
    } else if (existing) {
      next[question.id] = {
        ...existing,
        source:
          existing.source === "user" && existing.editedInTier !== toTier
            ? "inherited"
            : existing.source,
        history
      };
    } else {
      next[question.id] = {
        questionId: question.id,
        value: defaultValue,
        source: "default",
        editedInTier: toTier,
        history: {
          [toTier]: {
            value: defaultValue,
            source: "default",
            editedInTier: toTier
          }
        }
      };
    }
  }

  return next;
}

function downgradeAnswers(answers: AnswerMap, toTier: ScenarioTier): AnswerMap {
  const next = { ...answers };

  for (const question of getQuestionsForTier(toTier)) {
    const existing = answers[question.id];
    const history = existing ? saveCurrentSnapshot(existing).history : {};
    const targetSnapshot = history?.[toTier];
    const defaultValue = getQuestionDefaultValue(question, toTier);

    if (targetSnapshot) {
      next[question.id] = answerFromSnapshot(question.id, targetSnapshot, history);
      continue;
    }

    if (existing && question.behavior === "fact") {
      next[question.id] = {
        ...existing,
        source: existing.source === "user" ? "user" : "derived",
        history
      };
      continue;
    }

    const derivedAnswer: Answer = {
      questionId: question.id,
      value: defaultValue,
      source: "derived",
      editedInTier: toTier,
      history
    };

    next[question.id] = {
      ...derivedAnswer,
      history: saveCurrentSnapshot(derivedAnswer).history
    };
  }

  return next;
}

function saveCurrentSnapshot(answer: Answer): Answer {
  const existingSnapshot = answer.history?.[answer.editedInTier];
  const shouldKeepExistingUserSnapshot =
    existingSnapshot?.source === "user" && answer.source !== "user";

  return {
    ...answer,
    history: {
      ...answer.history,
      [answer.editedInTier]: shouldKeepExistingUserSnapshot ? existingSnapshot : toSnapshot(answer)
    }
  };
}

function answerFromSnapshot(
  questionId: string,
  snapshot: AnswerSnapshot,
  history: Answer["history"]
): Answer {
  return {
    questionId,
    value: snapshot.value,
    source: snapshot.source,
    editedInTier: snapshot.editedInTier,
    history
  };
}

function toSnapshot(answer: Answer): AnswerSnapshot {
  return {
    value: answer.value,
    source: answer.source,
    editedInTier: answer.editedInTier
  };
}

export function getQuestionLabel(questionId: string) {
  return questionById.get(questionId)?.label ?? questionId;
}
