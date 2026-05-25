import { useState } from "react";
import { TierSelection } from "./components/TierSelection";
import { tierMeta } from "./domain/tiers";
import type { ScenarioTier } from "./domain/types";

export default function App() {
  const [selectedTier, setSelectedTier] = useState<ScenarioTier | null>(null);

  if (!selectedTier) {
    return (
      <main className="app-shell">
        <TierSelection onSelect={setSelectedTier} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <h1>{tierMeta[selectedTier].label}生活问卷</h1>
    </main>
  );
}
