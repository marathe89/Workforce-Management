import React from 'react';
import StatCard from '../components/StatCard';
import CapacityWaterfallChart from '../components/CapacityWaterfallChart';
import WorkforceByBusinessUnitTable from '../components/WorkforceByBusinessUnitTable';
import FilterBar from '../components/FilterBar';
import ActiveFilterChips from '../components/ActiveFilterChips';
import useFilterStore from '../stores/filterStore';
import { getFactor, fmtNum } from '../data/filterMetrics';

// Matches the Coforge Workforce Intelligence Figma "WorkforceScreen" exactly
// (nodes 6:9365 title, 6:9373 stat row, 6:9500 waterfall, 6:9554 table).
// Still missing: the "Current Workforce Allocation" stacked bar (node
// 6:9439) that sits between the stat row and the waterfall chart. Same
// static-mockup-data reasoning as Overview's stat row throughout: no
// backend model for any of this exists yet.
//
// FilterBar (node 6:8210) added here per its actual Figma placement
// (Bench Management/Capacity & Utilization/Skills Intelligence/Workforce)
// — this is the one of those four pages that had no filtering at all, so
// it's a clean fit. The other three already have their own bespoke,
// widget-specific filter systems (bucket/BU clicks, BU/range/quick
// filters, skill drill-down) — stacking this generic bar on top of those
// would compete rather than help, so it's deliberately NOT added there
// (same call already made once on Talent Finder, tried then removed).
// Reuses Overview's shared filter/factor model (filterMetrics.js) so
// "no filters" still reproduces these exact original static numbers.
//
// All cards on this page are interactive: the 5 stat cards, the 6
// Capacity Waterfall bars, and the Business Unit table's rows/column
// headers are quick-select shortcuts into the same Allocation/Business
// Unit filter dimensions FilterBar exposes (useFilterStore), so clicking
// any of them filters this whole page together rather than being
// decorative — clicking an already-active one clears it.
const TRAINING_BASE = 1240;

function Workforce() {
  const applied = useFilterStore((s) => s.applied);
  const setAllocationNow = useFilterStore((s) => s.setAllocationNow);
  const factor = getFactor(applied);
  const filtered = factor < 1;

  const totalWorkforce = 48620 * factor;
  const fullyAllocated = 35840 * factor;
  const partiallyAllocated = 6420 * factor;
  const recoverableFTE = 3180 * factor;
  const bench = 1126 * factor;
  const training = TRAINING_BASE * factor;

  // Each stat card is a quick-select shortcut into the same Allocation
  // dimension FilterBar exposes — clicking one filters the whole page
  // (and the waterfall/table below, which read the same applied state)
  // to that bucket, and clicking it again clears back to all workforce.
  const selectAllocation = (value) => setAllocationNow(applied.allocation === value ? 'All Workforce' : value);

  return (
    <div className="p-8 space-y-6">
      {/* Pulled out to the edges via negative margins, same treatment as
          Overview's, so its own full-bleed background sits flush below
          the header. */}
      <div className="-mt-8 -mx-8">
        <FilterBar />
      </div>

      <div>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
          Workforce
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-label)', marginTop: '4px' }}>
          Comprehensive view of the entire workforce allocation state.
        </p>
      </div>

      <ActiveFilterChips />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Workforce"
          value={fmtNum(totalWorkforce)}
          subtitle={filtered ? 'FTE matching current filters — click to clear' : 'FTE across all BUs'}
          trend={{ direction: 'up', label: '+4.8% YoY' }}
          minHeight="8.75rem"
          onClick={() => setAllocationNow('All Workforce')}
          active={applied.allocation === 'All Workforce'}
        />
        <StatCard
          label="Fully Allocated"
          value={fmtNum(fullyAllocated)}
          subtitle="73.7% of workforce"
          minHeight="8.75rem"
          onClick={() => selectAllocation('Fully Allocated')}
          active={applied.allocation === 'Fully Allocated'}
        />
        <StatCard
          label="Partially Allocated"
          value={fmtNum(partiallyAllocated)}
          subtitle={`13.2% · ${fmtNum(recoverableFTE)} FTE recoverable`}
          minHeight="8.75rem"
          onClick={() => selectAllocation('Partially Allocated')}
          active={applied.allocation === 'Partially Allocated'}
        />
        <StatCard
          label="On Bench"
          value={fmtNum(bench)}
          subtitle="2.3% · $1.8M/mo cost"
          minHeight="8.75rem"
          onClick={() => selectAllocation('Bench')}
          active={applied.allocation === 'Bench'}
        />
        <StatCard
          label="In Training"
          value={fmtNum(training)}
          subtitle="2.5% — upskilling"
          minHeight="8.75rem"
          onClick={() => selectAllocation('Training')}
          active={applied.allocation === 'Training'}
        />
      </div>

      <CapacityWaterfallChart />
      <WorkforceByBusinessUnitTable />
    </div>
  );
}

export default Workforce;
