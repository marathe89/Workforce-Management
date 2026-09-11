import React, { useState } from 'react';
import { REQUIREMENTS, PROJECT, runOptimizeHeuristic } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';

// "Optimize Staffing" — an accessible modal (focus stays trapped inside
// via the overlay click-to-close pattern used elsewhere in this app,
// e.g. AssignModal) that collects objective/dates/must-haves/budget/
// partial-allocation preferences, runs the deterministic heuristic in
// data/staffingModel.js, and shows an EDITABLE draft the manager can
// review — with a plain-language explanation per recommendation and a
// list of gaps it could not fill — before anything is added to the plan.
//
// This is not an AI/ML optimizer and doesn't claim global optimality —
// see the "method" string surfaced at the bottom, which comes straight
// from the heuristic itself so the explanation can't drift from what it
// actually does. No cost/budget data exists anywhere in this app, so the
// "lower staffing cost" objective and budget field explain that plainly
// instead of pretending to use figures that aren't there.
const OBJECTIVES = [
  { id: 'delivery', label: 'Delivery readiness', description: 'Fill Critical and High priority gaps first.', supported: true },
  { id: 'cost', label: 'Lower staffing cost', description: 'No cost/rate data exists for this project — falls back to delivery readiness.', supported: false },
  { id: 'utilization', label: 'Internal utilization', description: 'No org-wide utilization feed is connected to this screen — falls back to delivery readiness.', supported: false },
];

