import React from 'react';
import { getProjectSummary } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';

// Replaces the old "Required/Assigned/Partial/Open Gap/Potential" stat
// tiles with unambiguous labels, computed from the shared staffing
// model (data/staffingModel.js) instead of a separately-hardcoded
// object — so these numbers can never drift from what Requirements &
// Coverage or the Staffing Timeline show.
//
//   Required FTE   — total demand across every role.
//   Confirmed FTE  — capacity already booked (partial allocations are
//                    just allocations with <1 FTE contribution, counted
//                    once here, not a separate bucket).
//   Proposed FTE   — capacity from the draft plan being built below,
//                    capped per-role so it can't overshoot a role's own
//                    remaining need.
//   Remaining Gap  — unmet demand after confirmed + proposed, summed
//                    per role so surplus in one role never cancels a
//                    shortfall in another.
//   Potential FTE  — spare capacity available from eligible-but-
//                    unassigned people against roles that still have a
//                    gap (derived from the real candidate pool, not a
//                    constant).
function ProjectSummaryCards() {
  const draftAllocations = useStaffingPlanStore((s) => s.draftAllocations);
  const summary = getProjectSummary(draftAllocations);

  const round1 = (n) => Math.round(n * 10) / 10;

  const TILES = [
    { label: 'Required FTE', value: round1(summary.requiredFTE), color: 'var(--w-text-primary)' },
    { label: 'Confirmed FTE', value: round1(summary.confirmedFTE), color: 'var(--w-accent-blue)' },
    { label: 'Proposed FTE', value: round1(summary.proposedFTE), color: 'var(--w-indigo)' },
    { label: 'Remaining Gap', value: round1(summary.remainingGap), color: summary.remainingGap > 0 ? 'var(--w-red)' : 'var(--w-green)' },
    { label: 'Potential FTE', value: round1(summary.potentialFTE), color: 'var(--w-green)' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {TILES.map((t) => (
        <div key={t.label} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '8px', padding: '12px 14px' }}>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '20px', lineHeight: '28px', color: t.color }}>{t.value}</p>
          <p style={{ fontFamily: '"DM Mono", monospace', fontWeight: 400, fontSize: '10px', letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)', marginTop: '2px' }}>
            {t.label}
          </p>
        </div>
      ))}
      <p className="col-span-2 sm:col-span-3 lg:col-span-5" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)' }}>
        Confirmed coverage: <strong style={{ color: 'var(--w-text-primary)' }}>{round1(summary.confirmedCoveragePercent)}%</strong> of required capacity is already booked.
        {' '}Including the draft plan below: <strong style={{ color: 'var(--w-accent-blue)' }}>{round1(summary.proposedCoveragePercent)}%</strong>.
      </p>
    </div>
  );
}

export default ProjectSummaryCards;
