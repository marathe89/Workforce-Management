import React, { useMemo, useRef, useState } from 'react';
import StatCard from '../components/StatCard';
import AllocationDistributionChart, { RANGES } from '../components/AllocationDistributionChart';
import RecoverableCapacityTable from '../components/RecoverableCapacityTable';
import PartiallyAllocatedEmployeesTable from '../components/PartiallyAllocatedEmployeesTable';
import {
  EMPLOYEES, getDefaultStaffingPeriod, getDefaultActualPeriod,
  getPlannedAllocation, getPartiallyAllocatedCohort, getAverageAllocationPct, getBelow50Cohort,
  getRecoverableCapacityFTE, getBecomingAvailable, getPotentialUtilizationGainPP,
} from '../data/capacityModel';

// Matches the Coforge Workforce Intelligence Figma "Partial Allocation"
// screen (node 8:259, Capacity & Utilization nav item). Every card,
// chart and table row is now computed from data/capacityModel.js's
// shared functions over the SAME employee records and the SAME two
// explicit reporting periods — see that file's header comment for what
// changed and why (it replaces three previously unreconciled hardcoded
// numbers: "6,420 partially allocated", "62% avg allocation", "3,180
// FTE recoverable").
//
// Two independent, clearly labeled, editable periods (spec section 2):
// staffing planning defaults to the next 30 days, actual utilization
// defaults to the last 4 completed weeks — deliberately different
// windows, since one is forward-looking allocation and the other is
// historical billable time.
function DatePeriodControl({ label, period, onChange, hint }) {
  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '10px 14px' }}>
      <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>{label}</p>
      <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '6px' }}>
        <input
          type="date" value={period.start} onChange={(e) => onChange({ ...period, start: e.target.value })}
          aria-label={`${label} start date`}
          style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '30px', padding: '0 8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)', colorScheme: 'light dark' }}
        />
        <span style={{ color: 'var(--w-text-label)', fontSize: '12px' }}>→</span>
        <input
          type="date" value={period.end} onChange={(e) => onChange({ ...period, end: e.target.value })}
          aria-label={`${label} end date`}
          style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '30px', padding: '0 8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)', colorScheme: 'light dark' }}
        />
      </div>
      {hint && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '4px' }}>{hint}</p>}
    </div>
  );
}

