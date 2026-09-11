import React, { useMemo, useState } from 'react';
import { CURRENT_WORKFORCE } from '../data/workforcePlanningData';
import LightboxModal from './LightboxModal';

// "Review Full Workforce Plan" — a real screen, not a dead-end button:
// the whole selected scenario in one place (gap summary, quarterly
// roadmap, every recommended action) with each action individually
// toggleable, so a manager can trim the plan down before approving
// rather than only ever accepting all-or-nothing. The combined FTE
// impact at the bottom recalculates live from whichever actions are
// still checked.
//
// "Approve Workforce Plan" is a clearly-labeled local/session action —
// no workforce-planning backend exists for this screen (see
// WorkforcePlanning.jsx's header comment) — it does not submit anywhere
// or notify anyone; it's guarded against being approved twice.
function ReviewWorkforcePlanModal({ scenario, onClose }) {
  const [included, setIncluded] = useState(() => new Set(scenario.actions.map((a) => a.num)));
  const [approved, setApproved] = useState(false);

  const toggle = (num) => setIncluded((prev) => {
    const next = new Set(prev);
    next.has(num) ? next.delete(num) : next.add(num);
    return next;
  });

  const combinedImpact = useMemo(
    () => scenario.actions.filter((a) => included.has(a.num)).reduce((sum, a) => sum + a.impact, 0),
    [scenario, included]
  );
  const coveragePct = Math.min(100, Math.round((combinedImpact / scenario.gap) * 100));

  return (
    <LightboxModal onClose={onClose} width={640} titleId="review-plan-title">
      <p id="review-plan-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--w-text-primary)', paddingRight: '24px' }}>
        Full Workforce Plan — {scenario.label}
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
        {CURRENT_WORKFORCE.toLocaleString()} current → {scenario.required.toLocaleString()} required · +{scenario.gap.toLocaleString()} FTE gap to close by Q2 2027
      </p>

      {/* Quarterly roadmap */}
      <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)', marginTop: '20px' }}>
        Quarterly Roadmap
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ marginTop: '8px' }}>
        {scenario.quarters.map((q) => (
          <div key={q.label} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '10px' }}>
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>{q.label}</p>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--w-text-primary)', marginTop: '4px' }}>{q.total.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Actions checklist */}
      <div className="flex items-center justify-between" style={{ marginTop: '20px' }}>
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>
          Recommended Actions
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)' }}>{included.size} of {scenario.actions.length} included</p>
      </div>
      <div className="flex flex-col gap-2" style={{ marginTop: '8px' }}>
        {scenario.actions.map((a) => {
          const isIncluded = included.has(a.num);
          return (
            <label
              key={a.num}
              className="flex items-center gap-3"
              style={{
                background: 'var(--w-sunken-bg)',
                border: `1px solid ${isIncluded ? `color-mix(in srgb, ${a.color} 25%, transparent)` : 'var(--w-divider)'}`,
                borderRadius: '8px', padding: '10px 14px', cursor: approved ? 'default' : 'pointer', opacity: isIncluded ? 1 : 0.5,
              }}
            >
              <input type="checkbox" checked={isIncluded} disabled={approved} onChange={() => toggle(a.num)} style={{ accentColor: a.color, flexShrink: 0 }} />
              <span className="flex-1 min-w-0">
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-primary)', display: 'block' }}>{a.title}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>{a.subtitle}</span>
              </span>
              <span
                style={{
                  background: `color-mix(in srgb, ${a.color} 13%, transparent)`, border: `1px solid color-mix(in srgb, ${a.color} 25%, transparent)`,
                  borderRadius: '10px', padding: '2px 9px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', color: a.color, whiteSpace: 'nowrap',
                }}
              >
                {a.tag}
              </span>
            </label>
          );
        })}
      </div>

      {/* Impact metrics */}
      <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)', marginTop: '20px' }}>
        Projected Impact
      </p>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2" style={{ marginTop: '8px' }}>
        {scenario.metrics.map((m) => (
          <div key={m.label} className="flex flex-col items-center" style={{ background: 'var(--w-sunken-bg)', border: `1px solid color-mix(in srgb, ${m.color} 13%, transparent)`, borderRadius: '8px', padding: '12px' }}>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: m.color }}>{m.value}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-secondary)', marginTop: '3px', textAlign: 'center' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Live combined coverage */}
      <div style={{ marginTop: '20px', background: 'color-mix(in srgb, var(--w-accent-blue) 8%, var(--w-sunken-bg))', border: '1px solid color-mix(in srgb, var(--w-accent-blue) 25%, transparent)', borderRadius: '9px', padding: '14px 16px' }}>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-primary)' }}>Combined FTE impact of included actions</span>
          <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 700, fontSize: '16px', color: 'var(--w-accent-blue)' }}>{combinedImpact.toLocaleString()} FTE</span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', background: 'var(--w-divider)', marginTop: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${coveragePct}%`, height: '100%', background: 'var(--w-accent-blue)' }} />
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '6px' }}>
          Covers {coveragePct}% of the +{scenario.gap.toLocaleString()} FTE gap for {scenario.label.toLowerCase()}.
        </p>
      </div>

      <div className="flex gap-3" style={{ marginTop: '20px' }}>
        <button onClick={onClose} className="flex-1" style={{ border: '1px solid var(--w-card-border)', borderRadius: '8px', height: '42px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-secondary)' }}>
          Close
        </button>
        <button
          onClick={() => setApproved(true)}
          disabled={approved || included.size === 0}
          className="flex-1"
          style={{
            borderRadius: '8px', height: '42px',
            background: approved || included.size === 0 ? 'var(--w-divider)' : 'linear-gradient(178deg, var(--w-indigo) 0%, var(--w-accent-blue) 100%)',
            fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: approved || included.size === 0 ? 'var(--w-text-label)' : '#FFFFFF',
          }}
        >
          {approved ? '✓ Plan Approved' : 'Approve Workforce Plan'}
        </button>
      </div>
      {approved && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '8px', textAlign: 'center' }}>
          Recorded for this session — no workforce-planning backend is connected here yet, so nothing has actually been requisitioned or notified.
        </p>
      )}
    </LightboxModal>
  );
}

export default ReviewWorkforcePlanModal;
