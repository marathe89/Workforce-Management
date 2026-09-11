import React from 'react';
import { createPortal } from 'react-dom';

// Shared centered-modal chrome (dimmed overlay + card centered in the
// viewport + a close button) — same visual pattern as this app's other
// modals (AssignModal, OptimizeStaffingPanel, SkillBuildPlanModal).
// Portals to document.body so it's never affected by an ancestor's
// `overflow` (the reason FindOpportunityPopover/PlanPopover moved off
// plain inline positioning in the first place).
function LightboxModal({ onClose, width = 480, titleId, children }) {
  return createPortal(
    <>
      <div onClick={onClose} className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed z-50"
        style={{
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: `${width}px`, maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
          background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '12px',
          padding: '24px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '20px', lineHeight: 1, color: 'var(--w-text-label)' }}
        >
          ×
        </button>
        {children}
      </div>
    </>,
    document.body
  );
}

export default LightboxModal;
