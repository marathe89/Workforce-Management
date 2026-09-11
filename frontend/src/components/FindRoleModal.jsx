import React, { useState } from 'react';
import {
  ROLES, getEmployeeAvailableFrom, getEmployeeRemainingCapacityPercent, getRoleRemainingDemand,
  getDefaultAllocation, matchRole, AS_OF_DATE,
} from '../data/benchWorkflowData';
import useBenchWorkflowStore from '../stores/benchWorkflowStore';
import AssignmentEditor from './AssignmentEditor';
import LightboxModal from './LightboxModal';

// "Find Role" — the manager browses open requirements in the employee's
// own context (bench-management-workflow.md). A role must represent an
// actual open requirement (data/benchWorkflowData.js's ROLES), not a
// generic project picked from a dropdown — every card shows the real
// project, role title, required skills, current open demand, dates and
// whether partial fulfillment is accepted, plus the employee's own
// eligible allocation for it.
function FindRoleModal({ employee, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const bookings = useBenchWorkflowStore((s) => s.bookings);

  const availableFrom = getEmployeeAvailableFrom(employee, bookings);
  const remainingToday = getEmployeeRemainingCapacityPercent(employee, AS_OF_DATE, bookings);

  const q = query.trim().toLowerCase();
  const roles = ROLES.filter((r) => !q || [r.project, r.role, ...r.requiredSkills, ...r.preferredSkills].join(' ').toLowerCase().includes(q));

  if (selectedRole) {
    const role = selectedRole;
    const defaults = getDefaultAllocation(employee, role, bookings);
    return (
      <AssignmentEditor
        employee={employee}
        source="find-role"
        initialRows={[{ roleId: role.id, percent: defaults.percent, startDate: defaults.startDate, endDate: defaults.endDate, startToday: defaults.startDate === AS_OF_DATE }]}
        onClose={onClose}
      />
    );
  }

  return (
    <LightboxModal onClose={onClose} width={560} titleId="find-role-title">
      <p id="find-role-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)', paddingRight: '24px' }}>
        Find Role — {employee.name}
      </p>

      <div style={{ marginTop: '10px', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '8px', padding: '12px 14px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>{employee.role || employee.practice}</p>
        <div className="flex flex-wrap gap-1" style={{ marginTop: '6px' }}>
          {employee.skills.map((s) => (
            <span key={s} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '4px', padding: '2px 7px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)' }}>{s}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3" style={{ marginTop: '8px' }}>
          <div>
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Existing commitments</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', marginTop: '2px' }}>
              {employee.commitments?.length ? employee.commitments.map((c) => `${c.name} (${Math.round((c.hoursPerWeek / 40) * 100)}%)`).join(', ') : 'None — full bench'}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>Remaining capacity / available from</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-green)', marginTop: '2px' }}>{remainingToday}% today · {availableFrom || 'not within horizon'}</p>
          </div>
        </div>
      </div>

      <input
        type="text" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by role, project or skill…"
        aria-label="Search open roles"
        style={{ marginTop: '14px', width: '100%', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', height: '36px', padding: '0 12px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-primary)' }}
      />

      <div className="flex flex-col gap-3" style={{ marginTop: '12px' }}>
        {roles.length === 0 && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-tertiary)' }}>No open roles match "{query}".</p>
        )}
        {roles.map((role) => {
          const remaining = getRoleRemainingDemand(role, bookings);
          const match = matchRole(employee, role, bookings);
          const canSelect = match.eligible;
          return (
            <div key={role.id} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '9px', padding: '14px 16px', opacity: canSelect ? 1 : 0.6 }}>
              <div className="flex items-center justify-between gap-2">
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--w-text-primary)' }}>{role.project} — {role.role}</span>
                <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 700, fontSize: '12px', color: remaining > 0 ? 'var(--w-amber)' : 'var(--w-text-label)' }}>{remaining}% open</span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
                Required: {role.requiredSkills.join(', ')}{role.preferredSkills.length > 0 && ` · Preferred: ${role.preferredSkills.join(', ')}`}
              </p>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '2px' }}>
                {role.startDate} → {role.endDate} · {role.partialFulfillment ? `partial fulfillment accepted (min ${role.minContributionPercent}%)` : '100% only'}
              </p>
              {!canSelect && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-red)', marginTop: '6px' }}>
                  {match.missingRequiredSkills.length > 0
                    ? `Missing required skill${match.missingRequiredSkills.length === 1 ? '' : 's'}: ${match.missingRequiredSkills.join(', ')}`
                    : remaining <= 0 ? 'No vacancy remaining.' : 'Not available within this role\'s dates.'}
                </p>
              )}
              <button
                onClick={() => canSelect && setSelectedRole(role)}
                disabled={!canSelect}
                style={{ marginTop: '10px', background: canSelect ? 'var(--w-accent-blue)' : 'var(--w-divider)', borderRadius: '6px', padding: '7px 16px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: canSelect ? '#FFFFFF' : 'var(--w-text-label)' }}
              >
                Select
              </button>
            </div>
          );
        })}
      </div>
    </LightboxModal>
  );
}

export default FindRoleModal;
