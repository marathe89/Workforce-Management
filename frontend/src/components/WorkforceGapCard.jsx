import React from 'react';
import { CURRENT_WORKFORCE } from '../data/workforcePlanningData';

// Matches the Coforge Workforce Intelligence Figma "Workforce Gap — Base
// Case" widget (node 8:12023, Workforce Planning page). The current/gap
// split bar and quarterly breakdown now come from whichever scenario is
// selected above (data/workforcePlanningData.js) instead of always
// showing Base Case — current workforce (48,620) is the same across all
// three scenarios; only future demand/gap differs.
function WorkforceGapCard({ scenario }) {
  const currentPct = (CURRENT_WORKFORCE / scenario.required) * 100;

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
          Workforce Gap — {scenario.label}
        </p>
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: scenario.gapColor }}>+{scenario.gap.toLocaleString()} FTE needed</p>
      </div>

      <div className="flex" style={{ height: '48px', borderRadius: '8px', overflow: 'hidden', gap: '2px', marginTop: '16px' }}>
        <div className="flex items-center justify-center" style={{ width: `${currentPct}%`, background: 'var(--w-accent-blue)' }}>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#fff', whiteSpace: 'nowrap' }}>{CURRENT_WORKFORCE.toLocaleString()} Current</p>
        </div>
        <div
          className="flex items-center justify-center"
          style={{
            width: `${100 - currentPct}%`,
            background: `color-mix(in srgb, ${scenario.gapColor} 25%, transparent)`,
            border: `2px dashed ${scenario.gapColor}`,
            borderRadius: '4px',
          }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '11px', color: scenario.gapColor, textAlign: 'center', whiteSpace: 'nowrap' }}>+{scenario.gap.toLocaleString()} Gap</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5" style={{ marginTop: '16px' }}>
        {scenario.quarters.map((q) => (
          <div key={q.label} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '12px' }}>
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>{q.label}</p>
            <div style={{ paddingTop: '8px' }}>
              {q.rows.map(([label, value, color]) => (
                <div key={label} className="flex items-center justify-between" style={{ height: '19px', marginTop: '5px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>{label}</span>
                  <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color }}>+{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--w-divider)', marginTop: '4px', paddingTop: '4px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--w-text-label)' }}>Total</span>
              <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--w-text-primary)' }}>{q.total.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkforceGapCard;
