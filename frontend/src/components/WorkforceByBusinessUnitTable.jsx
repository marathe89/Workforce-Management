import React, { useMemo, useState } from 'react';
import { REAL_BUSINESS_UNITS } from '../data/businessUnits';
import useFilterStore from '../stores/filterStore';

// Matches the Coforge Workforce Intelligence Figma "Workforce by Business
// Unit" table exactly (node 6:9554, Workforce page). Workforce/partial
// alloc/bench/recoverable figures are exact — read directly from Figma's
// text nodes. Utilization bar/text color and the status badge are computed
// from thresholds reverse-engineered from all 8 rows' colors (Figma
// doesn't expose the rule directly): bar+badge are red <82%, amber
// 82-<85%, green >=85%; the % text next to the bar is simpler — green only
// at >=85%, amber otherwise (so a red-bar row still shows amber text,
// exactly as in the source design).
//
// Row names were originally a separate, made-up set ("Digital Services",
// "Technology", ...) that didn't match the header's Business Unit
// dropdown — the exact drift bug businessUnits.js's own comment warns
// about, already fixed on Bench Management/Capacity & Utilization/Demand
// Forecast but missed here. Fixed the same way: renamed 1:1 to
// REAL_BUSINESS_UNITS, in the same order as filterMetrics.js's own
// BUSINESS_UNIT_WEIGHTS (whose headcount shares already match these
// rows' workforce figures almost exactly), so this table, Overview's
// filter model, and the header dropdown now all agree.
//
// Interactive: column headers sort, and clicking a row sets the header's
// global Business Unit filter (useFilterStore) so every other page picks
// it up too — same convention as BenchByBusinessUnitTable. (An "Assign
// Workforce" action column was tried here on an earlier request, then
// removed on request — this table is display + row-select only now.)
const RAW_ROWS = [
  { workforce: 12400, utilization: 84.2, partialAlloc: 1612, bench: 285, recoverable: 790 },
  { workforce: 9800, utilization: 81.6, partialAlloc: 1274, bench: 225, recoverable: 624 },
  { workforce: 7200, utilization: 83.4, partialAlloc: 936, bench: 166, recoverable: 459 },
  { workforce: 6100, utilization: 79.8, partialAlloc: 793, bench: 140, recoverable: 389 },
  { workforce: 5800, utilization: 85.1, partialAlloc: 754, bench: 133, recoverable: 369 },
  { workforce: 4200, utilization: 87.3, partialAlloc: 546, bench: 97, recoverable: 268 },
  { workforce: 2800, utilization: 80.4, partialAlloc: 364, bench: 64, recoverable: 178 },
  { workforce: 1120, utilization: 78.2, partialAlloc: 146, bench: 26, recoverable: 72 },
];

const ROWS = REAL_BUSINESS_UNITS.map((name, i) => ({ name, ...RAW_ROWS[i] }));

const COLUMNS = [
  { key: 'name', label: 'Business Unit' },
  { key: 'workforce', label: 'Workforce' },
  { key: 'utilization', label: 'Utilization' },
  { key: 'partialAlloc', label: 'Partial Alloc' },
  { key: 'bench', label: 'Bench' },
  { key: 'recoverable', label: 'Recoverable' },
];

function tier(utilization) {
  if (utilization >= 85) return 'good';
  if (utilization >= 82) return 'near';
  return 'below';
}

const BAR_COLOR = { good: 'var(--w-green)', near: 'var(--w-amber)', below: 'var(--w-red)' };
const STATUS = {
  good: { label: '✓ On Target', color: 'var(--w-green)' },
  near: { label: '⚠ Near Target', color: 'var(--w-amber)' },
  below: { label: '↓ Below Target', color: 'var(--w-red)' },
};

const th = {
  textAlign: 'left',
  padding: '0 12px 10px 12px',
  fontFamily: '"DM Mono", monospace',
  fontWeight: 500,
  fontSize: '10px',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  color: 'var(--w-text-label)',
  borderBottom: '1px solid var(--w-divider)',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  userSelect: 'none',
};

const td = { padding: '10px 12px', fontSize: '12px', borderBottom: '1px solid var(--w-sunken-bg)', whiteSpace: 'nowrap' };

function WorkforceByBusinessUnitTable() {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const activeUnit = useFilterStore((s) => s.applied.businessUnit);
  const setBusinessUnitNow = useFilterStore((s) => s.setBusinessUnitNow);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return ROWS;
    const rows = [...ROWS];
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [sortKey, sortDir]);

  const selectUnit = (name) => setBusinessUnitNow(activeUnit === name ? 'All Business Units' : name);

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' }}>
      <div className="flex items-center justify-between">
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
          Workforce by Business Unit
        </p>
        {activeUnit !== 'All Business Units' && (
          <button
            onClick={() => setBusinessUnitNow('All Business Units')}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-accent-blue)' }}
          >
            Clear selection ×
          </button>
        )}
      </div>
      <div className="overflow-x-auto" style={{ marginTop: '14px' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} style={th} onClick={() => toggleSort(c.key)}>
                  {c.label} {sortKey === c.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
              ))}
              <th style={{ ...th, cursor: 'default' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const t = tier(row.utilization);
              const textColor = row.utilization >= 85 ? 'var(--w-green)' : 'var(--w-amber)';
              const status = STATUS[t];
              const active = activeUnit === row.name;
              return (
                <tr
                  key={row.name}
                  onClick={() => selectUnit(row.name)}
                  style={{ cursor: 'pointer', background: active ? 'color-mix(in srgb, var(--w-accent-blue) 10%, transparent)' : 'transparent' }}
                >
                  <td style={{ ...td, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: active ? 'var(--w-accent-blue)' : 'var(--w-text-tertiary)' }}>{row.name}</td>
                  <td style={{ ...td, fontFamily: '"DM Mono", monospace', fontWeight: 500, color: 'var(--w-text-primary)' }}>
                    {row.workforce.toLocaleString()}
                  </td>
                  <td style={td}>
                    <div className="flex items-center gap-1.5">
                      <div style={{ width: '60px', height: '4px', borderRadius: '2px', background: 'var(--w-divider)' }}>
                        <div style={{ width: `${row.utilization}%`, height: '4px', borderRadius: '2px', background: BAR_COLOR[t] }} />
                      </div>
                      <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: textColor }}>{row.utilization}%</span>
                    </div>
                  </td>
                  <td style={{ ...td, fontFamily: '"DM Mono", monospace', color: 'var(--w-amber)' }}>{row.partialAlloc.toLocaleString()}</td>
                  <td style={{ ...td, fontFamily: '"DM Mono", monospace', color: 'var(--w-text-tertiary)' }}>{row.bench}</td>
                  <td style={{ ...td, fontFamily: '"DM Mono", monospace', fontWeight: 500, color: 'var(--w-green)' }}>{row.recoverable}</td>
                  <td style={td}>
                    <span
                      style={{
                        display: 'inline-block',
                        borderRadius: '10px',
                        padding: '2px 10px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '10px',
                        color: status.color,
                        background: `color-mix(in srgb, ${status.color} 13%, transparent)`,
                      }}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WorkforceByBusinessUnitTable;