function CapacityUtilization() {
  const [staffingPeriod, setStaffingPeriod] = useState(getDefaultStaffingPeriod());
  const [actualPeriod, setActualPeriod] = useState(getDefaultActualPeriod());
  const [filters, setFilters] = useState({ businessUnit: null, range: null, quick: null });
  const [activeStat, setActiveStat] = useState(null);
  const tableRef = useRef(null);
  const chartsRef = useRef(null);
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const cohort = useMemo(() => getPartiallyAllocatedCohort(EMPLOYEES, staffingPeriod), [staffingPeriod]);
  const avgAllocationPct = useMemo(() => getAverageAllocationPct(cohort), [cohort]);
  const below50 = useMemo(() => getBelow50Cohort(cohort), [cohort]);
  const recoverableFTE = useMemo(() => getRecoverableCapacityFTE(EMPLOYEES, staffingPeriod), [staffingPeriod]);
  const becomingAvailable = useMemo(() => getBecomingAvailable(EMPLOYEES, staffingPeriod, 30), [staffingPeriod]);
  const potentialGain = useMemo(() => getPotentialUtilizationGainPP(EMPLOYEES, staffingPeriod), [staffingPeriod]);

  const filteredCohort = useMemo(() => {
    return cohort.filter(({ employee, allocation }) => {
      if (filters.businessUnit && employee.unit !== filters.businessUnit) return false;
      if (filters.range) {
        const def = RANGES.find((r) => r.key === filters.range);
        if (def && !def.test(allocation.pct)) return false;
      }
      if (filters.quick === 'below50' && allocation.pct >= 50) return false;
      if (filters.quick === 'becomingAvailable' && !becomingAvailable.some((b) => b.employee.id === employee.id)) return false;
      return true;
    });
  }, [cohort, filters, becomingAvailable]);

  const clearFilters = () => { setFilters({ businessUnit: null, range: null, quick: null }); setActiveStat(null); };

  const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

  const STATS = [
    { key: 'all', label: 'Partially Allocated', value: String(cohort.length), subtitle: `${cohort.length} of ${EMPLOYEES.length} sample employees (0% < allocation < 100%)` },
    { key: 'recoverable', label: 'Recoverable Capacity', value: `${recoverableFTE.toFixed(1)} FTE`, subtitle: `on a ${40}h/week standard reference` },
    { key: 'avgAlloc', label: 'Avg Allocation', value: avgAllocationPct == null ? 'N/A' : `${round1(avgAllocationPct)}%`, subtitle: 'Capacity-weighted, this cohort' },
    { key: 'below50', label: 'Below 50% Allocation', value: String(below50.length), subtitle: 'Exact allocation < 50%' },
    { key: 'becomingAvailable', label: 'Becoming Available', value: String(becomingAvailable.length), subtitle: 'Within 30 days' },
    {
      key: 'utilGain', label: 'Potential Util Gain',
      value: potentialGain ? `+${round1(potentialGain.gainPP)} pp` : 'Not calculated',
      subtitle: potentialGain ? `${round1(potentialGain.currentPct)}% → ${round1(potentialGain.projectedPct)}%` : 'No feasible scenario for this period',
      trend: potentialGain ? { direction: 'up', label: `+${round1(potentialGain.gainPP)} pp` } : undefined,
    },
  ];

  const handleStatClick = (key) => {
    switch (key) {
      case 'all': clearFilters(); scrollTo(tableRef); break;
      case 'recoverable': setActiveStat(null); scrollTo(chartsRef); break;
      case 'avgAlloc': setActiveStat(null); scrollTo(tableRef); break;
      case 'below50': setFilters({ businessUnit: null, range: null, quick: 'below50' }); setActiveStat('below50'); scrollTo(tableRef); break;
      case 'becomingAvailable': setFilters({ businessUnit: null, range: null, quick: 'becomingAvailable' }); setActiveStat('becomingAvailable'); scrollTo(tableRef); break;
      case 'utilGain': setActiveStat('utilGain'); scrollTo(tableRef); break;
      default: break;
    }
  };

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
          Partial Allocation
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
          Identify unused employee capacity and opportunities for cross-project staffing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DatePeriodControl label="Staffing planning period" period={staffingPeriod} onChange={setStaffingPeriod} hint="Drives allocation, availability and recoverable-capacity figures below." />
        <DatePeriodControl label="Actual utilization period" period={actualPeriod} onChange={setActualPeriod} hint="Historical billable hours — a separate window from the staffing period above." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {STATS.map((s) => (
          <StatCard key={s.key} {...s} minHeight="9.7rem" active={activeStat === s.key} onClick={() => handleStatClick(s.key)} />
        ))}
      </div>

      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ scrollMarginTop: '16px' }}>
        <AllocationDistributionChart
          employees={EMPLOYEES}
          period={staffingPeriod}
          activeRange={filters.range}
          onSelect={(range) => { setFilters((f) => ({ ...f, range, quick: null })); setActiveStat(null); if (range) scrollTo(tableRef); }}
        />
        <RecoverableCapacityTable
          employees={EMPLOYEES}
          period={staffingPeriod}
          activeFilter={filters}
          onSelectUnit={(unit) => { setFilters((f) => ({ businessUnit: f.businessUnit === unit ? null : unit, range: null, quick: null })); setActiveStat(null); scrollTo(tableRef); }}
          onExplore={(unit) => { setFilters({ businessUnit: unit, range: null, quick: null }); setActiveStat(null); scrollTo(tableRef); }}
        />
      </div>

      <PartiallyAllocatedEmployeesTable
        ref={tableRef}
        cohort={filteredCohort}
        period={staffingPeriod}
        actualPeriod={actualPeriod}
        activeFilters={filters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}

export default CapacityUtilization;
