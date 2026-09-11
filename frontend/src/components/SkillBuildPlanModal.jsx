import React, { useState } from 'react';

// "Build Plan" — a real two-step workflow for closing one skill's supply
// gap, replacing what was a decorative button. Step 1 lets the manager
// set a target timeframe and a sourcing mix (Upskill existing staff /
// Hire / Contract); step 2 deterministically translates that mix into a
// headcount plan against the skill's actual gap and shows a plain-
// language explanation — not an AI recommendation. "Add to Skills
// Development Plan" is a clearly-labeled local/session action: no
// learning & development or recruiting backend is connected to this
// screen, so nothing is actually requisitioned or enrolled.
const TIMEFRAMES = ['Next Quarter', 'Next 2 Quarters', 'Next Year'];

const DEFAULT_MIX = { upskill: 40, hire: 40, contract: 20 };

function SkillBuildPlanModal({ row, onClose, planned, onConfirm }) {
  const [step, setStep] = useState(planned ? 2 : 1);
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]);
  const [mix, setMix] = useState(DEFAULT_MIX);
  const [prioritizeAdjacent, setPrioritizeAdjacent] = useState(true);

  const gap = Math.abs(row.gap);
  const total = mix.upskill + mix.hire + mix.contract;

  // Keeps the three sliders summing to 100 — moving one adjusts the
  // other two proportionally rather than letting the total drift.
  const updateMix = (key, value) => {
    const others = Object.keys(mix).filter((k) => k !== key);
    const remaining = 100 - value;
    const othersTotal = others.reduce((sum, k) => sum + mix[k], 0) || 1;
    const next = { [key]: value };
    others.forEach((k) => { next[k] = Math.round((mix[k] / othersTotal) * remaining); });
    // rounding can leave the total off by 1 — absorb it into the last key
    const drift = 100 - (next[key] + others.reduce((s, k) => s + next[k], 0));
    next[others[others.length - 1]] += drift;
    setMix((m) => ({ ...m, ...next }));
  };

  const counts = {
    upskill: Math.round((mix.upskill / 100) * gap),
    hire: Math.round((mix.hire / 100) * gap),
    contract: Math.round((mix.contract / 100) * gap),
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div
        role="dialog" aria-modal="true" aria-labelledby="build-plan-title"
        className="fixed z-50"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '520px', maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '12px', padding: '24px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p id="build-plan-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '17px', color: 'var(--w-text-primary)' }}>
              Build Plan — {row.skill}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
              Current gap: <strong style={{ color: row.color }}>{row.gap}</strong> ({row.gapPct}) · Step {step} of 2
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ fontSize: '18px', color: 'var(--w-text-label)' }}>×</button>
        </div>

        {step === 1 && (
          <div style={{ marginTop: '18px' }}>
            <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
              Target timeframe
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                style={{ display: 'block', marginTop: '4px', width: '100%', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '32px', padding: '0 10px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)' }}
              >
                {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>

            <label className="flex items-center gap-2" style={{ marginTop: '14px' }}>
              <input type="checkbox" checked={prioritizeAdjacent} onChange={(e) => setPrioritizeAdjacent(e.target.checked)} style={{ accentColor: 'var(--w-accent-blue)' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>Prioritize employees with adjacent skills for upskilling</span>
            </label>

            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)', marginTop: '18px' }}>
              Sourcing mix
            </p>
            {[
              { key: 'upskill', label: 'Upskill existing employees', color: 'var(--w-green)' },
              { key: 'hire', label: 'Hire', color: 'var(--w-accent-blue)' },
              { key: 'contract', label: 'Contract / bench partner', color: 'var(--w-amber)' },
            ].map((row2) => (
              <div key={row2.key} style={{ marginTop: '10px' }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>{row2.label}</span>
                  <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: row2.color }}>{mix[row2.key]}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={mix[row2.key]}
                  onChange={(e) => updateMix(row2.key, Number(e.target.value))}
                  style={{ width: '100%', marginTop: '4px', accentColor: row2.color }}
                />
              </div>
            ))}
            {total !== 100 && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-red)', marginTop: '4px' }}>Mix totals {total}% — adjust to 100%.</p>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={total !== 100}
              style={{ marginTop: '20px', width: '100%', height: '38px', borderRadius: '7px', background: total === 100 ? 'var(--w-accent-blue)' : 'var(--w-divider)', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: total === 100 ? '#FFFFFF' : 'var(--w-text-label)' }}
            >
              Generate Plan
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ marginTop: '18px' }}>
            <div style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '8px', padding: '14px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>
                To close the <strong style={{ color: row.color }}>{gap}</strong>-person {row.skill} gap over the <strong style={{ color: 'var(--w-text-primary)' }}>{timeframe.toLowerCase()}</strong>{prioritizeAdjacent ? ', prioritizing people with adjacent skills for upskilling' : ''}:
              </p>
              <div className="flex flex-col gap-2" style={{ marginTop: '10px' }}>
                {[
                  { key: 'upskill', label: 'Upskill existing employees', color: 'var(--w-green)' },
                  { key: 'hire', label: 'New hires', color: 'var(--w-accent-blue)' },
                  { key: 'contract', label: 'Contract / bench partners', color: 'var(--w-amber)' },
                ].map((r) => (
                  <div key={r.key} className="flex items-center justify-between">
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>{r.label}</span>
                    <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 700, fontSize: '13px', color: r.color }}>{counts[r.key]} people</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '10px', fontStyle: 'italic' }}>
              Deterministic split of the {gap}-person gap by your chosen sourcing mix percentages — not a machine-learning recommendation.
            </p>

            <div className="flex gap-2" style={{ marginTop: '18px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, border: '1px solid var(--w-card-border)', borderRadius: '7px', height: '38px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-secondary)' }}>
                Back
              </button>
              <button
                onClick={() => { onConfirm({ timeframe, mix, counts }); onClose(); }}
                disabled={planned}
                style={{ flex: 2, borderRadius: '7px', height: '38px', background: planned ? 'var(--w-divider)' : 'var(--w-accent-blue)', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: planned ? 'var(--w-text-label)' : '#FFFFFF' }}
              >
                {planned ? '✓ Already added' : 'Add to Skills Development Plan'}
              </button>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: 'var(--w-text-label)', marginTop: '6px' }}>
              Local to this session — no learning & development or recruiting system is connected here yet.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default SkillBuildPlanModal;
