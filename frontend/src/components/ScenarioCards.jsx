import React from 'react';
import { SCENARIOS, SCENARIO_ORDER } from '../data/workforcePlanningData';

// Matches the Coforge Workforce Intelligence Figma "Base Case / Growth
// Case / Conservative" scenario selector (node 8:11962, Workforce Planning
// page). Base Case is still the visually-selected default per Figma, but
// clicking Growth Case / Conservative now actually switches the
// scenario — `selected`/`onSelect` lifted to WorkforcePlanning.jsx so
// the Workforce Gap card and Recommended Actions card below react to the
// same selection instead of only Base Case ever showing real data.
function ScenarioCards({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {SCENARIO_ORDER.map((key) => {
        const s = SCENARIOS[key];
        const isSelected = selected === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            aria-pressed={isSelected}
            className="flex flex-col items-start text-left"
            style={{
              background: isSelected ? 'color-mix(in srgb, var(--w-accent-blue) 8%, transparent)' : 'var(--w-card-bg)',
              border: `2px solid ${isSelected ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`,
              borderRadius: '10px',
              padding: '14px 20px',
              cursor: 'pointer',
            }}
          >
            <p
              style={{
                fontFamily: '"DM Mono", monospace',
                fontWeight: 500,
                fontSize: '11px',
                letterSpacing: '0.44px',
                textTransform: 'uppercase',
                color: isSelected ? 'var(--w-accent-blue)' : 'var(--w-text-label)',
              }}
            >
              {s.label}
            </p>
            <div className="flex gap-4" style={{ paddingTop: '6px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)' }}>Required</p>
                <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)' }}>{s.required.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)' }}>Gap</p>
                <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: s.gapColor }}>+{s.gap.toLocaleString()}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ScenarioCards;
