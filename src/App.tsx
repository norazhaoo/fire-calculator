import { useEffect, useState } from "react";
import { EstimatorHome } from "./components/EstimatorHome";
import { Report } from "./components/Report";
import { Review } from "./components/Review";
import { TierSelection } from "./components/TierSelection";
import { createDefaultAnswers, setAnswerValue, switchTier } from "./domain/answers";
import { isDowngrade } from "./domain/tiers";
import type { AnswerMap, ScenarioTier } from "./domain/types";

type EditableSection = "income" | "assets" | "expenses";
type SavedSections = Record<EditableSection, boolean>;
type AppStep = "tier" | "home" | "review" | "report";

const emptySavedSections: SavedSections = {
  income: false,
  assets: false,
  expenses: false
};

export default function App() {
  const [step, setStep] = useState<AppStep>("tier");
  const [expandedSection, setExpandedSection] = useState<EditableSection | null>(null);
  const [savedSections, setSavedSections] = useState<SavedSections>(emptySavedSections);
  const [selectedTier, setSelectedTier] = useState<ScenarioTier | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});

  useEffect(() => {
    if (step !== "tier") {
      window.scrollTo(0, 0);
    }
  }, [step]);

  function handleSelectTier(tier: ScenarioTier) {
    setSelectedTier(tier);
    setAnswers(createDefaultAnswers(tier));
    setExpandedSection(null);
    setSavedSections(emptySavedSections);
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
    setExpandedSection(null);
    setSelectedTier(nextTier);
  }

  function handleEditSection(section: EditableSection) {
    setExpandedSection(section);
  }

  function handleSaveSection(section: EditableSection) {
    setSavedSections((currentSections) => ({
      ...currentSections,
      [section]: true
    }));
    setExpandedSection(null);
  }

  function goToReview() {
    setExpandedSection(null);
    setStep("review");
  }

  function goToReport() {
    setExpandedSection(null);
    setStep("report");
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
          onGenerateReport={goToReport}
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
          expandedSection={expandedSection}
          savedSections={savedSections}
          tier={selectedTier}
          onAnswerChange={handleAnswerChange}
          onEditSection={handleEditSection}
          onSaveSection={handleSaveSection}
          onReview={goToReview}
          onGenerateReport={goToReport}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <EstimatorHome
        answers={answers}
        expandedSection={expandedSection}
        savedSections={savedSections}
        tier={selectedTier}
        onAnswerChange={handleAnswerChange}
        onEditSection={handleEditSection}
        onSaveSection={handleSaveSection}
        onReview={goToReview}
        onGenerateReport={goToReport}
      />
    </main>
  );
}
