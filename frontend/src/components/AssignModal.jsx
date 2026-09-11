import React, { useState } from 'react';

// Confirmation dialog for TalentResultsTable's Assign workflow. No
// staffing backend exists (same convention as the rest of this app's
// mockup data) — confirming here only updates local component state in
// TalentResultsTable (marks the selected people "Assigned" for the rest
// of the session), it doesn't persist anywhere.
//
// Supports partial allocation across multiple projects at once — each
// row is its own card with a project (or Bench/Training), a % of the
// person's capacity (running total shown and capped at 100%), and its
// OWN start date (a real calendar picker, native <input type="date">,
// with an "Immediate" quick-toggle that hides it) — different projects
// in the same split can reasonably start on different dates, so the
// date lives per-row rather than once for the whole assignment.
const PROJECTS = ['Project Atlas', 'Project Orion', 'Project Nova', 'Project Horizon', 'Project Nexus', 'Project Titan', 'Project Quantum', 'Project Phoenix', 'Bench', 'Training'];
const TODAY = '2026-09-08';

let rowId = 0;
function newRow(project, percent) {
  rowId += 1;
  return { id: rowId, project, percent, immediate: true, startDate: TODAY };
}

function AssignModal({ people, onCancel, onConfirm }) {
  const [rows, setRows] = useState([newRow(PROJECTS[0], 100)]);

  const total = rows.reduce((sum, r) => sum + (Number(r.percent) || 0), 0);
  const remaining = 100 - total;
  const overAllocated = total > 100;

  const updateRow = (id, patch) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  // Redistributes evenly across all rows (existing + new) rather than
  // leaving the new one at a bare 0% the user has to manually balance —
  // e.g. one row at 100% + "add another" lands on 50/50, not 100/0.
  const addRow = () =>
    setRows((prev) => {
      const project = PROJECTS.find((p) => !prev.some((r) => r.project === p)) || PROJECTS[0];
      const count = prev.length + 1;
      const share = Math.floor(100 / count);
      const rebalanced = prev.map((r, i) => ({ ...r, percent: i === 0 ? 100 - share * (count - 1) : share }));
      return [...rebalanced, newRow(project, share)];
    });

  const canConfirm = rows.length > 0 && total > 0 && !overAllocated;

  const handleConfirm = () => {
    onConfirm({
      allocations: rows.map((r) => ({
        project: r.project,
        percent: Number(r.percent) || 0,
        startDate: r.immediate ? 'Immediate' : r.startDate,
      })),
    });
  };

  return (
    <>
      <div onClick={onCancel} className="fixed inset-0 z-40" style={{ background: 'rgba(0, 0, 0, 0.5)' }} />
      <div
        className="fixed z-50"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '480px',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          background: 'var(--w-card-bg)',
          border: '1px solid var(--w-card-border)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
        }}
      >
        <button
          onClick={onCancel}
          aria-label="Close"
          style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '20px', lineHeight: 1, color: 'var(--w-text-label)' }}
        >
          ×
        </button>
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)', paddingRight: '24px' }}>
          Assign {people.length > 1 ? `${people.length} Employees` : people[0]?.name}
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-label)', marginTop: '4px' }}>
          {people.length > 1 ? people.map((p) => p.name).join(', ') : people[0]?.role}
        </p>

        {/* Project allocation rows — partial/split allocation across
            multiple projects (or Bench/Training) at once, each with its
            own start date. */}
        <div style={{ marginTop: '18px' }}>
          <div className="flex items-center justify-between">
            <label style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>
              Project Allocation
            </label>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', fontWeight: 600, color: overAllocated ? 'var(--w-red)' : 'var(--w-text-secondary)' }}>
              {total}% allocated
            </span>
          </div>

          <div className="flex flex-col gap-2.5" style={{ marginTop: '8px' }}>
            {rows.map((row) => (
              <div key={row.id} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '10px' }}>
                <div className="flex items-center gap-2">
                  <select
                    value={row.project}
                    onChange={(e) => updateRow(row.id, { project: e.target.value })}
                    className="flex-1"
                    style={{
                      background: 'var(--w-card-bg)',
                      border: '1px solid var(--w-card-border)',
                      borderRadius: '6px',
                      height: '34px',
                      padding: '0 10px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: 'var(--w-text-primary)',
                      minWidth: 0,
                    }}
                  >
                    {PROJECTS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <div className="relative shrink-0" style={{ width: '72px' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.percent}
                      onChange={(e) => updateRow(row.id, { percent: e.target.value.replace(/[^0-9]/g, '').slice(0, 3) })}
                      style={{
                        width: '100%',
                        background: 'var(--w-card-bg)',
                        border: '1px solid var(--w-card-border)',
                        borderRadius: '6px',
                        height: '34px',
                        padding: '0 20px 0 8px',
                        fontFamily: '"DM Mono", monospace',
                        fontSize: '12px',
                        color: 'var(--w-text-primary)',
                      }}
                    />
                    <span style={{ position: 'absolute', right: '7px', top: '8px', fontSize: '11px', color: 'var(--w-text-label)' }}>%</span>
                  </div>
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    aria-label="Remove project"
                    className="shrink-0"
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      color: rows.length === 1 ? 'var(--w-text-label)' : 'var(--w-red)',
                      opacity: rows.length === 1 ? 0.4 : 1,
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Per-row start date. */}
                <div className="flex items-center gap-2" style={{ marginTop: '8px' }}>
                  <label className="flex items-center gap-1.5 shrink-0" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>
                    <input type="checkbox" checked={row.immediate} onChange={(e) => updateRow(row.id, { immediate: e.target.checked })} />
                    Immediate
                  </label>
                  {!row.immediate && (
                    <>
                      <input
                        type="date"
                        value={row.startDate}
                        min={TODAY}
                        onChange={(e) => updateRow(row.id, { startDate: e.target.value })}
                        className="flex-1"
                        style={{
                          background: 'var(--w-card-bg)',
                          border: '1px solid var(--w-card-border)',
                          borderRadius: '6px',
                          height: '30px',
                          padding: '0 8px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          color: 'var(--w-text-primary)',
                          colorScheme: 'light dark',
                          minWidth: 0,
                        }}
                      />
                      {/* Invisible spacer matching the remove (×) button's
                          width above, so the date field's right edge lines
                          up with the % field's right edge rather than
                          running under the × button. */}
                      <span aria-hidden="true" className="shrink-0" style={{ width: '26px' }} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {overAllocated && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-red)', marginTop: '6px' }}>
              Total allocation can't exceed 100%.
            </p>
          )}

          <button
            onClick={addRow}
            disabled={rows.length >= PROJECTS.length}
            style={{
              marginTop: '8px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '12px',
              color: rows.length >= PROJECTS.length ? 'var(--w-text-label)' : 'var(--w-accent-blue)',
            }}
          >
            + Add another project{remaining > 0 && remaining < 100 ? ` (${remaining}% left)` : ''}
          </button>
        </div>

        <div className="flex gap-2" style={{ marginTop: '22px' }}>
          <button
            onClick={onCancel}
            className="flex-1"
            style={{
              border: '1px solid var(--w-card-border)',
              borderRadius: '8px',
              height: '38px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '13px',
              color: 'var(--w-text-secondary)',
              background: 'transparent',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1"
            style={{
              background: canConfirm ? 'var(--w-accent-blue)' : 'var(--w-divider)',
              borderRadius: '8px',
              height: '38px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              color: canConfirm ? '#FFFFFF' : 'var(--w-text-label)',
            }}
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </>
  );
}

export default AssignModal;