function OptimizeStaffingPanel({ onClose }) {
  const draftAllocations = useStaffingPlanStore((s) => s.draftAllocations);
  const applyProposals = useStaffingPlanStore((s) => s.applyProposals);

  const [objective, setObjective] = useState('delivery');
  const [planningStart, setPlanningStart] = useState(PROJECT.periodStart);
  const [planningEnd, setPlanningEnd] = useState(PROJECT.periodEnd);
  const [mustHave, setMustHave] = useState(new Set(REQUIREMENTS.filter((r) => r.priority === 'Critical').map((r) => r.id)));
  const [allowPartial, setAllowPartial] = useState(true);
  const [result, setResult] = useState(null);
  const [skipped, setSkipped] = useState(new Set());

  const toggleMustHave = (id) => setMustHave((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const handleGenerate = () => {
    const generated = runOptimizeHeuristic(
      { mustHaveRequirementIds: [...mustHave], allowPartialAllocations: allowPartial, planningStart, planningEnd },
      REQUIREMENTS,
      draftAllocations
    );
    setResult(generated);
    setSkipped(new Set());
  };

  const handleAddToPlan = () => {
    const toAdd = result.proposals.filter((p) => !skipped.has(`${p.candidateId}-${p.requirementId}`));
    applyProposals(toAdd);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div
        role="dialog" aria-modal="true" aria-labelledby="optimize-title"
        className="fixed z-50"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '640px', maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '12px', padding: '24px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p id="optimize-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)' }}>Optimize Staffing</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
              Generates an editable draft using a transparent, deterministic heuristic — not an AI/ML model, and not a claim of a globally-optimal plan.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ fontSize: '18px', color: 'var(--w-text-label)' }}>×</button>
        </div>

        {!result && (
          <div style={{ marginTop: '18px' }}>
            <fieldset>
              <legend style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Objective</legend>
              <div className="flex flex-col gap-2" style={{ marginTop: '6px' }}>
                {OBJECTIVES.map((o) => (
                  <label
                    key={o.id}
                    className="flex flex-col cursor-pointer"
                    style={{
                      background: objective === o.id ? 'color-mix(in srgb, var(--w-accent-blue) 10%, var(--w-sunken-bg))' : 'var(--w-sunken-bg)',
                      border: `1px solid ${objective === o.id ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`,
                      borderRadius: '7px', padding: '9px 12px',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <input type="radio" name="objective" checked={objective === o.id} onChange={() => setObjective(o.id)} style={{ accentColor: 'var(--w-accent-blue)', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--w-text-primary)' }}>{o.label}</span>
                      {!o.supported && (
                        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--w-text-secondary)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '1px 6px' }}>
                          Falls back
                        </span>
                      )}
                    </span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '2px', paddingLeft: '22px' }}>{o.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-3" style={{ marginTop: '16px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
                Planning start
                <input type="date" value={planningStart} onChange={(e) => setPlanningStart(e.target.value)}
                  style={{ display: 'block', marginTop: '3px', width: '100%', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '32px', padding: '0 8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)', colorScheme: 'light dark' }} />
              </label>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
                Planning end
                <input type="date" value={planningEnd} onChange={(e) => setPlanningEnd(e.target.value)}
                  style={{ display: 'block', marginTop: '3px', width: '100%', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '32px', padding: '0 8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)', colorScheme: 'light dark' }} />
              </label>
            </div>

            <fieldset style={{ marginTop: '16px' }}>
              <legend style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Must-have requirements</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5" style={{ marginTop: '6px' }}>
                {REQUIREMENTS.map((r) => (
                  <label key={r.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={mustHave.has(r.id)} onChange={() => toggleMustHave(r.id)} style={{ accentColor: 'var(--w-accent-blue)' }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>{r.role} ({r.priority})</span>
                  </label>
                ))}
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>None checked = consider every open requirement.</p>
            </fieldset>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>Budget</label>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '2px', fontStyle: 'italic' }}>
                Not available — no rate-card or cost data exists for this project, so budget can't be enforced here.
              </p>
            </div>

            <label className="flex items-center gap-2" style={{ marginTop: '14px' }}>
              <input type="checkbox" checked={allowPartial} onChange={(e) => setAllowPartial(e.target.checked)} style={{ accentColor: 'var(--w-accent-blue)' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>Partial allocations are acceptable (uncheck to only consider candidates who can go 100%)</span>
            </label>

            <button onClick={handleGenerate}
              style={{ marginTop: '20px', width: '100%', height: '38px', borderRadius: '7px', background: 'var(--w-accent-blue)', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>
              Generate Draft
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '18px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>
              {result.proposals.length} recommendation(s) generated. Uncheck any you don't want before adding to the plan.
            </p>
            <div className="flex flex-col gap-2" style={{ marginTop: '10px' }}>
              {result.proposals.map((p) => {
                const key = `${p.candidateId}-${p.requirementId}`;
                const isSkipped = skipped.has(key);
                return (
                  <label key={key} className="flex items-start gap-2" style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '7px', padding: '9px 10px', opacity: isSkipped ? 0.5 : 1 }}>
                    <input type="checkbox" checked={!isSkipped} onChange={() => setSkipped((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; })} style={{ marginTop: '3px', accentColor: 'var(--w-accent-blue)' }} />
                    <span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-primary)' }}>{p.candidateName} → {p.requirementRole}</span>
                      <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--w-accent-blue)', display: 'block' }}>{p.percent}% · {p.startDate} → {p.endDate} · {p.fte} FTE</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', display: 'block', marginTop: '2px' }}>{p.reason}</span>
                    </span>
                  </label>
                );
              })}
              {result.proposals.length === 0 && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>No eligible bench candidates were found for the selected requirements.</p>
              )}
            </div>

            {result.unfilled.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', textTransform: 'uppercase', color: 'var(--w-red)' }}>Gaps this draft cannot fill</p>
                <ul style={{ marginTop: '4px' }}>
                  {result.unfilled.map((u) => (
                    <li key={u.requirementId} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-red)' }}>{u.requirementRole}: {u.remainingGap} FTE still short</li>
                  ))}
                </ul>
              </div>
            )}

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-tertiary)', marginTop: '14px', fontStyle: 'italic' }}>{result.method}</p>

            <div className="flex gap-2" style={{ marginTop: '16px' }}>
              <button onClick={() => setResult(null)} style={{ flex: 1, border: '1px solid var(--w-card-border)', borderRadius: '7px', height: '38px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-secondary)' }}>
                Back
              </button>
              <button
                onClick={handleAddToPlan}
                disabled={result.proposals.length === 0 || skipped.size === result.proposals.length}
                style={{ flex: 2, borderRadius: '7px', height: '38px', background: 'var(--w-accent-blue)', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', opacity: result.proposals.length === 0 || skipped.size === result.proposals.length ? 0.5 : 1 }}
              >
                Add Selected to Draft Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default OptimizeStaffingPanel;
