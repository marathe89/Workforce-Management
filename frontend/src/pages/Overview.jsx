import React from 'react';
import StatCard from '../components/StatCard';
import WorkforceHealthCard from '../components/WorkforceHealthCard';
import HiddenCapacityCard from '../components/HiddenCapacityCard';
import ActiveAlertsCard from '../components/ActiveAlertsCard';
import WorkforceIntelligenceCards from '../components/WorkforceIntelligenceCards';
import SupplyDemandChart from '../components/SupplyDemandChart';
import UtilizationPerformanceCard from '../components/UtilizationPerformanceCard';
import FilterBar from '../components/FilterBar';
import ActiveFilterChips from '../components/ActiveFilterChips';
import useFilterStore from '../stores/filterStore';
import { BASE, getFactor, getUtilDelta, fmtNum, fmtPct } from '../data/filterMetrics';

function Overview() {
  const applied = useFilterStore((s) => s.applied);
  const factor = getFactor(applied);
  const utilDelta = getUtilDelta(applied);
  const filtered = factor < 1 || utilDelta !== 0;

  const totalWorkforce = BASE.totalWorkforce * factor;
  const availableCapacity = BASE.availableCapacity * factor;
  const partiallyAllocated = BASE.partiallyAllocated * factor;
  const recoverableFTE = BASE.recoverableFTE * factor;
  const bench = BASE.bench * factor;
  const billableUtilization = Math.min(99, Math.max(35, BASE.billableUtilization + utilDelta));
  const demandCoverage = Math.min(120, Math.max(40, BASE.demandCoverage + utilDelta * 0.5));
  const atRiskSkills = Math.max(1, Math.round(BASE.atRiskSkills * factor));

  return (
    <div className="p-8 space-y-8">
      {/* FilterBar (node 6:8210) — pulled out to the edges via negative
          margins so its own full-bleed background sits flush below the
          header instead of getting boxed in by this container's padding.
          In Figma this lives on Bench Management/Capacity & Utilization/
          Skills Intelligence/Workforce, not Overview — added here anyway
          on request, since those pages aren't built yet. */}
      <div className="-mt-8 -mx-8">
        <FilterBar />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-100">Workforce Overview</h1>
        <p className="text-gray-500 mt-2">Real-time workforce analytics and insights</p>
      </div>

      {/* Active-filter summary — visible confirmation that Apply actually
          did something, and a quick way to drop one filter at a time
          without hitting Clear All. Only renders once something's
          non-default. */}
      <ActiveFilterChips />

      {/* Stat widgets (Figma-spec sized cards, node 6:8290-6:8391). At
          "no filters" these are exactly the original static Figma
          numbers (see filterMetrics.js's BASE) — no backend model exists
          for any of these breakdowns, so every value below (here and in
          every other widget on this page) is derived from a single
          shared, deterministic factor/delta model on request, rather
          than each card independently making up unrelated numbers. See
          filterMetrics.js for exactly how business unit/allocation/
          practice/geography/grade each contribute. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          label="Total Workforce"
          value={fmtNum(totalWorkforce)}
          subtitle={filtered ? 'FTE matching current filters' : 'FTE across all business units'}
          trend={{ direction: 'up', label: '+4.8% YoY' }}
          linkTo="/workforce"
        />
        <StatCard
          label="Billable Utilization"
          value={fmtPct(billableUtilization)}
          subtitle="Target 85.0%"
          trend={{
            direction: billableUtilization >= 85 ? 'up' : 'down',
            label: `${billableUtilization >= 85 ? '+' : ''}${(billableUtilization - 85).toFixed(1)}% vs target`,
          }}
          linkTo="/workforce"
        />
        <StatCard
          label="Available Capacity"
          value={fmtNum(availableCapacity)}
          subtitle={`${((availableCapacity / totalWorkforce) * 100).toFixed(1)}% of workforce`}
          trend={{ direction: 'up', label: 'Ready for assignment' }}
          linkTo="/capacity-utilization"
        />
        <StatCard
          label="Partially Allocated"
          value={fmtNum(partiallyAllocated)}
          subtitle={`${((partiallyAllocated / totalWorkforce) * 100).toFixed(1)}% of workforce`}
          highlight={`Recoverable: ${fmtNum(recoverableFTE)} FTE`}
          linkTo="/capacity-utilization"
        />
        <StatCard
          label="Bench"
          value={fmtNum(bench)}
          subtitle="0% allocated, unassigned"
          trend={{ direction: 'up', label: '-8.4% vs last month' }}
          linkTo="/bench-management"
        />
        <StatCard
          label="Demand Coverage"
          value={fmtPct(demandCoverage, 0)}
          subtitle="Committed demand vs supply"
          trend={{ direction: 'up', label: '+3.2% this month' }}
          linkTo="/demand-forecast"
        />
        <StatCard
          label="At-Risk Skills"
          value={String(atRiskSkills)}
          subtitle="Skills with projected gaps"
          trend={{ direction: 'down', label: '+6 this month' }}
          linkTo="/skills-intelligence"
        />
      </div>

      {/* Workforce Health (6:8409), Hidden Capacity Opportunity (6:8544),
          and Active Alerts (6:8590) in one row, all equal height (stretch)
          and matching flat card styling. Figma actually stacks the latter
          two in a column next to Workforce Health, and gives Hidden
          Capacity a distinct amber-highlighted treatment — both deviate
          from that on request. */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr] gap-4 items-stretch">
        <WorkforceHealthCard />
        <HiddenCapacityCard />
        <ActiveAlertsCard />
      </div>

      {/* Workforce Intelligence insight cards (node 6:8635). */}
      <WorkforceIntelligenceCards />

      {/* Workforce Supply vs Demand (6:8705) + Utilization Performance
          (6:8837). Both charts' bodies are frozen SVG exports in Figma, not
          reconstructable data — rebuilt here as real Recharts charts with
          visually equivalent data (the Utilization Performance table's
          numbers are exact, read directly from Figma's text nodes). Both
          now also scale with the shared filter model above. */}
      <SupplyDemandChart />
      <UtilizationPerformanceCard />
    </div>
  );
}

export default Overview;
