import React, { useMemo, useState } from 'react';
import SkillBuildPlanModal from './SkillBuildPlanModal';

// Matches the Coforge Workforce Intelligence Figma "Full Skills Inventory"
// table (node 8:10528, Skills Intelligence page). 10 hardcoded rows with
// exact Figma numeric data — same static-mockup convention as the other
// tables in this app. Trend label/color is taken directly per-row from
// Figma rather than derived from a threshold function, since two rows
// share the "critical" label at different colors (Java's critical is
// amber, GenAI's critical is red) — a single threshold couldn't reproduce
// that. Supply/demand/gap are now real numbers (not formatted strings)
// so the columns can actually sort.
//
// Interactive: every column header sorts, a Trend filter narrows rows,
// `query`/`skillFilter` (from the header search deep-link and from
// clicking the stat cards / chart / heatmap above) both filter it too,
// and "Build Plan" opens a real two-step workflow (SkillBuildPlanModal)
// instead of sitting decorative.
const RAW_ROWS = [
  { skill: 'Java', supply: 5820, demand: 5940, trend: 'critical', color: 'var(--w-amber)' },
  { skill: 'AWS', supply: 4210, demand: 4480, trend: 'warning', color: 'var(--w-orange)' },
  { skill: 'GenAI', supply: 820, demand: 1240, trend: 'critical', color: 'var(--w-red)' },
  { skill: 'Data Engineering', supply: 2840, demand: 3190, trend: 'critical', color: 'var(--w-red)' },
  { skill: 'Cybersecurity', supply: 1920, demand: 2140, trend: 'warning', color: 'var(--w-orange)' },
  { skill: 'DevOps', supply: 3100, demand: 3280, trend: 'warning', color: 'var(--w-amber)' },
  { skill: 'React', supply: 2640, demand: 2590, trend: 'balanced', color: 'var(--w-green)' },
  { skill: 'SAP', supply: 1820, demand: 1740, trend: 'surplus', color: 'var(--w-green)' },
  { skill: 'Azure', supply: 2100, demand: 2380, trend: 'warning', color: 'var(--w-orange)' },
  { skill: 'Salesforce', supply: 940, demand: 880, trend: 'surplus', color: 'var(--w-green)' },
];

const ROWS = RAW_ROWS.map((r) => {
  const gap = r.supply - r.demand;
  const gapPct = (gap / r.demand) * 100;
  return { ...r, gap, gapPct: `${gapPct >= 0 ? '+' : ''}${gapPct.toFixed(1)}%` };
});

const COLUMNS = [
  { key: 'skill', label: 'Skill' },
  { key: 'supply', label: 'Supply' },
  { key: 'demand', label: 'Demand' },
  { key: 'gap', label: 'Gap' },
  { key: 'gapPct', label: 'Gap %', sortable: false },
  { key: 'trend', label: 'Trend' },
  { key: 'action', label: 'Action', sortable: false },
];

const fmt = (n) => n.toLocaleString();
const fmtGap = (n) => `${n >= 0 ? '+' : ''}${n.toLocaleString()}`;

