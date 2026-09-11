import React from 'react';
import { REAL_BUSINESS_UNITS } from '../data/businessUnits';

// Matches the Coforge Workforce Intelligence Figma "Skill Gap Heatmap"
// widget (node 8:10211, Skills Intelligence page). 9 skills × business
// units, exact per-cell state taken from Figma's dev-mode spec. Note
// "Shortage" and "Surplus" both render as the letter "S" — only the cell
// color (and legend) distinguish them, exactly as in Figma.
//
// Columns were originally a separate, made-up set ("Digital",
// "Engineering", "Data", "Cloud", "BFS", "Healthcare", "Retail") that
// didn't match the header's Business Unit dropdown — the same drift bug
// businessUnits.js's own comment warns about, already fixed on Bench
// Management/Capacity & Utilization/Demand Forecast/Workforce but missed
// here. Aligned the same way: columns are now REAL_BUSINESS_UNITS itself
// (short display label per column, full name in the header's title
// tooltip), 1:1 in the same order — no reordering, so this table, the
// header dropdown, and every other page's BU breakdown all agree.
const COLUMNS = [
  { short: 'BFS', full: 'Banking and Financial Services (BFS)' },
  { short: 'Insurance', full: 'Insurance' },
  { short: 'TTH', full: 'Travel, Transportation, and Hospitality (TTH)' },
  { short: 'Healthcare/Hi-Tech', full: 'Healthcare and Life Sciences / Hi-Tech' },
  { short: 'Public Sector', full: 'Public Sector & Government' },
  { short: 'Private Equity', full: 'Private Equity Business Unit' },
  { short: 'Momentum AI', full: 'Momentum AI' },
  { short: 'DPA', full: 'Digital Process Automation (DPA)' },
];
// REAL_BUSINESS_UNITS stays the single source of truth for the full
// names above — asserted at module load so the two can never drift
// apart again silently.
if (COLUMNS.map((c) => c.full).join('|') !== REAL_BUSINESS_UNITS.join('|')) {
  // eslint-disable-next-line no-console
  console.warn('SkillGapHeatmap columns are out of sync with REAL_BUSINESS_UNITS');
}

const STATE = {
  surplus: { letter: 'S', color: 'var(--w-green)' },
  balanced: { letter: 'B', color: 'var(--w-accent-blue)' },
  shortage: { letter: 'S', color: 'var(--w-amber)' },
  critical: { letter: 'C', color: 'var(--w-red)' },
};

// `skill` is the short label shown in this widget; `fullName` is the
// matching row name in Full Skills Inventory (they differ for a couple
// of rows — "Data Eng" / "Cybersec" here vs "Data Engineering" /
// "Cybersecurity" there) so clicking through filters the right row. Cell
// order matches COLUMNS 1:1 (BFS, Insurance, TTH, Healthcare/Hi-Tech,
// Public Sector, Private Equity, Momentum AI, DPA).
const ROWS = [
  { skill: 'Java', fullName: 'Java', cells: ['shortage', 'balanced', 'shortage', 'balanced', 'critical', 'shortage', 'balanced', 'shortage'] },
  { skill: 'AWS', fullName: 'AWS', cells: ['shortage', 'shortage', 'balanced', 'critical', 'shortage', 'balanced', 'shortage', 'shortage'] },
  { skill: 'GenAI', fullName: 'GenAI', cells: ['critical', 'critical', 'shortage', 'shortage', 'critical', 'critical', 'critical', 'critical'] },
  { skill: 'Data Eng', fullName: 'Data Engineering', cells: ['shortage', 'balanced', 'critical', 'shortage', 'shortage', 'shortage', 'balanced', 'shortage'] },
  { skill: 'Cybersec', fullName: 'Cybersecurity', cells: ['balanced', 'shortage', 'balanced', 'balanced', 'shortage', 'shortage', 'critical', 'shortage'] },
  { skill: 'SAP', fullName: 'SAP', cells: ['surplus', 'balanced', 'surplus', 'surplus', 'shortage', 'balanced', 'surplus', 'balanced'] },
  { skill: 'DevOps', fullName: 'DevOps', cells: ['shortage', 'balanced', 'shortage', 'critical', 'balanced', 'shortage', 'balanced', 'shortage'] },
  { skill: 'UX', fullName: 'UX', cells: ['balanced', 'shortage', 'balanced', 'surplus', 'balanced', 'balanced', 'shortage', 'balanced'] },
];

const LEGEND = [
  { label: 'Surplus', color: 'var(--w-green)' },
  { label: 'Balanced', color: 'var(--w-accent-blue)' },
  { label: 'Shortage', color: 'var(--w-amber)' },
  { label: 'Critical', color: 'var(--w-red)' },
];

function HeatCell({ state, onClick }) {
  const { letter, color } = STATE[state];
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center"
      style={{
        height: '32px',
        borderRadius: '5px',
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
        cursor: 'pointer',
      }}
    >
      <p style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '10px', color }}>{letter}</p>
    </button>
  );
}

// Clicking a row's skill label or any of its cells filters/scrolls the
// Full Skills Inventory table below to that skill (business unit isn't a
// dimension the table has, so only the skill carries through).
function SkillGapHeatmap({ activeSkill, onSelect }) {
  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px' }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
            Skill Gap Heatmap
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-tertiary)', marginTop: '3px' }}>
            Skill availability by business unit · click a row to filter the inventory below
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: l.color }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Column widths flex to fill whatever width the parent grid gives
          this widget (6/10 columns on Skills Intelligence, see that
          page) rather than a fixed px total — at that width all 8
          business units fit in one view with no horizontal scroll;
          overflow-x stays as a fallback for narrower viewports. */}
      <div style={{ paddingTop: '14px', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '84px repeat(8, minmax(64px, 1fr))', gap: '6px', minWidth: '600px' }}>
          <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '10px', color: 'var(--w-text-label)' }}>Skill</span>
          {COLUMNS.map((c) => (
            <span
              key={c.full}
              title={c.full}
              className="text-center truncate"
              style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '10px', color: 'var(--w-text-label)' }}
            >
              {c.short}
            </span>
          ))}

          {ROWS.map((row) => {
            const rowActive = activeSkill === row.fullName;
            const handleSelect = () => onSelect?.(rowActive ? null : row.fullName);
            return (
              <React.Fragment key={row.skill}>
                <button
                  onClick={handleSelect}
                  className="flex items-center text-left"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: rowActive ? 700 : 400, fontSize: '12px', color: rowActive ? 'var(--w-accent-blue)' : 'var(--w-text-tertiary)', cursor: 'pointer' }}
                >
                  {row.skill}
                </button>
                {row.cells.map((state, i) => (
                  <HeatCell key={i} state={state} onClick={handleSelect} />
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SkillGapHeatmap;
