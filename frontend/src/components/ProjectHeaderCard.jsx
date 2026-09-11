import React from 'react';
import useStaffingPlanStore from '../stores/staffingPlanStore';
import { PROJECT } from '../data/staffingModel';

// Project identity strip — client, timeline, practice, status, and the
// entry point into the Optimize Staffing panel. The stat tiles and
// opportunity banner that used to live here moved to
// ProjectSummaryCards.jsx (Required/Confirmed/Proposed/Gap/Potential,
// all derived from data/staffingModel.js) so this card is just identity
// + the one action.
function ProjectHeaderCard({ onOptimizeClick }) {
  const submission = useStaffingPlanStore((s) => s.submission);
  const status = submission.status === 'submitted' ? { label: 'Plan Submitted (Draft)', color: 'var(--w-green)' } : { label: PROJECT.status, color: 'var(--w-amber)' };

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' }}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '20px', lineHeight: '30px', color: 'var(--w-text-primary)' }}>
              {PROJECT.name}
            </p>
            <span
              style={{
                background: `color-mix(in srgb, ${status.color} 13%, transparent)`,
                border: `1px solid color-mix(in srgb, ${status.color} 31%, transparent)`,
                borderRadius: '10px',
                padding: '3px 10px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '11px',
                color: status.color,
              }}
            >
              {status.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-5" style={{ paddingTop: '8px' }}>
            {[
              ['Client', PROJECT.client],
              ['Timeline', `${PROJECT.periodStart} → ${PROJECT.periodEnd}`],
              ['Practice', PROJECT.practice],
            ].map(([label, value]) => (
              <p key={label} style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                <span style={{ color: 'var(--w-text-secondary)' }}>{label}: </span>
                <span style={{ fontWeight: 700, color: 'var(--w-text-tertiary)' }}>{value}</span>
              </p>
            ))}
          </div>
        </div>

        <button
          onClick={onOptimizeClick}
          style={{
            background: 'linear-gradient(174deg, var(--w-indigo) 0%, var(--w-accent-blue) 100%)',
            borderRadius: '7px',
            padding: '9px 18px',
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 700,
            fontSize: '13px',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
          }}
        >
          ✦ Optimize Staffing
        </button>
      </div>
    </div>
  );
}

export default ProjectHeaderCard;
