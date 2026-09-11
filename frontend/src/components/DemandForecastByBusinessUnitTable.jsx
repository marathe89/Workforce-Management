import React, { useMemo, useState } from 'react';
import { REAL_BUSINESS_UNITS } from '../data/businessUnits';
import useFilterStore, { DEFAULTS as FILTER_DEFAULTS } from '../stores/filterStore';
import PlanPopover from './PlanPopover';

// Matches the Coforge Workforce Intelligence Figma "Demand Forecast by
// Business Unit" table (node 38:551, Demand Forecast page). Business
// units now match the top filter bar's own Business Unit dropdown
// (data/businessUnits.js) instead of a separate, inconsistent set of
// names ("Digital Services", "Retail", ...) — same fix already applied
// to Capacity & Utilization / Overview. Values are new assumed-but-
// internally-consistent numbers for the real 8 units (this app's
// established "assume necessary numbers" convention) — every field is a
// real number now (not a formatted string), so columns can actually sort.
//
// Interactive: every column header sorts, a risk-level filter narrows
// the rows, selecting a Business Unit in the header filter bar
// highlights/filters the matching row here too, and "Plan →" opens a
// real popover (PlanPopover.jsx) instead of sitting decorative.
const RAW_ROWS = [
  { unit: 'Banking and Financial Services (BFS)', current: 12400, q3: 13200, q4: 14800, risk: 'High' },
  { unit: 'Insurance', current: 8600, q3: 9300, q4: 10700, risk: 'Critical' },
  { unit: 'Travel, Transportation, and Hospitality (TTH)', current: 6400, q3: 6800, q4: 7500, risk: 'Medium' },
  { unit: 'Healthcare and Life Sciences / Hi-Tech', current: 7200, q3: 7600, q4: 8400, risk: 'Medium' },
  { unit: 'Public Sector & Government', current: 5200, q3: 5300, q4: 5600, risk: 'Low' },
  { unit: 'Private Equity Business Unit', current: 3800, q3: 4200, q4: 5100, risk: 'High' },
  { unit: 'Momentum AI', current: 4600, q3: 5400, q4: 6900, risk: 'Critical' },
  { unit: 'Digital Process Automation (DPA)', current: 4800, q3: 4900, q4: 5200, risk: 'Low' },
];

// Indexed 1:1 against REAL_BUSINESS_UNITS so this table can never drift
// out of sync with the header dropdown again.
const ROWS = REAL_BUSINESS_UNITS.map((unit, i) => {
  const r = RAW_ROWS[i];
  return { unit, current: r.current, q3: r.q3, q4: r.q4, q3Gap: r.q3 - r.current, q4Gap: r.q4 - r.current, risk: r.risk };
});

const RISK_STYLE = {
  High: { color: 'var(--w-orange)', bg: 'color-mix(in srgb, var(--w-orange) 13%, transparent)' },
  Critical: { color: 'var(--w-red)', bg: 'color-mix(in srgb, var(--w-red) 13%, transparent)' },
  Medium: { color: 'var(--w-amber)', bg: 'color-mix(in srgb, var(--w-amber) 13%, transparent)' },
  Low: { color: 'var(--w-green)', bg: 'color-mix(in srgb, var(--w-green) 13%, transparent)' },
};
const RISK_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const COLUMNS = [
  { key: 'unit', label: 'Business Unit' },
  { key: 'current', label: 'Current Workforce' },
  { key: 'q3', label: 'Q3 Demand' },
  { key: 'q4', label: 'Q4 Demand' },
  { key: 'q3Gap', label: 'Q3 Gap' },
  { key: 'q4Gap', label: 'Q4 Gap' },
  { key: 'risk', label: 'Risk Level' },
  { key: 'action', label: 'Action', sortable: false },
];

const fmt = (n) => n.toLocaleString();
const fmtGap = (n) => `${n >= 0 ? '+' : ''}${n.toLocaleString()}`;

