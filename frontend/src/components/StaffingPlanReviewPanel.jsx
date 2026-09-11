import React from 'react';
import { CANDIDATES, REQUIREMENTS, getProjectSummary, getTimelineByMonth, getRequirementCoverage } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';

// Persistent plan review — sits in the second column of Projects.jsx's
// grid on desktop (lg+) with `position: sticky` so its top edge starts
// level with the main column's first card ("Project Phoenix") and then
// pins near the top of the viewport as the page scrolls; on mobile/
// tablet the grid collapses to one column so this renders as a normal
// stacked section instead (same component, no separate mobile version).
//
// No booking/approval backend exists for this screen (see
// staffingModel.js's header comment), so "Submit" is a clearly-labeled
// local draft action — it does not call an API, book anyone, or notify
// a manager. It's guarded against double submission by the store.
function StaffingPlanReviewPanel() {
  const draftAllocations = useStaffingPlanStore((s) => s.draftAllocations);
  const removeAllocation = useStaffingPlanStore((s) => s.removeAllocation);
  const undo = useStaffingPlanStore((s) => s.undo);
  const discardAll = useStaffingPlanStore((s) => s.discardAll);
  const canUndo = useStaffingPlanStore((s) => s.canUndo());
  const getAllConflicts = useStaffingPlanStore((s) => s.getAllConflicts);
  const submit = useStaffingPlanStore((s) => s.submit);
  const submission = useStaffingPlanStore((s) => s.submission);

  const conflicts = getAllConflicts();
  const before = getProjectSummary([]);
  const after = getProjectSummary(draftAllocations);
  const round1 = (n) => Math.round(n * 10) / 10;

  // "Added FTE for the selected period" — sum of this month's proposed
  // contribution if a period is selected, else the project-wide total.
  const selectedPeriodMonth = useStaffingPlanStore((s) => s.selectedPeriodMonth);
  const timeline = getTimelineByMonth(draftAllocations);
  const periodRow = selectedPeriodMonth ? timeline.find((t) => t.monthKey === selectedPeriodMonth) : null;
  const addedForPeriod = periodRow ? round1(periodRow.proposedFTE) : round1(after.proposedFTE);

  const isEmpty = draftAllocations.length === 0;
  const canSubmit = !isEmpty && conflicts.length === 0 && submission.status === 'draft';

  const handleSubmit = () => {
    const result = submit();
    if (!result.ok && result.reason === 'conflicts') {
      // conflicts already rendered below; nothing further to do
    }
  };

  return (
    <aside
      aria-label="Staffing plan review"
      className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto w-full"
      style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '18px' }}
    >
      <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--w-text-primary)' }}>Staffing Plan (Draft)</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
        Local draft only — nothing is booked or sent until you submit, and no approval/booking system is connected on this screen.
      </p>

      {isEmpty ? (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '14px' }}>
          No one added yet. Select a requirement below and add a candidate to start building the plan.
        </p>
      ) : (
        <div className="flex flex-col gap-2" style={{ marginTop: '12px' }}>
          {draftAllocations.map((a) => {
            const candidate = CANDIDATES.find((c) => c.id === a.candidateId);
            const requirement = REQUIREMENTS.find((r) => r.id === a.requirementId);
            return (
              <div key={a.id} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '7px', padding: '8px 10px' }}>
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-primary)' }}>{candidate?.name}</span>
                  <button onClick={() => removeAllocation(a.id)} aria-label={`Remove ${candidate?.name}`} style={{ color: 'var(--w-red)', fontSize: '13px' }}>×</button>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>{requirement?.role}</p>
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--w-text-tertiary)' }}>{a.percent}% · {a.startDate} → {a.endDate}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2" style={{ marginTop: '12px' }}>
        <button onClick={undo} disabled={!canUndo} style={{ flex: 1, border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '6px 0', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: canUndo ? 'var(--w-text-secondary)' : 'var(--w-text-label)' }}>
          Undo
        </button>
        <button onClick={discardAll} disabled={isEmpty} style={{ flex: 1, border: '1px solid color-mix(in srgb, var(--w-red) 35%, transparent)', borderRadius: '6px', padding: '6px 0', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: isEmpty ? 'var(--w-text-label)' : 'var(--w-red)' }}>
          Discard All
        </button>
      </div>

      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--w-divider)' }}>
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>
          Added FTE {selectedPeriodMonth ? `(${selectedPeriodMonth})` : '(project total)'}
        </p>
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-indigo)' }}>+{addedForPeriod} FTE</p>

        <div className="flex items-center justify-between" style={{ marginTop: '6px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>Coverage — current</span>
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-secondary)' }}>{round1(before.confirmedCoveragePercent)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>Coverage — with draft</span>
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-accent-blue)' }}>{round1(after.proposedCoveragePercent)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>Remaining gap</span>
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: after.remainingGap > 0 ? 'var(--w-red)' : 'var(--w-green)' }}>{round1(after.remainingGap)} FTE</span>
        </div>
      </div>

      {REQUIREMENTS.some((r) => getProjectSummaryRowGap(r, draftAllocations) > 0) && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Remaining gaps by role</p>
          <ul style={{ marginTop: '4px' }}>
            {REQUIREMENTS.filter((r) => getProjectSummaryRowGap(r, draftAllocations) > 0).map((r) => (
              <li key={r.id} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)' }}>
                {r.role}: <span style={{ color: 'var(--w-red)' }}>{round1(getProjectSummaryRowGap(r, draftAllocations))} FTE</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {conflicts.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', textTransform: 'uppercase', color: 'var(--w-red)' }}>Conflicts ({conflicts.length})</p>
          <ul style={{ marginTop: '4px' }}>
            {conflicts.map((c, i) => (
              <li key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-red)' }}>⚠ {c.candidateName} — {c.issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '14px' }}>
        {submission.status === 'submitted' ? (
          <div style={{ background: 'color-mix(in srgb, var(--w-green) 13%, transparent)', border: '1px solid color-mix(in srgb, var(--w-green) 35%, transparent)', borderRadius: '7px', padding: '10px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--w-green)' }}>✓ Draft submitted (local)</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
              Recorded in this session only — no one has been booked and no manager has been notified.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              title={isEmpty ? 'Add at least one allocation first' : conflicts.length > 0 ? 'Resolve conflicts before submitting' : undefined}
              style={{ width: '100%', height: '38px', borderRadius: '7px', background: canSubmit ? 'var(--w-accent-blue)' : 'var(--w-divider)', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: canSubmit ? '#FFFFFF' : 'var(--w-text-label)' }}
            >
              Submit Staffing Plan (Draft)
            </button>
            {!canSubmit && !isEmpty && conflicts.length > 0 && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-red)', marginTop: '4px' }}>Resolve {conflicts.length} conflict(s) above to submit.</p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

// Small helper kept local to this file — per-requirement remaining gap
// for the "remaining gaps by role" list.
function getProjectSummaryRowGap(requirement, draftAllocations) {
  return getRequirementCoverage(requirement, draftAllocations).remainingGap;
}

export default StaffingPlanReviewPanel;
