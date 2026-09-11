import React, { useMemo, useState } from 'react';
import {
  getPlannedAllocation, getAvailability, getAvailableFromDate, getActualUtilization,
} from '../data/capacityModel';
import FindOpportunityPopover from './FindOpportunityPopover';
import AIMatchModal from './AIMatchModal';

// Matches the Coforge Workforce Intelligence Figma "Partially Allocated
// Employees" table (node 8:670, Capacity & Utilization page), rebuilt on
// data/capacityModel.js. Column labels and values now match the spec
// exactly: Work Capacity (hours in the planning period), Total Planned
// Allocation (% + booked hours, confirmed only), Available for Staffing
// (%, hours AND FTE — FTE against the standard reference, not the
// employee's own capacity), Available From, and Actual Billable
// Utilization (% with its own separate reporting period label, since it
// covers a different historical window than the forward-looking
// allocation columns). Every row expands into its commitment breakdown
// (no more information hidden behind a single "Skills" column).
//
// "Find Role" / "AI Match" are reused as-is from Bench Management —
// both already work against `employee.skills`/`employee.name`, and
// "Find Opportunity" already matches on effective availability via the
// live staffing-plan store, satisfying "use available capacity and
// effective dates in Find Opportunity matching".
const COLUMNS = [
  { key: 'name', label: 'Employee' },
  { key: 'unit', label: 'Business Unit' },
  { key: 'workCapacity', label: 'Work Capacity' },
  { key: 'plannedPct', label: 'Total Planned Allocation' },
  { key: 'availablePct', label: 'Available for Staffing' },
  { key: 'availableFrom', label: 'Available From' },
  { key: 'actualPct', label: 'Actual Billable Utilization' },
  { key: 'action', label: 'Action', sortable: false },
];

function fmtHours(h) {
  return `${Math.round(h * 10) / 10}h`;
}
function fmtPct(pct, digits = 0) {
  return pct == null ? 'N/A' : `${pct.toFixed(digits)}%`;
}

function CommitmentBreakdown({ employee, period, actualPeriod }) {
  const availability = getAvailability(employee, period);
  return (
    <tr>
      <td colSpan={COLUMNS.length} style={{ padding: '0 12px 16px', background: 'var(--w-sunken-bg)' }}>
        <div style={{ border: '1px solid var(--w-divider)', borderRadius: '8px', padding: '14px 16px', marginTop: '4px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>
                Commitments in the planning period
              </p>
              {employee.commitments.length === 0 && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '6px' }}>None on record.</p>
              )}
              <div className="flex flex-col gap-1.5" style={{ marginTop: '8px' }}>
                {employee.commitments.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2" style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '6px 10px' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)' }}>
                      {c.name} <span style={{ color: 'var(--w-text-label)', fontSize: '10px' }}>({c.type === 'internal' ? 'internal' : 'project'}{c.status === 'draft' ? ' · draft' : ''})</span>
                    </span>
                    <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>
                      {c.hoursPerWeek}h/wk · {c.startDate} → {c.endDate}
                    </span>
                  </div>
                ))}
              </div>
              {employee.leave.length > 0 && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '8px' }}>
                  Approved leave: {employee.leave.map((l) => `${l.start} → ${l.end}`).join(', ')}
                </p>
              )}
            </div>
            <div>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>
                Skills
              </p>
              <div className="flex flex-wrap gap-1" style={{ marginTop: '8px' }}>
                {employee.skills.map((s) => (
                  <span key={s} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '4px', padding: '2px 7px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)' }}>{s}</span>
                ))}
              </div>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)', marginTop: '12px' }}>
                Available for staffing
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', marginTop: '4px' }}>
                {fmtHours(availability.availableHours)} ({fmtPct(availability.pct)}) ≈ {availability.fte.toFixed(2)} FTE on a {40}h standard week
              </p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