// Owned by SkillsIntelligence.jsx — driven by the page's `?q=` URL param
// (header global search) AND by `skillFilter` (clicking a stat card, a
// Skill Gap Analysis bar, or a Skill Gap Heatmap row) — both narrow the
// same table, `query` via substring match, `skillFilter` via exact skill.
function FullSkillsInventoryTable({ query = '', onClearQuery, skillFilter, onClearSkillFilter }, ref) {
  const [sortKey, setSortKey] = useState('gap');
  const [sortDir, setSortDir] = useState('asc');
  const [trendFilter, setTrendFilter] = useState(null);
  const [planModalSkill, setPlanModalSkill] = useState(null);
  const [planned, setPlanned] = useState(new Set());

  const q = query.trim().toLowerCase();

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'skill' || key === 'trend' ? 'asc' : 'desc');
    }
  };

  const filtered = useMemo(() => {
    return ROWS.filter((r) => {
      if (q && !r.skill.toLowerCase().includes(q)) return false;
      if (skillFilter && r.skill !== skillFilter) return false;
      if (trendFilter && r.trend !== trendFilter) return false;
      return true;
    });
  }, [q, skillFilter, trendFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string') {
        const cmp = av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const hasFilter = Boolean(q || skillFilter || trendFilter);
  const clearAll = () => {
    onClearQuery?.();
    onClearSkillFilter?.();
    setTrendFilter(null);
  };

  const planRow = planModalSkill ? ROWS.find((r) => r.skill === planModalSkill) : null;

  return (
    <div ref={ref} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px', scrollMarginTop: '16px' }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
            Full Skills Inventory
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
            {sorted.length} of {ROWS.length} skills shown · click a column header to sort
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasFilter && (
            <button
              onClick={clearAll}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--w-accent-blue)', border: '1px solid var(--w-accent-blue)', borderRadius: '20px', padding: '4px 10px', whiteSpace: 'nowrap' }}
            >
              {[q && `"${query}"`, skillFilter, trendFilter].filter(Boolean).join(' · ')} · Clear ×
            </button>
          )}
          <select
            value={trendFilter || ''}
            onChange={(e) => setTrendFilter(e.target.value || null)}
            style={{
              appearance: 'none', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '5px',
              height: '27px', padding: '0 12px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)',
            }}
          >
            <option value="">All Trends</option>
            <option value="critical">Critical only</option>
            <option value="warning">Warning only</option>
            <option value="balanced">Balanced only</option>
            <option value="surplus">Surplus only</option>
          </select>
        </div>
      </div>

      <div style={{ paddingTop: '14px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--w-divider)' }}>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={c.sortable === false ? undefined : () => toggleSort(c.key)}
                  style={{
                    padding: '0 12px 8px',
                    textAlign: 'left',
                    fontFamily: '"DM Mono", monospace',
                    fontWeight: 500,
                    fontSize: '10px',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    color: sortKey === c.key ? 'var(--w-accent-blue)' : 'var(--w-text-label)',
                    whiteSpace: 'nowrap',
                    cursor: c.sortable === false ? 'default' : 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {c.label}{sortKey === c.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: '32px 12px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-tertiary)' }}>
                  No skill matches the current filter.
                </td>
              </tr>
            )}
            {sorted.map((r) => (
              <tr key={r.skill} style={{ borderBottom: '1px solid var(--w-divider)' }}>
                <td style={{ padding: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-primary)', whiteSpace: 'nowrap' }}>{r.skill}</td>
                <td style={{ padding: '12px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-accent-blue)', whiteSpace: 'nowrap' }}>{fmt(r.supply)}</td>
                <td style={{ padding: '12px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-tertiary)', whiteSpace: 'nowrap' }}>{fmt(r.demand)}</td>
                <td style={{ padding: '12px', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '12px', color: r.color, whiteSpace: 'nowrap' }}>{fmtGap(r.gap)}</td>
                <td style={{ padding: '12px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: r.color, whiteSpace: 'nowrap' }}>{r.gapPct}</td>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      background: `color-mix(in srgb, ${r.color} 13%, transparent)`,
                      color: r.color,
                      borderRadius: '10px',
                      padding: '2px 8px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.trend}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => setPlanModalSkill(r.skill)}
                    style={{
                      border: `1px solid ${planned.has(r.skill) ? 'var(--w-green)' : 'color-mix(in srgb, var(--w-accent-blue) 25%, transparent)'}`,
                      borderRadius: '4px',
                      padding: '5px 10px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: planned.has(r.skill) ? 600 : 400,
                      fontSize: '10px',
                      color: planned.has(r.skill) ? 'var(--w-green)' : 'var(--w-accent-blue)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {planned.has(r.skill) ? '✓ Planned' : 'Build Plan →'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {planRow && (
        <SkillBuildPlanModal
          row={planRow}
          planned={planned.has(planRow.skill)}
          onClose={() => setPlanModalSkill(null)}
          onConfirm={() => setPlanned((prev) => new Set(prev).add(planRow.skill))}
        />
      )}
    </div>
  );
}

export default React.forwardRef(FullSkillsInventoryTable);
