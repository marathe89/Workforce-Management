import React, { useMemo, useState } from 'react';
import {
  ROLES, AS_OF_DATE, computeIntervals, validateProposal, getBookingStatus,
  getEmployeeAvailableFrom, getRoleRemainingDemand, isAfter,
} from '../data/benchWorkflowData';
import useBenchWorkflowStore from '../stores/benchWorkflowStore';
import LightboxModal from './LightboxModal';

// Shared assignment editor — the single place both "Find Role" and
// "AI Match" converge on (bench-management-workflow.md). Existing
// commitments are always shown read-only and are never overwritten by a
// proposed role; "Add another role" lets a second open requirement be
// proposed alongside the first, and the "Allocation by date" table below
// makes the resulting per-interval math visible instead of hiding it
// behind one blended percentage.
//
// Two explicit stages: adjust the rows, then "Review assignment" (only
// enabled once validation passes) reveals a read-only summary, and only
// THEN does "Confirm Assignment" commit — guarded against double
// submission by the store.
function AssignmentEditor({ employee, initialRows, source, onClose }) {
  const [rows, setRows] = useState(initialRows);
  const [reviewing, setReviewing] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState(null);
  const confirm = useBenchWorkflowStore((s) => s.confirm);
  const bookings = useBenchWorkflowStore((s) => s.bookings);
  const confirming = useBenchWorkflowStore((s) => s.confirming[employee.id]);

  const errors = useMemo(() => validateProposal(employee, rows, bookings), [employee, rows, bookings]);
  const intervals = useMemo(() => computeIntervals(employee, rows, bookings), [employee, rows, bookings]);
  const availableFrom = useMemo(() => getEmployeeAvailableFrom(employee, bookings), [employee, bookings]);

  const usedRoleIds = new Set(rows.map((r) => r.roleId));
  const addableRoles = ROLES.filter((r) => !usedRoleIds.has(r.id) && getRoleRemainingDemand(r, bookings) > 0);

  const updateRow = (roleId, patch) => setRows((prev) => prev.map((r) => (r.roleId === roleId ? { ...r, ...patch } : r)));
  const removeRow = (roleId) => setRows((prev) => prev.filter((r) => r.roleId !== roleId));
  const addRole = (role) => {
    const startDate = availableFrom === 'Immediate' || availableFrom == null ? role.startDate : (isAfter(availableFrom, role.startDate) ? availableFrom : role.startDate);
    setRows((prev) => [...prev, { roleId: role.id, percent: role.minContributionPercent, startDate, endDate: role.endDate, startToday: false }]);
    setReviewing(false);
  };

  const handleConfirm = () => {
    const payload = rows.map((r) => ({ roleId: r.roleId, percent: Number(r.percent) || 0, startDate: r.startDate, endDate: r.endDate, source }));
    const result = confirm(employee.id, payload);
    if (result.ok) setConfirmedBookings(result.bookings);
  };

  if (confirmedBookings) {
    return (
      <LightboxModal onClose={onClose} width={560} titleId="assignment-confirmed-title">
        <p id="assignment-confirmed-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)', paddingRight: '24px' }}>
          ✓ Assignment confirmed — {employee.name}
        </p>
        <div className="flex flex-col gap-2" style={{ marginTop: '14px' }}>
          {confirmedBookings.map((b) => {
            const role = ROLES.find((r) => r.id === b.roleId);
            const status = getBookingStatus(b);
            return (
              <div key={b.id} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '8px', padding: '10px 14px' }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-primary)' }}>{role.project} — {role.role}</span>
                  <span style={{ background: status === 'Active' ? 'color-mix(in srgb, var(--w-green) 15%, transparent)' : 'color-mix(in srgb, var(--w-accent-blue) 15%, transparent)', color: status === 'Active' ? 'var(--w-green)' : 'var(--w-accent-blue)', borderRadius: '10px', padding: '2px 9px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '10px' }}>{status}</span>
                </div>
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-secondary)', marginTop: '4px' }}>{b.percent}% · {b.startDate} → {b.endDate}</p>
              </div>
            );
          })}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)', marginTop: '12px' }}>
          Scheduled bookings reserve future capacity but don't change today's ({AS_OF_DATE}) bench status until they start. This is a local, session-only booking — no real calendar, approval or notification system is connected here.
        </p>
        <button onClick={onClose} className="w-full" style={{ marginTop: '16px', height: '40px', borderRadius: '8px', background: 'var(--w-accent-blue)', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>
          Done
        </button>
      </LightboxModal>
    );
  }

  return (
    <LightboxModal onClose={onClose} width={640} titleId="assignment-editor-title">
      <p id="assignment-editor-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)', paddingRight: '24px' }}>
        Assign {employee.name}
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>{employee.role || employee.practice}</p>

      {employee.commitments && employee.commitments.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Existing commitments (protected)</p>
          <div className="flex flex-col gap-1.5" style={{ marginTop: '6px' }}>
            {employee.commitments.map((c) => (
              <div key={c.id} className="flex items-center justify-between" style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '6px', padding: '7px 12px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>{c.name}</span>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-tertiary)' }}>{Math.round((c.hoursPerWeek / 40) * 100)}% · {c.startDate} → {c.endDate} · read-only</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '16px' }}>
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Proposed roles</p>
        <div className="flex flex-col gap-3" style={{ marginTop: '8px' }}>
          {rows.map((row) => {
            const role = ROLES.find((r) => r.id === row.roleId);
            return (
              <div key={row.roleId} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '12px 14px' }}>
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--w-text-primary)' }}>{role.project} — {role.role}</span>
                  <button onClick={() => { removeRow(row.roleId); setReviewing(false); }} aria-label={`Remove ${role.role}`} style={{ color: 'var(--w-red)', fontSize: '13px' }}>×</button>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '2px' }}>
                  from {source === 'ai-match' ? 'AI Match recommendation' : 'Find Role'} · role window {role.startDate} → {role.endDate}
                </p>

                <div className="flex items-end gap-2 flex-wrap" style={{ marginTop: '10px' }}>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
                    Allocation %
                    <input
                      type="number" min={role.minContributionPercent} max="100" value={row.percent}
                      onChange={(e) => { updateRow(row.roleId, { percent: e.target.value.replace(/[^0-9]/g, '').slice(0, 3) }); setReviewing(false); }}
                      style={{ display: 'block', marginTop: '3px', width: '76px', background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '32px', padding: '0 8px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-primary)' }}
                    />
                  </label>
                  <label className="flex items-center gap-1.5" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)', paddingBottom: '8px' }}>
                    <input
                      type="checkbox" checked={row.startToday}
                      disabled={availableFrom !== 'Immediate' || isAfter(AS_OF_DATE, role.endDate) || isBeforeRoleStart(AS_OF_DATE, role)}
                      onChange={(e) => { updateRow(row.roleId, { startToday: e.target.checked, startDate: e.target.checked ? AS_OF_DATE : row.startDate }); setReviewing(false); }}
                      style={{ accentColor: 'var(--w-accent-blue)' }}
                    />
                    Start today
                  </label>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
                    Start date
                    <input
                      type="date" value={row.startDate} min={role.startDate} max={role.endDate} disabled={row.startToday}
                      onChange={(e) => { updateRow(row.roleId, { startDate: e.target.value }); setReviewing(false); }}
                      style={{ display: 'block', marginTop: '3px', background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '32px', padding: '0 8px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-primary)', colorScheme: 'light dark' }}
                    />
                  </label>
                  <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-secondary)' }}>
                    End date
                    <input
                      type="date" value={row.endDate} min={row.startDate} max={role.endDate}
                      onChange={(e) => { updateRow(row.roleId, { endDate: e.target.value }); setReviewing(false); }}
                      style={{ display: 'block', marginTop: '3px', background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '32px', padding: '0 8px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-primary)', colorScheme: 'light dark' }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {addableRoles.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ marginTop: '8px' }}>
            {addableRoles.map((r) => (
              <button key={r.id} onClick={() => addRole(r)} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-accent-blue)' }}>
                + Add {r.project} — {r.role}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Allocation by date</p>
        <div className="flex flex-col gap-1" style={{ marginTop: '6px' }}>
          {intervals.map((iv, i) => (
            <div key={i} className="flex items-center justify-between" style={{ background: 'var(--w-sunken-bg)', borderRadius: '6px', padding: '6px 10px' }}>
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--w-text-tertiary)' }}>{iv.start} → {iv.end}</span>
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-secondary)' }}>
                existing {Math.round(iv.existingPct)}% + proposed {Math.round(iv.proposedPct)}% = <strong style={{ color: iv.totalPct > 100 ? 'var(--w-red)' : 'var(--w-text-primary)' }}>{Math.round(iv.totalPct)}%</strong>
                {' '}({Math.max(0, Math.round(iv.remainingPct))}% remaining)
              </span>
            </div>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <ul style={{ marginTop: '12px' }}>
          {errors.map((e, i) => (
            <li key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: 'var(--w-red)', marginTop: '3px' }}>⚠ {e.message}</li>
          ))}
        </ul>
      )}

      {reviewing && errors.length === 0 && (
        <div style={{ marginTop: '14px', background: 'color-mix(in srgb, var(--w-accent-blue) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--w-accent-blue) 25%, transparent)', borderRadius: '8px', padding: '12px 14px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--w-text-primary)' }}>Review</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
            {rows.length} role{rows.length === 1 ? '' : 's'} proposed for {employee.name}. Each will be {getBookingStatus({ startDate: rows[0]?.startDate, endDate: rows[0]?.endDate }) === 'Scheduled' ? 'Scheduled (future start)' : 'checked individually'} on confirmation — a future start date reserves capacity without changing today's bench status.
          </p>
        </div>
      )}

      <div className="flex gap-3" style={{ marginTop: '18px' }}>
        <button onClick={onClose} className="flex-1" style={{ border: '1px solid var(--w-card-border)', borderRadius: '8px', height: '40px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-secondary)' }}>
          Cancel
        </button>
        {!reviewing ? (
          <button
            onClick={() => setReviewing(true)}
            disabled={errors.length > 0 || rows.length === 0}
            className="flex-1"
            style={{ borderRadius: '8px', height: '40px', background: errors.length === 0 && rows.length > 0 ? 'var(--w-accent-blue)' : 'var(--w-divider)', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: errors.length === 0 && rows.length > 0 ? '#FFFFFF' : 'var(--w-text-label)' }}
          >
            Review assignment
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={confirming || errors.length > 0}
            className="flex-1"
            style={{ borderRadius: '8px', height: '40px', backgroundImage: 'linear-gradient(178deg, var(--w-indigo) 0%, var(--w-accent-blue) 100%)', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', opacity: confirming ? 0.6 : 1 }}
          >
            {confirming ? 'Confirming…' : 'Confirm Assignment'}
          </button>
        )}
      </div>
    </LightboxModal>
  );
}

function isBeforeRoleStart(dateISO, role) {
  return isAfter(role.startDate, dateISO);
}

export default AssignmentEditor;
