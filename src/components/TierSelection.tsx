import { tierMeta, tierOrder } from "../domain/tiers";
import type { ScenarioTier } from "../domain/types";

interface TierSelectionProps {
  onSelect: (tier: ScenarioTier) => void;
}

export function TierSelection({ onSelect }: TierSelectionProps) {
  return (
    <section className="tier-selection" aria-labelledby="tier-selection-title">
      <h1 id="tier-selection-title">你想先估算哪一种 FIRE 生活？</h1>
      <div className="tier-grid">
        {tierOrder.map((tier) => (
          <button className="tier-card" key={tier} type="button" onClick={() => onSelect(tier)}>
            <strong>{tierMeta[tier].label}</strong>
            <span>{tierMeta[tier].description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