function DemandForecastByBusinessUnitTable({ unitFilter, riskFilter, onRiskFilterChange, onClearUnitFilter }, ref) {
  const [sortKey, setSortKey] = useState('q4Gap');
  const [sortDir, setSortDir] = useState('desc');
  const [planned, setPlanned] = useState(new Set());
  const headerBusinessUnit = useFilterStore((s) => s.applied.businessUnit);

  const togglePlanned = (unit) => setPlanned((prev) => { const next = new Set(prev); next.has(unit) ? next.delete(unit) : next.add(unit); return next; });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'unit' || key === 'risk' ? 'asc' : 'desc');
    }
  };

  // A Business Unit picked in the top header filter bar narrows this
  // table too, on top of any local risk filter or driver-card filter.
  const effectiveUnitFilter = unitFilter || (headerBusinessUnit !== FILTER_DEFAULTS.businessUnit ? [headerBusinessUnit] : null);

  const filtered = useMemo(() => {
    return ROWS.filter((r) => {
      if (effectiveUnitFilter && !effectiveUnitFilter.includes(r.unit)) return false;
      if (riskFilter && r.risk !== riskFilter) return false;
      return true;
    });
  }, [effectiveUnitFilter, riskFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let av = sortKey === 'risk' ? RISK_ORDER[a.risk] : a[sortKey];
      let bv = sortKey === 'risk' ? RISK_ORDER[b.risk] : b[sortKey];
      if (typeof av === 'string') {
        const cmp = av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  return (
    <div ref={ref} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px', scrollMarginTop: '16px' }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
            Demand Forecast by Business Unit
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
            {sorted.length} of {ROWS.length} business units shown · click a column header to sort
            {headerBusinessUnit !== FILTER_DEFAULTS.businessUnit && !unitFilter && ` · narrowed by header filter (${headerBusinessUnit})`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unitFilter && (
            <button
              onClick={onClearUnitFilter}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-accent-blue)', border: '1px solid var(--w-accent-blue)', borderRadius: '20px', padding: '4px 10px', whiteSpace: 'nowrap' }}
            >
              {unitFilter.length === 1 ? unitFilter[0] : `${unitFilter.length} units`} · Clear ×
            </button>
          )}
          <select
            value={riskFilter || ''}
            onChange={(e) => onRiskFilterChange(e.target.value || null)}
            style={{
              appearance: 'none', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '5px',
              height: '27px', padding: '0 12px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)',
            }}
          >
            <option value="">All Risk Levels</option>
            <option value="Critical">Critical only</option>
            <option value="High">High only</option>
            <option value="Medium">Medium only</option>
            <option value="Low">Low only</option>
          </select>
        </div>
      </div>

      <div style={{ paddingTop: '14px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--w-divider)' }}>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={c.sortable === false ? undefined : () => toggleSort(c.key)}
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
            {sorted.map((r) => {
              const risk = RISK_STYLE[r.risk];
              const isHeaderMatch = headerBusinessUnit === r.unit;
              return (
                <tr key={r.unit} style={{ borderBottom: '1px solid var(--w-divider)', background: isHeaderMatch ? 'color-mix(in srgb, var(--w-accent-blue) 6%, transparent)' : undefined }}>
                  <td style={{ padding: '12px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-primary)', whiteSpace: 'nowrap' }}>{r.unit}</td>
                  <td style={{ padding: '12px 10px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>{fmt(r.current)}</td>
                  <td style={{ padding: '12px 10px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-tertiary)', whiteSpace: 'nowrap' }}>{fmt(r.q3)}</td>
                  <td style={{ padding: '12px 10px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-tertiary)', whiteSpace: 'nowrap' }}>{fmt(r.q4)}</td>
                  <td style={{ padding: '12px 10px', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '12px', color: 'var(--w-amber)', whiteSpace: 'nowrap' }}>{fmtGap(r.q3Gap)}</td>
                  <td style={{ padding: '12px 10px', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '12px', color: 'var(--w-red)', whiteSpace: 'nowrap' }}>{fmtGap(r.q4Gap)}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ background: risk.bg, color: risk.color, borderRadius: '10px', padding: '2px 8px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', whiteSpace: 'nowrap' }}>
                      {r.risk}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <PlanPopover row={r} planned={planned.has(r.unit)} onTogglePlanned={() => togglePlanned(r.unit)} />
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: '24px 10px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>
                  No business units match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.forwardRef(DemandForecastByBusinessUnitTable);
