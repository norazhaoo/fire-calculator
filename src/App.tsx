import { useState } from "react";
import { Questionnaire } from "./components/Questionnaire";
import { Review } from "./components/Review";
import { TierSelection } from "./components/TierSelection";
import { createDefaultAnswers, setAnswerValue, switchTier } from "./domain/answers";
import { isDowngrade } from "./domain/tiers";
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

  function handleAnswerChange(questionId: string, value: number | string | boolean) {
    if (!selectedTier) {
      return;
    }

    setAnswers((currentAnswers) => setAnswerValue(currentAnswers, questionId, value, selectedTier));
  }

  function handleSwitchTier(nextTier: ScenarioTier) {
    if (!selectedTier) {
      return;
    }

    setAnswers((currentAnswers) => switchTier(currentAnswers, selectedTier, nextTier));
    setStep(isDowngrade(selectedTier, nextTier) ? "review" : "questionnaire");
    setSelectedTier(nextTier);
  }

  if (step === "tier" || !selectedTier) {
    return (
      <main className="app-shell">
        <TierSelection onSelect={handleSelectTier} />
      </main>
    );
  }

  if (step === "review") {
    return (
      <main className="app-shell">
        <Review
          answers={answers}
          tier={selectedTier}
          onAnswerChange={handleAnswerChange}
          onSwitchTier={handleSwitchTier}
          onBack={() => setStep("questionnaire")}
          onGenerateReport={() => setStep("report")}
        />
      </main>
    );
  }

  if (step === "report") {
    return (
      <main className="app-shell">
        <section aria-labelledby="report-title">
          <h1 id="report-title">报告生成中</h1>
          <p>报告页面将在下一步接入。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Questionnaire
        answers={answers}
        tier={selectedTier}
        onAnswerChange={handleAnswerChange}
        onReview={() => setStep("review")}
      />
    </main>
  );
}
