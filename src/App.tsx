import { useState } from "react";
import { Questionnaire } from "./components/Questionnaire";
import { Report } from "./components/Report";
import { Review } from "./components/Review";
import { TierSelection } from "./components/TierSelection";
import { createDefaultAnswers, setAnswerValue, switchTier } from "./domain/answers";
import { isDowngrade } from "./domain/tiers";
import type { AnswerMap, QuestionSection, ScenarioTier } from "./domain/types";

type FormStep = "income" | "assets" | "expenses";
type AppStep = "tier" | FormStep | "review" | "report";

export default function App() {
  const [step, setStep] = useState<AppStep>("tier");
  const [selectedTier, setSelectedTier] = useState<ScenarioTier | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});

  function handleSelectTier(tier: ScenarioTier) {
    setSelectedTier(tier);
    setAnswers(createDefaultAnswers(tier));
    setStep("income");
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
    setStep(isDowngrade(selectedTier, nextTier) ? "review" : "income");
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
          onBack={() => setStep("expenses")}
          onGenerateReport={() => setStep("report")}
        />
      </main>
    );
  }

  if (step === "report") {
    return (
      <main className="app-shell">
        <Report answers={answers} tier={selectedTier} onBackToReview={() => setStep("review")} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Questionnaire
        answers={answers}
        tier={selectedTier}
        section={step as QuestionSection}
        title={questionnaireTitle(step)}
        description={questionnaireDescription(step)}
        onAnswerChange={handleAnswerChange}
        onBack={previousStep(step) ? () => setStep(previousStep(step)!) : undefined}
        onNext={() => setStep(nextStep(step))}
      />
    </main>
  );
}

function questionnaireTitle(step: FormStep) {
  if (step === "income") {
    return "收入";
  }

  if (step === "assets") {
    return "资产和投资";
  }

  return "支出";
}

function questionnaireDescription(step: FormStep) {
  if (step === "income") {
    return "收入默认都是 0。按税后到账填写，并勾选 FIRE 后仍会继续的收入。";
  }

  if (step === "assets") {
    return "把资产分桶填写，系统会用计入 FIRE 的资产和加权收益率来模拟达成年限。";
  }

  return "每个大类都能直接填年度估算；不确定时用默认值，想细算时切到明细。";
}

function nextStep(step: FormStep): AppStep {
  if (step === "income") {
    return "assets";
  }

  if (step === "assets") {
    return "expenses";
  }

  return "review";
}

function previousStep(step: FormStep): AppStep | undefined {
  if (step === "assets") {
    return "income";
  }

  if (step === "expenses") {
    return "assets";
  }

  return undefined;
}
