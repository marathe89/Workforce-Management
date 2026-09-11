import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFilterStore from '../stores/filterStore';
import { BASE, getFactor, getUtilDelta, fmtNum } from '../data/filterMetrics';

// Based on the Coforge Workforce Intelligence Figma "Hidden Capacity
// Opportunity" widget (node 6:8544), but with its distinct amber gradient
// background/border normalized to the same flat card style as
// WorkforceHealthCard and ActiveAlertsCard, on request — Figma actually
// gives this one a highlighted treatment to set it apart from its siblings.
// Sits adjacent to WorkforceHealthCard in Overview.jsx. Base figures are
// the original static Figma mockup content, scaled by Overview's shared
// filter model (see filterMetrics.js).
function HiddenCapacityCard() {
  const navigate = useNavigate();
  const applied = useFilterStore((s) => s.applied);
  const factor = getFactor(applied);
  const utilDelta = getUtilDelta(applied);

  const partiallyAllocated = fmtNum(BASE.partiallyAllocated * factor);
  const recoverableFTE = fmtNum(BASE.recoverableFTE * factor);
  // "Gain if optimized" reads as an opportunity, not a current-state
  // rate, so it stays positive even when the underlying utilDelta is
  // sharply negative (e.g. Allocation=Bench) — floor rather than clamp
  // symmetric, since a negative "gain" would read as self-contradictory.
  const utilizationGain = Math.max(0.2, BASE.utilizationGainPct + utilDelta * 0.3).toFixed(1);
  const benchReduction = Math.round(BASE.benchReductionFTE * factor);
  const costAvoidance = (BASE.costAvoidanceM * factor).toFixed(1);

  const METRICS = [
    { value: `${utilizationGain >= 0 ? '+' : ''}${utilizationGain}%`, label: 'Utilization Gain', good: utilizationGain >= 0 },
    { value: `-${fmtNum(benchReduction)} FTE`, label: 'Bench Reduction', good: true },
    { value: `$${costAvoidance}M`, label: 'Cost Avoidance', good: true },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid var(--w-card-border)',
        background: 'var(--w-card-bg)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'var(--w-amber)' }}>◈</span>
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
          Hidden Capacity Opportunity
        </p>
      </div>

      {/* Rich-text summary */}
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', lineHeight: '18px', marginTop: '8px' }}>
        <span style={{ fontWeight: 700, color: 'var(--w-amber)' }}>{partiallyAllocated} employees</span>
        <span style={{ fontWeight: 400, color: 'var(--w-text-tertiary)' }}> are partially allocated, representing approximately </span>
        <span style={{ fontWeight: 700, color: 'var(--w-text-primary)' }}>{recoverableFTE} FTE</span>
        <span style={{ fontWeight: 400, color: 'var(--w-text-tertiary)' }}> of potentially recoverable capacity.</span>
      </p>

      {/* Mini metrics */}
      <div className="grid grid-cols-3 gap-2" style={{ marginTop: '12px' }}>
        {METRICS.map((m) => (
          <div key={m.label} style={{ background: 'var(--w-sunken-bg)', borderRadius: '6px', padding: '8px 10px' }}>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '14px', lineHeight: '21px', color: m.good ? 'var(--w-green)' : 'var(--w-red)', textAlign: 'center' }}>
              {m.value}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '10px', lineHeight: '15px', color: 'var(--w-text-label)', textAlign: 'center', marginTop: '2px' }}>
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Buttons — pinned to the bottom so the card's now-equalized height
          (see Overview.jsx) puts blank space above them, not below. */}
      <div className="flex gap-2" style={{ marginTop: 'auto', paddingTop: '14px' }}>
        <button
          onClick={() => navigate('/workforce-planning')}
          className="flex-1"
          style={{
            background: 'var(--w-amber)',
            borderRadius: '6px',
            padding: '8px',
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 700,
            fontSize: '12px',
            lineHeight: '18px',
            // Not --w-sunken-bg: this is dark text sitting on the amber
            // button, unrelated to (and shouldn't invert with) the sunken
            // background color it happens to share a value with in dark
            // mode. Stays dark in both themes for contrast against amber.
            color: 'var(--w-text-on-accent-dark)',
          }}
        >
          Optimize Workforce
        </button>
        <button
          onClick={() => navigate('/capacity-utilization')}
          className="flex-1"
          style={{
            border: '1px solid var(--w-card-border)',
            borderRadius: '6px',
            padding: '8px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '18px',
            color: 'var(--w-text-tertiary)',
            background: 'transparent',
          }}
        >
          Explore Capacity
        </button>
      </div>
    </div>
  );
}

export default HiddenCapacityCard;
