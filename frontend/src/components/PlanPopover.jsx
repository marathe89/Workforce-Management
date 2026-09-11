import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LightboxModal from './LightboxModal';

// "Plan →" — defines a real interaction for what was a decorative
// button: opens a lightbox summarizing the business unit's demand gap
// and a deterministic, rule-based sourcing recommendation (hire /
// redeploy / contract split), derived from the gap size and risk level
// — not a fabricated AI recommendation. "Add to Workforce Plan" is a
// clearly-labeled local/session action (no workforce-planning backend
// exists for this screen), and there's a real link across to the
// Workforce Planning page for the broader scenario-planning view.
//
// Renders as a centered lightbox (LightboxModal) — same modal pattern as
// AssignModal/OptimizeStaffingPanel — rather than a small anchored
// popover: bigger, easier to read, and immune to the anchor-clipping
// issue a plain positioned popover had inside this table's
// horizontally-scrollable wrapper.
const SOURCING_BY_RISK = {
  Critical: { hire: 55, redeploy: 25, contract: 20, note: 'Gap is too large to close by redeployment alone — prioritize external hiring alongside cross-BU redeployment.' },
  High: { hire: 40, redeploy: 35, contract: 25, note: 'Blend hiring with redeployment from lower-utilization business units; contract cover for near-term peaks.' },
  Medium: { hire: 20, redeploy: 55, contract: 25, note: 'Mostly coverable through redeployment from partially allocated capacity elsewhere.' },
  Low: { hire: 5, redeploy: 70, contract: 25, note: 'Small gap — monitor and cover opportunistically from the bench; no urgent hiring need.' },
};

function PlanPopover({ row, planned, onTogglePlanned }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const sourcing = SOURCING_BY_RISK[row.risk];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-expanded={open}
        style={{
          border: `1px solid ${planned ? 'var(--w-green)' : 'color-mix(in srgb, var(--w-accent-blue) 25%, transparent)'}`,
          borderRadius: '4px',
          padding: '4px 10px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: planned ? 600 : 400,
          fontSize: '10px',
          color: planned ? 'var(--w-green)' : 'var(--w-accent-blue)',
          whiteSpace: 'nowrap',
        }}
      >
        {planned ? '✓ Planned' : 'Plan →'}
      </button>

      {open && (
        <LightboxModal onClose={() => setOpen(false)} width={480} titleId="plan-title">
          <p id="plan-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)', paddingRight: '24px' }}>
            {row.unit}
          </p>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '14px', fontWeight: 600, color: 'var(--w-red)', marginTop: '6px' }}>
            +{row.q4Gap.toLocaleString()} FTE gap by Q4
          </p>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-tertiary)', marginTop: '14px' }}>{sourcing.note}</p>

          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)', marginTop: '20px' }}>
            Suggested sourcing mix
          </p>
          <div className="flex" style={{ height: '12px', borderRadius: '6px', overflow: 'hidden', marginTop: '8px', gap: '2px' }}>
            <div style={{ width: `${sourcing.hire}%`, background: 'var(--w-accent-blue)' }} title={`Hire ${sourcing.hire}%`} />
            <div style={{ width: `${sourcing.redeploy}%`, background: 'var(--w-green)' }} title={`Redeploy ${sourcing.redeploy}%`} />
            <div style={{ width: `${sourcing.contract}%`, background: 'var(--w-amber)' }} title={`Contract ${sourcing.contract}%`} />
          </div>
          <div className="flex items-center gap-4" style={{ marginTop: '8px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-accent-blue)' }}>● Hire {sourcing.hire}%</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-green)' }}>● Redeploy {sourcing.redeploy}%</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-amber)' }}>● Contract {sourcing.contract}%</span>
          </div>

          <div className="flex gap-3" style={{ marginTop: '22px' }}>
            <button
              onClick={onTogglePlanned}
              style={{
                flex: 1, borderRadius: '8px', padding: '11px 0',
                background: planned ? 'transparent' : 'var(--w-accent-blue)',
                border: planned ? '1px solid var(--w-green)' : 'none',
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '13px',
                color: planned ? 'var(--w-green)' : '#FFFFFF',
              }}
            >
              {planned ? '✓ Added to plan' : 'Add to Workforce Plan'}
            </button>
            <button
              onClick={() => navigate('/workforce-planning')}
              style={{ flex: 1, border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '11px 0', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-secondary)' }}
            >
              Open Workforce Planning
            </button>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)', marginTop: '10px' }}>
            Local to this session — no workforce-planning backend is connected here yet.
          </p>
        </LightboxModal>
      )}
    </>
  );
}

export default PlanPopover;
