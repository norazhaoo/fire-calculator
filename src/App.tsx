import { useState } from "react";
import { Questionnaire } from "./components/Questionnaire";
import { TierSelection } from "./components/TierSelection";
import { createDefaultAnswers } from "./domain/answers";
import type { AnswerMap, ScenarioTier } from "./domain/types";

type AppStep = "tier" | "questionnaire" | "review" | "report";

export default function App() {
  const [step, setStep] = useState<AppStep>("tier");
  const [selectedTier, setSelectedTier] = useState<ScenarioTier | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});

  function handleSelectTier(tier: ScenarioTier) {
    setSelectedTier(tier);
    setAnswers(createDefaultAnswers(tier));
    setStep("questionnaire");
  }

  if (step === "tier" || !selectedTier) {
    return (
      <main className="app-shell">
        <TierSelection onSelect={handleSelectTier} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Questionnaire
        answers={answers}
        tier={selectedTier}
        onAnswersChange={setAnswers}
        onReview={() => setStep("review")}
      />
    </main>
  );
}
