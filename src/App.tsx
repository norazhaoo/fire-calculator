import { useEffect, useState } from "react";
import { EstimatorHome } from "./components/EstimatorHome";
import { Questionnaire } from "./components/Questionnaire";
import { Report } from "./components/Report";
import { Review } from "./components/Review";
import { TierSelection } from "./components/TierSelection";
import { createDefaultAnswers, setAnswerValue, switchTier } from "./domain/answers";
import { isDowngrade } from "./domain/tiers";
import type { AnswerMap, ScenarioTier } from "./domain/types";

type EditableSection = "income" | "assets" | "expenses";
type AppStep = "tier" | "home" | "section" | "review" | "report";

export default function App() {
  const [step, setStep] = useState<AppStep>("tier");
  const [activeSection, setActiveSection] = useState<EditableSection | null>(null);
  const [selectedTier, setSelectedTier] = useState<ScenarioTier | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});

  useEffect(() => {
    if (step !== "tier") {
      window.scrollTo(0, 0);
    }
  }, [activeSection, step]);

  function handleSelectTier(tier: ScenarioTier) {
    setSelectedTier(tier);
    setAnswers(createDefaultAnswers(tier));
    setStep("home");
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
    setStep(isDowngrade(selectedTier, nextTier) ? "review" : "home");
    setActiveSection(null);
    setSelectedTier(nextTier);
  }

  function handleEditSection(section: EditableSection) {
    setActiveSection(section);
    setStep("section");
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
          onBack={() => setStep("home")}
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

  if (step === "home") {
    return (
      <main className="app-shell">
        <EstimatorHome
          answers={answers}
          tier={selectedTier}
          onAnswerChange={handleAnswerChange}
          onEditSection={handleEditSection}
          onReview={() => setStep("review")}
          onGenerateReport={() => setStep("report")}
        />
      </main>
    );
  }

  if (step === "section" && activeSection) {
    return (
      <main className="app-shell">
        <Questionnaire
          answers={answers}
          tier={selectedTier}
          section={activeSection}
          title={questionnaireTitle(activeSection)}
          description={questionnaireDescription(activeSection)}
          onAnswerChange={handleAnswerChange}
          onBack={() => {
            setActiveSection(null);
            setStep("home");
          }}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <EstimatorHome
        answers={answers}
        tier={selectedTier}
        onAnswerChange={handleAnswerChange}
        onEditSection={handleEditSection}
        onReview={() => setStep("review")}
        onGenerateReport={() => setStep("report")}
      />
    </main>
  );
}

function questionnaireTitle(section: EditableSection) {
  if (section === "income") {
    return "收入";
  }

  if (section === "assets") {
    return "资产和投资";
  }

  return "支出";
}

function questionnaireDescription(section: EditableSection) {
  if (section === "income") {
    return "收入默认都是 0。按税后到账填写，并勾选 FIRE 后仍会继续的收入。";
  }

  if (section === "assets") {
    return "把资产分桶填写，系统会用计入 FIRE 的资产和加权收益率来模拟达成年限。";
  }

  return "每个大类都能直接填年度估算；不确定时用默认值，想细算时切到明细。";
}
