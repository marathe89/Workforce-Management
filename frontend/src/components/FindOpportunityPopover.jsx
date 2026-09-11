import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REQUIREMENTS, PROJECT, getRequirementCoverage } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';
import LightboxModal from './LightboxModal';

// "Find Opportunity" — matches this (partially allocated) employee's
// skills against Project Phoenix's open requirements (the only project
// this app has a real requirements/coverage model for — see
// staffingModel.js's header comment) and offers to jump straight to that
// requirement on the Project Staffing screen. Reads the SAME live draft
// plan store Project Staffing uses, so a gap someone already started
// filling there shows as smaller/closed here too, not a stale snapshot.
// Honest empty state when there's no real open match, rather than
// inventing one.
//
// Renders as a centered lightbox (LightboxModal) — same modal pattern as
// AssignModal/OptimizeStaffingPanel — rather than a small anchored
// popover: bigger, easier to read, and immune to the anchor-clipping
// issue a plain positioned popover had inside this table's
// horizontally-scrollable wrapper.
//
// Reused as-is for Bench Management's "Find Role" action (same strict
// "open requirement whose skill exactly matches one of theirs" logic
// applies to a benched employee as much as a partially allocated one) —
// `label` just changes the trigger button's text to fit each context.
function FindOpportunityPopover({ employee, label = 'Find Opportunity →' }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const draftAllocations = useStaffingPlanStore((s) => s.draftAllocations);

  const matches = REQUIREMENTS
    .filter((r) => employee.skills.includes(r.skill))
    .map((r) => ({ requirement: r, coverage: getRequirementCoverage(r, draftAllocations) }))
    .filter((m) => m.coverage.remainingGap > 0)
    .sort((a, b) => b.coverage.remainingGap - a.coverage.remainingGap);

  const round1 = (n) => Math.round(n * 10) / 10;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-expanded={open}
        style={{
          border: '1px solid var(--w-card-border)',
          borderRadius: '5px',
          padding: '6px 12px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          color: 'var(--w-accent-blue)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </button>

      {open && (
        <LightboxModal onClose={() => setOpen(false)} width={480} titleId="find-opportunity-title">
          <p id="find-opportunity-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)', paddingRight: '24px' }}>
            Matching open requirements
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
            Based on {employee.name.split(' ')[0]}'s skills ({employee.skills.join(', ')}) against {PROJECT.name} — the only project this screen has a live requirements model for.
          </p>

          <div className="flex flex-col gap-3" style={{ marginTop: '18px' }}>
            {matches.length === 0 && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-tertiary)' }}>
                No open requirement in {PROJECT.name} currently matches these skills.
              </p>
            )}
            {matches.map(({ requirement, coverage }) => (
              <div key={requirement.id} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '9px', padding: '14px 16px' }}>
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--w-text-primary)' }}>{requirement.role}</span>
                  <span
                    style={{
                      background: `color-mix(in srgb, ${requirement.priority === 'Critical' ? 'var(--w-red)' : requirement.priority === 'High' ? 'var(--w-amber)' : 'var(--w-text-secondary)'} 14%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${requirement.priority === 'Critical' ? 'var(--w-red)' : requirement.priority === 'High' ? 'var(--w-amber)' : 'var(--w-text-secondary)'} 35%, transparent)`,
                      borderRadius: '10px', padding: '2px 9px',
                      fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                      color: requirement.priority === 'Critical' ? 'var(--w-red)' : requirement.priority === 'High' ? 'var(--w-amber)' : 'var(--w-text-secondary)',
                    }}
                  >
                    {requirement.priority}
                  </span>
                </div>
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', fontWeight: 600, color: 'var(--w-red)', marginTop: '6px' }}>{round1(coverage.remainingGap)} FTE gap</p>
                <button
                  onClick={() => navigate(`/projects?requirement=${requirement.id}`)}
                  style={{ marginTop: '10px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--w-accent-blue)' }}
                >
                  View in Project Staffing →
                </button>
              </div>
            ))}
          </div>
        </LightboxModal>
      )}
    </>
  );
}

export default FindOpportunityPopover;
