import React from 'react';

// Matches the Coforge Workforce Intelligence Figma "Demand Drivers — Next
// 90 Days" widget (node 38:505, Demand Forecast page). Static Figma
// mockup data — exact values from the dev-mode spec.
//
// Now interactive: each driver is tagged with the business units it's
// assumed to be driving demand in (same "assume necessary data"
// convention as the rest of this app's cross-widget filters) — clicking
// one filters & scrolls to the matching rows in the table below, the
// same pattern already used for Capacity & Utilization's stat cards.
export const DRIVERS = [
  { key: 'newProjects', value: '+480 FTE', label: 'New Projects', color: 'var(--w-green)', border: 'color-mix(in srgb, var(--w-green) 19%, transparent)', units: ['Banking and Financial Services (BFS)', 'Insurance', 'Momentum AI'] },
  { key: 'extensions', value: '+320 FTE', label: 'Project Extensions', color: 'var(--w-green)', border: 'color-mix(in srgb, var(--w-green) 19%, transparent)', units: ['Healthcare and Life Sciences / Hi-Tech', 'Travel, Transportation, and Hospitality (TTH)'] },
  { key: 'rollOffs', value: '-210 FTE', label: 'Project Roll-offs', color: 'var(--w-red)', border: 'color-mix(in srgb, var(--w-red) 19%, transparent)', units: ['Public Sector & Government', 'Digital Process Automation (DPA)'] },
  { key: 'accountGrowth', value: '+180 FTE', label: 'Account Growth', color: 'var(--w-green)', border: 'color-mix(in srgb, var(--w-green) 19%, transparent)', units: ['Private Equity Business Unit', 'Banking and Financial Services (BFS)'] },
  { key: 'seasonal', value: '+120 FTE', label: 'Seasonal Demand', color: 'var(--w-accent-blue)', border: 'color-mix(in srgb, var(--w-accent-blue) 19%, transparent)', units: ['Travel, Transportation, and Hospitality (TTH)', 'Insurance'] },
];

function DemandDriversRow({ activeDriver, onSelect }) {
  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' }}>
      <div className="flex items-center justify-between gap-2">
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
          Demand Drivers — Next 90 Days
        </p>
        {activeDriver && (
          <button
            onClick={() => onSelect?.(null)}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-accent-blue)', border: '1px solid var(--w-accent-blue)', borderRadius: '20px', padding: '2px 8px', whiteSpace: 'nowrap' }}
          >
            Clear ×
          </button>
        )}
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '11px', lineHeight: '16.5px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
        Click a driver to filter the business unit table to the units it affects
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3" style={{ paddingTop: '14px' }}>
        {DRIVERS.map((d) => {
          const active = activeDriver === d.key;
          return (
            <button
              key={d.key}
              onClick={() => onSelect?.(active ? null : d.key)}
              className="flex flex-col items-center"
              style={{
                background: active ? 'color-mix(in srgb, var(--w-accent-blue) 10%, var(--w-sunken-bg))' : 'var(--w-sunken-bg)',
                border: `1px solid ${active ? 'var(--w-accent-blue)' : d.border}`,
                borderRadius: '8px', padding: '16px', cursor: 'pointer',
              }}
            >
              <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '22px', lineHeight: '33px', color: d.color }}>{d.value}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-tertiary)', marginTop: '4px', textAlign: 'center' }}>
                {d.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DemandDriversRow;
