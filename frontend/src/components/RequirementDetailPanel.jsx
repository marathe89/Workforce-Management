import React from 'react';
import { getRequirementCoverage, getRankedCandidates } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';
import CandidateAllocationCard from './CandidateAllocationCard';

// Expanded detail for one selected requirement: what's required, what's
// confirmed/proposed/remaining, and who could fill it. Candidates are
// filtered strictly by the requirement's own skill — a Java gap only
// ever shows Java-matched people, never unrelated roles bundled in
// under a generic ranking — and ranked so the manager sees a real set of
// options with the strongest one flagged, not just a single name.
function RequirementDetailPanel({ requirement }) {
  const draftAllocations = useStaffingPlanStore((s) => s.draftAllocations);
  const coverage = getRequirementCoverage(requirement, draftAllocations);
  const candidates = getRankedCandidates(requirement);
  const round1 = (n) => Math.round(n * 10) / 10;

  return (
    <div style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '16px', marginTop: '8px' }}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Role & proficiency</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)', marginTop: '3px' }}>{requirement.role} · {requirement.proficiency}</p>
        </div>
        <div>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Required capacity & dates</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)', marginTop: '3px' }}>{requirement.headcountFTE} FTE · {requirement.startDate} → {requirement.endDate}</p>
        </div>
        <div>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Delivery priority</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: requirement.priority === 'Critical' ? 'var(--w-red)' : requirement.priority === 'High' ? 'var(--w-amber)' : 'var(--w-text-secondary)', marginTop: '3px' }}>{requirement.priority}</p>
        </div>
        <div>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Confirmed / Proposed / Remaining</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)', marginTop: '3px' }}>
            {round1(coverage.confirmedFTE)} / {round1(coverage.proposedFTE)} / <span style={{ fontWeight: 700, color: coverage.remainingGap > 0 ? 'var(--w-red)' : 'var(--w-green)' }}>{round1(coverage.remainingGap)} FTE</span>
          </p>
        </div>
      </div>

      <div className="flex items-baseline justify-between" style={{ marginTop: '18px' }}>
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--w-text-primary)' }}>
          Matching candidates
        </p>
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--w-text-secondary)' }}>{candidates.length} option{candidates.length === 1 ? '' : 's'}</span>
      </div>
      <div className="flex flex-col gap-2.5" style={{ marginTop: '8px' }}>
        {candidates.length === 0 && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>No candidates with {requirement.skill} in the current pool.</p>
        )}
        {candidates.map((c) => (
          <CandidateAllocationCard key={c.id} candidate={c} requirement={requirement} rank={c.rank} />
        ))}
      </div>
    </div>
  );
}

export default RequirementDetailPanel;
