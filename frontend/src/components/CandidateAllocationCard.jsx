import React, { useState } from 'react';
import { computeAllocationFTE, getCandidateTotalPercent, validateAllocation } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';

// One candidate's card inside a Requirement's detail panel. Visual
// hierarchy, top to bottom: who they are + a rank/recommendation badge
// (scannable at a glance across several options), a compact skill-chip
// row, ONE headline reason (not a repeated skills sentence plus a
// separate bullet list), then availability/commitments as small
// label+value pairs matching the app's existing stat-tile pattern, then
// the editable allocation, then the outcome (FTE + workload) as a small
// pill, then actions. Editable proposed allocation / dates / resulting
// workload / conflicts write straight into the shared draft-plan store
// so every other view updates immediately.
function CandidateAllocationCard({ candidate, requirement, rank }) {
  const draftAllocations = useStaffingPlanStore((s) => s.draftAllocations);
  const addAllocation = useStaffingPlanStore((s) => s.addAllocation);
  const editAllocation = useStaffingPlanStore((s) => s.editAllocation);
  const removeAllocation = useStaffingPlanStore((s) => s.removeAllocation);

  const existing = draftAllocations.find((a) => a.candidateId === candidate.id && a.requirementId === requirement.id);
  const defaultStart = candidate.availableFrom > requirement.startDate ? candidate.availableFrom : requirement.startDate;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    percent: existing?.percent ?? candidate.availableCapacityPercent,
    startDate: existing?.startDate ?? defaultStart,
    endDate: existing?.endDate ?? requirement.endDate,
  });

  const activeValues = existing && !editing ? existing : draft;
  const previewAllocation = { id: existing?.id ?? 'preview', percent: activeValues.percent, startDate: activeValues.startDate, endDate: activeValues.endDate };
  const fte = Math.round(computeAllocationFTE(previewAllocation, requirement) * requirement.headcountFTE * 100) / 100;
  const { committed, proposed, total } = getCandidateTotalPercent(candidate, existing ? draftAllocations : [...draftAllocations, previewAllocation]);
  const conflicts = validateAllocation(candidate, previewAllocation, draftAllocations, requirement);

  const handleAdd = () => {
    addAllocation({ candidateId: candidate.id, requirementId: requirement.id, ...draft });
  };

  const handleSaveEdit = () => {
    editAllocation(existing.id, { ...draft });
    setEditing(false);
  };

  const badge = rank === 1 ? { label: '★ Recommended', color: 'var(--w-green)' } : { label: `#${rank}`, color: 'var(--w-text-secondary)' };

  return (
    <div style={{ background: 'var(--w-card-bg)', border: `1px solid ${existing ? 'var(--w-green)' : 'var(--w-card-border)'}`, borderRadius: '8px', padding: '12px 14px' }}>
      {/* Identity + recommendation */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--w-text-primary)' }}>{candidate.name}</p>
            <span
              style={{
                background: `color-mix(in srgb, ${badge.color} 15%, transparent)`,
                border: `1px solid color-mix(in srgb, ${badge.color} 40%, transparent)`,
                borderRadius: '10px', padding: '1px 8px',
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '10px', color: badge.color,
              }}
            >
              {badge.label}
            </span>
            {existing && (
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', color: 'var(--w-green)' }}>✓ In plan</span>
            )}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)', marginTop: '2px' }}>{candidate.role} · {candidate.location}</p>
        </div>
      </div>

      {/* Skill chips + one headline reason */}
      <div className="flex flex-wrap items-center gap-1.5" style={{ marginTop: '8px' }}>
        {candidate.skills.map((s) => (
          <span key={s.name}
            style={{
              background: s.name === requirement.skill ? 'color-mix(in srgb, var(--w-accent-blue) 16%, transparent)' : 'var(--w-sunken-bg)',
              border: `1px solid ${s.name === requirement.skill ? 'color-mix(in srgb, var(--w-accent-blue) 40%, transparent)' : 'var(--w-divider)'}`,
              borderRadius: '5px', padding: '2px 7px',
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              color: s.name === requirement.skill ? 'var(--w-accent-blue)' : 'var(--w-text-tertiary)',
            }}
          >
            {s.name}
          </span>
        ))}
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '6px' }}>
        “{candidate.matchEvidence[0]}”
      </p>

      {/* Availability + commitments as compact stat pairs */}
      <div className="grid grid-cols-2 gap-3" style={{ marginTop: '10px' }}>
        <div>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Available</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', marginTop: '1px' }}>
            from <strong style={{ color: 'var(--w-text-primary)' }}>{candidate.availableFrom}</strong>, up to <strong style={{ color: 'var(--w-text-primary)' }}>{candidate.availableCapacityPercent}%</strong>
          </p>
        </div>
        <div>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Existing commitments</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', marginTop: '1px' }}>
            {candidate.commitments.length === 0 ? 'None' : candidate.commitments.map((c) => `${c.project} (${c.percent}%)`).join(', ')}
          </p>
        </div>
      </div>

      {(editing || !existing) && (
        <div className="flex flex-wrap items-end gap-3" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--w-divider)' }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
            Proposed allocation %
            <input
              type="number" min="1" max="100" value={draft.percent}
              onChange={(e) => setDraft((d) => ({ ...d, percent: Number(e.target.value) || 0 }))}
              style={{ display: 'block', marginTop: '3px', width: '84px', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '30px', padding: '0 8px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-primary)' }}
            />
          </label>
          <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
            Start date
            <input
              type="date" value={draft.startDate} min={candidate.availableFrom}
              onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
              style={{ display: 'block', marginTop: '3px', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '30px', padding: '0 8px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-primary)', colorScheme: 'light dark', accentColor: 'var(--w-accent-blue)' }}
            />
          </label>
          <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
            End date
            <input
              type="date" value={draft.endDate}
              onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
              style={{ display: 'block', marginTop: '3px', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '30px', padding: '0 8px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-primary)', colorScheme: 'light dark', accentColor: 'var(--w-accent-blue)' }}
            />
          </label>
        </div>
      )}

      {/* Outcome pill */}
      <div className="flex flex-wrap items-center gap-2" style={{ marginTop: '10px' }}>
        <span style={{ background: 'color-mix(in srgb, var(--w-accent-blue) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--w-accent-blue) 35%, transparent)', borderRadius: '5px', padding: '2px 8px', fontFamily: '"DM Mono", monospace', fontWeight: 600, fontSize: '11px', color: 'var(--w-accent-blue)' }}>
          {fte} FTE contribution
        </span>
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', fontWeight: 600, color: total > 100 ? 'var(--w-red)' : 'var(--w-text-secondary)' }}>
          {total}% total workload ({committed}% existing + {proposed}% proposed)
        </span>
      </div>

      {conflicts.length > 0 && (
        <ul style={{ marginTop: '6px' }}>
          {conflicts.map((c) => (
            <li key={c} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: 'var(--w-red)' }}>⚠ {c}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-2" style={{ marginTop: '10px' }}>
        {!existing && (
          <button
            onClick={handleAdd}
            style={{ background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '11px', color: '#FFFFFF' }}
          >
            Add to Plan
          </button>
        )}
        {existing && !editing && (
          <>
            <button onClick={() => { setDraft({ percent: existing.percent, startDate: existing.startDate, endDate: existing.endDate }); setEditing(true); }}
              style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
              Edit allocation
            </button>
            <button onClick={() => removeAllocation(existing.id)}
              style={{ border: '1px solid color-mix(in srgb, var(--w-red) 40%, transparent)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-red)' }}>
              Remove
            </button>
          </>
        )}
        {existing && editing && (
          <>
            <button onClick={handleSaveEdit}
              style={{ background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '11px', color: '#FFFFFF' }}>
              Save
            </button>
            <button onClick={() => setEditing(false)}
              style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CandidateAllocationCard;
