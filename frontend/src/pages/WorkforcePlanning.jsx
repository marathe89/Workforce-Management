import React, { useState } from 'react';
import ScenarioCards from '../components/ScenarioCards';
import WorkforceGapCard from '../components/WorkforceGapCard';
import RecommendedActionsCard from '../components/RecommendedActionsCard';
import { SCENARIOS } from '../data/workforcePlanningData';

// Matches the Coforge Workforce Intelligence Figma "WorkforcePlanning"
// screen (node 8:11949, Workforce Planning nav item). Static Figma mockup
// data throughout — no scenario-planning backend model exists yet — same
// convention as Talent Finder / Projects / Capacity & Utilization /
// Demand Forecast / Skills Intelligence / Bench Management.
//
// This page owns the selected scenario (Base Case / Growth Case /
// Conservative) — data/workforcePlanningData.js has one consistent
// dataset per scenario, and ScenarioCards/WorkforceGapCard/
// RecommendedActionsCard all read from whichever one is selected, so
// switching scenarios actually changes every widget together.
function WorkforcePlanning() {
  const [scenarioKey, setScenarioKey] = useState('base');
  const scenario = SCENARIOS[scenarioKey];

  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
            Strategic Workforce Planning
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
            Planning horizon: Q3 2026 → Q2 2027 · Scenario analysis and recommended actions.
          </p>
        </div>
        <span
          style={{
            background: 'color-mix(in srgb, var(--w-accent-blue) 13%, transparent)',
            border: '1px solid color-mix(in srgb, var(--w-accent-blue) 25%, transparent)',
            borderRadius: '6px',
            padding: '7px 13px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: 'var(--w-accent-blue)',
            whiteSpace: 'nowrap',
          }}
        >
          Aug 2026
        </span>
      </div>

      <ScenarioCards selected={scenarioKey} onSelect={setScenarioKey} />
      <WorkforceGapCard scenario={scenario} />
      <RecommendedActionsCard scenario={scenario} />
    </div>
  );
}

export default WorkforcePlanning;
