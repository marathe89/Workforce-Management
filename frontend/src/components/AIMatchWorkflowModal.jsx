import React, { useState } from 'react';
import { getRankedRecommendations, getDefaultAllocation, AS_OF_DATE } from '../data/benchWorkflowData';
import useBenchWorkflowStore from '../stores/benchWorkflowStore';
import AssignmentEditor from './AssignmentEditor';
import FindRoleModal from './FindRoleModal';
import LightboxModal from './LightboxModal';

// "AI Match" — reviews explained recommendations rather than an
// unexplained employee-wide match percentage (bench-management-
// workflow.md). Up to 2 roles for this demo, each attached to real
// matching reasons (required/preferred skills, date compatibility,
// remaining vacancy) — explicit skill-overlap and availability rules,
// not a live AI model, and not a claim that these are verified staffing
// recommendations. Accepting opens the same shared AssignmentEditor as
// Find Role, editable before confirmation; dismissing removes it from
// this shortlist with an undo, and never changes any confirmed booking.
function AIMatchWorkflowModal({ employee, onClose }) {
  const [acceptedRole, setAcceptedRole] = useState(null);
  const [browsing, setBrowsing] = useState(false);
  const [justDismissed, setJustDismissed] = useState(null);
  const bookings = useBenchWorkflowStore((s) => s.bookings);
  const isDismissed = useBenchWorkflowStore((s) => s.isDismissed);
  const dismiss = useBenchWorkflowStore((s) => s.dismiss);
  const undoDismiss = useBenchWorkflowStore((s) => s.undoDismiss);

  const recommendations = getRankedRecommendations(employee, bookings, 2).filter((r) => !isDismissed(employee.id, r.role.id));

  if (browsing) return <FindRoleModal employee={employee} onClose={onClose} />;

  if (acceptedRole) {
    const defaults = getDefaultAllocation(employee, acceptedRole, bookings);
    return (
      <AssignmentEditor
        employee={employee}
        source="ai-match"
        initialRows={[{ roleId: acceptedRole.id, percent: defaults.percent, startDate: defaults.startDate, endDate: defaults.endDate, startToday: defaults.startDate === AS_OF_DATE }]}
        onClose={onClose}
      />
    );
  }

  return (
    <LightboxModal onClose={onClose} width={540} titleId="ai-match-workflow-title">
      <p id="ai-match-workflow-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)', paddingRight: '24px' }}>
        AI Match {recommendations.length > 0 && `· ${recommendations.length} role${recommendations.length === 1 ? '' : 's'}`} — {employee.name}
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
        Ranked by required/preferred skill match, date compatibility and remaining role vacancy — a rule-based demo, not a live AI model.
      </p>

      <div className="flex flex-col gap-3" style={{ marginTop: '16px' }}>
        {recommendations.length === 0 && (
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-tertiary)' }}>No eligible roles found.</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)', marginTop: '4px' }}>
              Either no open role's required skills fully match this profile, or the dates don't line up — nothing has been relaxed or invented to force a match.
            </p>
          </div>
        )}
        {recommendations.map(({ role, match, reasons }) => (
          <div key={role.id} style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '9px', padding: '14px 16px' }}>
            <div className="flex items-center justify-between gap-2">
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--w-text-primary)' }}>{role.project} — {role.role}</span>
              <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 700, fontSize: '12px', color: 'var(--w-amber)' }}>{match.remainingDemand}% open</span>
            </div>
            <ul style={{ marginTop: '6px' }}>
              {reasons.map((r) => (
                <li key={r} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', listStyle: 'disc', marginLeft: '16px' }}>{r}</li>
              ))}
            </ul>
            <div className="flex gap-2" style={{ marginTop: '10px' }}>
              <button onClick={() => setAcceptedRole(role)} style={{ background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '7px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>
                Accept recommendation
              </button>
              <button
                onClick={() => { dismiss(employee.id, role.id); setJustDismissed(role.id); }}
                style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '7px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-secondary)' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
        {justDismissed && (
          <div className="flex items-center justify-between" style={{ background: 'var(--w-sunken-bg)', border: '1px dashed var(--w-divider)', borderRadius: '8px', padding: '10px 14px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>Recommendation dismissed.</span>
            <button onClick={() => { undoDismiss(employee.id, justDismissed); setJustDismissed(null); }} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--w-accent-blue)' }}>Undo</button>
          </div>
        )}
      </div>

      <button onClick={() => setBrowsing(true)} style={{ marginTop: '16px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-accent-blue)' }}>
        Browse manually (Find Role) →
      </button>
    </LightboxModal>
  );
}

export default AIMatchWorkflowModal;
