import React from 'react';

// Matches the Coforge Workforce Intelligence Figma "Skills Intelligence"
// top stat-card row (node 8:9908). Exact supply/demand/gap data from the
// dev-mode spec. Unlike the other pages' StatCard, this widget has its own
// two-tile supply/demand layout, so it isn't built on the shared StatCard
// component.
const SKILLS = [
  { name: 'Java', supply: '5,820', demand: '5,940', gap: '-120', gapPct: 105, badge: 'critical', color: 'var(--w-amber)' },
  { name: 'AWS', supply: '4,210', demand: '4,480', gap: '-270', gapPct: 94, badge: 'warning', color: 'var(--w-orange)' },
  { name: 'GenAI', supply: '820', demand: '1,240', gap: '-420', gapPct: 66, badge: 'critical', color: 'var(--w-red)' },
  { name: 'Data Engineering', supply: '2,840', demand: '3,190', gap: '-350', gapPct: 89, badge: 'critical', color: 'var(--w-red)' },
  { name: 'Cybersecurity', supply: '1,920', demand: '2,140', gap: '-220', gapPct: 90, badge: 'warning', color: 'var(--w-orange)' },
];

function SkillCard({ s, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start text-left w-full"
      style={{
        background: 'var(--w-card-bg)',
        borderTop: `2px solid ${active ? 'var(--w-accent-blue)' : `color-mix(in srgb, ${s.color} 19%, transparent)`}`,
        borderRight: `1px solid ${active ? 'var(--w-accent-blue)' : `color-mix(in srgb, ${s.color} 19%, transparent)`}`,
        borderBottom: `1px solid ${active ? 'var(--w-accent-blue)' : `color-mix(in srgb, ${s.color} 19%, transparent)`}`,
        borderLeft: `1px solid ${active ? 'var(--w-accent-blue)' : `color-mix(in srgb, ${s.color} 19%, transparent)`}`,
        borderRadius: '10px',
        padding: '16px',
        cursor: 'pointer',
      }}
    >
      <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '15px', lineHeight: '22.5px', color: 'var(--w-text-primary)' }}>{s.name}</p>

      <div className="flex gap-2 w-full" style={{ paddingTop: '10px' }}>
        <div className="flex-1 flex flex-col items-center" style={{ background: 'var(--w-sunken-bg)', borderRadius: '6px', padding: '8px' }}>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--w-accent-blue)' }}>{s.supply}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)' }}>Supply</p>
        </div>
        <div className="flex-1 flex flex-col items-center" style={{ background: 'var(--w-sunken-bg)', borderRadius: '6px', padding: '8px' }}>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--w-text-tertiary)' }}>{s.demand}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)' }}>Demand</p>
        </div>
      </div>

      <div className="flex items-center justify-between w-full" style={{ paddingTop: '8px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)' }}>Gap</span>
        <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '14px', color: s.color }}>{s.gap}</span>
      </div>

      <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'var(--w-divider)', marginTop: '6px' }}>
        <div style={{ width: `${s.gapPct}%`, height: '4px', borderRadius: '2px', background: s.color }} />
      </div>

      <span
        style={{
          marginTop: '6px',
          background: `color-mix(in srgb, ${s.color} 13%, transparent)`,
          color: s.color,
          borderRadius: '10px',
          padding: '2px 7px',
          fontFamily: '"DM Mono", monospace',
          fontWeight: 500,
          fontSize: '9px',
          letterSpacing: '0.54px',
          textTransform: 'uppercase',
        }}
      >
        {s.badge}
      </span>
    </button>
  );
}

// Clicking a card filters/scrolls the Full Skills Inventory table below
// to that skill (activeSkill/onSelect lifted to SkillsIntelligence.jsx,
// same cross-widget-filter pattern used on Capacity & Utilization /
// Demand Forecast).
function SkillStatCards({ activeSkill, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {SKILLS.map((s) => (
        <SkillCard key={s.name} s={s} active={activeSkill === s.name} onClick={() => onSelect?.(activeSkill === s.name ? null : s.name)} />
      ))}
    </div>
  );
}

export default SkillStatCards;