function EmployeeRow({ e, period, actualPeriod, expanded, onToggle }) {
  const allocation = getPlannedAllocation(e, period);
  const availability = getAvailability(e, period);
  const availableFrom = getAvailableFromDate(e, period);
  const actual = getActualUtilization(e, actualPeriod);

  return (
    <>
      <tr style={{ borderBottom: expanded ? 'none' : '1px solid var(--w-divider)' }}>
        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
          <button onClick={onToggle} className="flex items-center gap-2" aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${e.name}`}>
            <span aria-hidden="true" style={{ fontSize: '10px', color: 'var(--w-text-label)', transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', width: '10px' }}>›</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-primary)' }}>{e.name}</span>
          </button>
        </td>
        <td style={{ padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>{e.unit}</td>
        <td style={{ padding: '12px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>
          {allocation.workCapacityHours > 0 ? fmtHours(allocation.workCapacityHours) : 'N/A'}
        </td>
        <td style={{ padding: '12px', minWidth: '120px' }}>
          {allocation.pct == null ? (
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-label)' }}>N/A</span>
          ) : (
            <>
              <div className="flex" style={{ height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'var(--w-sunken-bg)', gap: '1px' }}>
                <div style={{ width: `${Math.min(100, allocation.pct)}%`, background: allocation.overAllocated ? 'var(--w-red)' : 'var(--w-accent-blue)' }} />
              </div>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: allocation.overAllocated ? 'var(--w-red)' : 'var(--w-accent-blue)', marginTop: '3px' }}>
                {fmtPct(allocation.pct)} · {fmtHours(allocation.bookedHours)}
                {allocation.overAllocated && <span title="Committed hours exceed capacity on at least one day"> ⚠ over-allocated</span>}
              </p>
            </>
          )}
        </td>
        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
          {availability.pct == null ? (
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-label)' }}>N/A</span>
          ) : (
            <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '11px', color: 'var(--w-green)' }}>
              {fmtPct(availability.pct)} · {fmtHours(availability.availableHours)} · {availability.fte.toFixed(2)} FTE
            </span>
          )}
        </td>
        <td style={{ padding: '12px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: availableFrom === 'Immediate' ? 'var(--w-green)' : 'var(--w-text-tertiary)', whiteSpace: 'nowrap' }}>
          {availableFrom || 'Not this period'}
        </td>
        <td style={{ padding: '12px', minWidth: '110px' }}>
          {actual.pct == null ? (
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-label)' }} title={actual.reason === 'missing-timesheet' ? 'No approved timesheet for this period' : 'Zero work capacity in this period'}>
              N/A ({actual.reason === 'missing-timesheet' ? 'no timesheet' : 'no capacity'})
            </span>
          ) : (
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: actual.overAllocated ? 'var(--w-red)' : 'var(--w-text-secondary)' }}>
              {fmtPct(actual.pct)}{actual.overAllocated && ' ⚠'}
            </span>
          )}
        </td>
        <td style={{ padding: '12px' }}>
          <div className="flex gap-1.5">
            <FindOpportunityPopover employee={e} label="Find Opportunity →" />
            <AIMatchModal employee={e} />
          </div>
        </td>
      </tr>
      {expanded && <CommitmentBreakdown employee={e} period={period} actualPeriod={actualPeriod} />}
    </>
  );
}

function PartiallyAllocatedEmployeesTable({ cohort, period, actualPeriod, activeFilters = {}, onClearFilters }, ref) {
  const [sortKey, setSortKey] = useState('availablePct');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  // `cohort` arrives already filtered by the page (business unit / range /
  // quick-filter) — this component only sorts and renders it, so
  // filtering logic lives in exactly one place (CapacityUtilization.jsx).
  const rows = useMemo(() => {
    return cohort.map(({ employee }) => ({
      employee,
      workCapacity: getPlannedAllocation(employee, period).workCapacityHours,
      plannedPct: getPlannedAllocation(employee, period).pct ?? -1,
      availablePct: getAvailability(employee, period).pct ?? -1,
      actualPct: getActualUtilization(employee, actualPeriod).pct ?? -1,
    }));
  }, [cohort, period, actualPeriod]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      if (sortKey === 'name') {
        const cmp = a.employee.name.localeCompare(b.employee.name);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const hasFilter = Boolean(activeFilters.businessUnit || activeFilters.range || activeFilters.quick);

  return (
    <div ref={ref} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px', scrollMarginTop: '16px' }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
            Partially Allocated Employees
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-tertiary)', marginTop: '3px' }}>
            {sorted.length} of {cohort.length} shown · click a column header to sort · click a row to expand its commitment breakdown
          </p>
        </div>
        {hasFilter && (
          <button onClick={onClearFilters} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-accent-blue)', border: '1px solid var(--w-accent-blue)', borderRadius: '20px', padding: '4px 10px', whiteSpace: 'nowrap' }}>
            {[activeFilters.businessUnit, activeFilters.rangeLabel].filter(Boolean).join(' · ') || 'Filtered'} · Clear ×
          </button>
        )}
      </div>

      <div style={{ paddingTop: '14px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1180px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--w-divider)' }}>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={c.sortable === false ? undefined : () => toggleSort(c.key)}
                  scope="col"
                  style={{
                    padding: '0 12px 8px', textAlign: 'left', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '10px',
                    letterSpacing: '0.4px', textTransform: 'uppercase', color: sortKey === c.key ? 'var(--w-accent-blue)' : 'var(--w-text-label)',
                    whiteSpace: 'nowrap', cursor: c.sortable === false ? 'default' : 'pointer', userSelect: 'none',
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
                  No employees match the current filter.
                </td>
              </tr>
            )}
            {sorted.map(({ employee }) => (
              <EmployeeRow
                key={employee.id}
                e={employee}
                period={period}
                actualPeriod={actualPeriod}
                expanded={expandedId === employee.id}
                onToggle={() => setExpandedId((id) => (id === employee.id ? null : employee.id))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.forwardRef(PartiallyAllocatedEmployeesTable);
