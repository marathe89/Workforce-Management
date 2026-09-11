import React, { useMemo, useState } from 'react';
import { REAL_BUSINESS_UNITS } from '../data/businessUnits';
import useFilterStore from '../stores/filterStore';

// Matches the Coforge Workforce Intelligence Figma "Bench by Business Unit
// & Aging" table (node 8:11226, Bench Management page). Business units
// now match the top filter bar's own dropdown (data/businessUnits.js)
// instead of a separate, inconsistent set of names — same fix already
// applied to Capacity & Utilization / Demand Forecast / this page's own
// Bench Employees table below (whose `unit` field this table's rows now
// line up with, so clicking a row here filters real matching people).
//
// Interactive: every column header sorts, clicking a row filters Bench
// Employees below to that business unit, and selecting a unit in the
// header's own filter bar highlights/narrows this table too.
const RAW_ROWS = [
  { total: 286, d0_15: 132, d16_30: 84, d31_60: 48, d60: 22, cost: 412, matches: 18 },
  { total: 218, d0_15: 104, d16_30: 62, d31_60: 36, d60: 16, cost: 318, matches: 12 },
  { total: 192, d0_15: 88, d16_30: 58, d31_60: 32, d60: 14, cost: 294, matches: 22 },
  { total: 164, d0_15: 76, d16_30: 48, d31_60: 28, d60: 12, cost: 248, matches: 9 },
  { total: 124, d0_15: 58, d16_30: 38, d31_60: 22, d60: 6, cost: 196, matches: 14 },
  { total: 88, d0_15: 42, d16_30: 20, d31_60: 18, d60: 8, cost: 142, matches: 8 },
  { total: 54, d0_15: 24, d16_30: 8, d31_60: 8, d60: 14, cost: 82, matches: 3 },
  { total: 22, d0_15: 12, d16_30: 6, d31_60: 3, d60: 1, cost: 34, matches: 5 },
];

// Indexed 1:1 against REAL_BUSINESS_UNITS so this table can never drift
// out of sync with the header dropdown again.
const ROWS = REAL_BUSINESS_UNITS.map((unit, i) => ({ unit, ...RAW_ROWS[i] }));

const COLUMNS = [
  { key: 'unit', label: 'Business Unit' },
  { key: 'total', label: 'Total Bench' },
  { key: 'd0_15', label: '0–15d' },
  { key: 'd16_30', label: '16–30d' },
  { key: 'd31_60', label: '31–60d' },
  { key: 'd60', label: '60+d' },
  { key: 'cost', label: 'Est. Cost/Mo' },
  { key: 'matches', label: 'AI Opportunities' },
];

function BenchByBusinessUnitTable({ activeUnit, onSelectUnit, sortRequest }) {
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');
  const headerBusinessUnit = useFilterStore((s) => s.applied.businessUnit);

  React.useEffect(() => {
    if (!sortRequest) return;
    setSortKey(sortRequest.key);
    setSortDir(sortRequest.dir);
  }, [sortRequest?.nonce]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'unit' ? 'asc' : 'desc');
    }
  };

  const sorted = useMemo(() => {
    const copy = [...ROWS];
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
  }, [sortKey, sortDir]);

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
          Bench by Business Unit &amp; Aging
        </p>
        {activeUnit && (
          <button
            onClick={() => onSelectUnit(null)}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-accent-blue)', border: '1px solid var(--w-accent-blue)', borderRadius: '20px', padding: '2px 8px', whiteSpace: 'nowrap' }}
          >
            Clear ×
          </button>
        )}
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '11px', lineHeight: '16.5px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
        Click a column header to sort · click a row to filter Bench Employees below
      </p>

      <div style={{ paddingTop: '14px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--w-divider)' }}>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  style={{
                    padding: '0 10px 8px',
                    textAlign: 'left',
                    fontFamily: '"DM Mono", monospace',
                    fontWeight: 500,
                    fontSize: '10px',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    color: sortKey === c.key ? 'var(--w-accent-blue)' : 'var(--w-text-label)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {c.label}{sortKey === c.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const isActive = activeUnit === r.unit;
              const isHeaderMatch = headerBusinessUnit === r.unit;
              return (
                <tr
                  key={r.unit}
                  onClick={() => onSelectUnit(isActive ? null : r.unit)}
                  style={{
                    borderBottom: '1px solid var(--w-divider)',
                    cursor: 'pointer',
                    background: isActive
                      ? 'color-mix(in srgb, var(--w-accent-blue) 12%, transparent)'
                      : isHeaderMatch
                      ? 'color-mix(in srgb, var(--w-accent-blue) 6%, transparent)'
                      : undefined,
                  }}
                >
                  <td style={{ padding: '9px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: isActive ? 'var(--w-accent-blue)' : 'var(--w-text-primary)', whiteSpace: 'nowrap' }}>{r.unit}</td>
                  <td style={{ padding: '9px 10px', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '12px', color: 'var(--w-text-primary)', whiteSpace: 'nowrap' }}>{r.total}</td>
                  <td style={{ padding: '9px 10px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-green)', whiteSpace: 'nowrap' }}>{r.d0_15}</td>
                  <td style={{ padding: '9px 10px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-amber)', whiteSpace: 'nowrap' }}>{r.d16_30}</td>
                  <td style={{ padding: '9px 10px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-orange)', whiteSpace: 'nowrap' }}>{r.d31_60}</td>
                  <td style={{ padding: '9px 10px', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '12px', color: 'var(--w-red)', whiteSpace: 'nowrap' }}>{r.d60}</td>
                  <td style={{ padding: '9px 10px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>${r.cost}k</td>
                  <td style={{ padding: '9px 10px' }}>
                    <span
                      style={{
                        background: 'color-mix(in srgb, var(--w-green) 13%, transparent)',
                        color: 'var(--w-green)',
                        borderRadius: '10px',
                        padding: '2px 8px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.matches} matches
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

export default BenchByBusinessUnitTable;
