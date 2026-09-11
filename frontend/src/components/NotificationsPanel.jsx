import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Notifications slide-over panel, triggered from the bell icon in Header
// (shared across every page). Static Figma-style mockup content — no
// notifications backend exists, same convention as the rest of this app's
// AI-labeled widgets. Severity color/left-border and the four filter tabs
// (All/Critical/Warning/Opportunity) match the reference screenshot
// exactly; "Info" items (blue) only ever surface under "All", same as
// that screenshot shows. The notification list itself is owned by
// Header (lifted up) so the bell icon's unread badge can reflect it too.
export const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    severity: 'critical',
    title: '92 employees on bench 60+ days',
    body: 'Extended bench duration driving $1.8M monthly cost risk. Immediate staffing action recommended.',
    time: '2h ago',
  },
  {
    id: 2,
    severity: 'critical',
    title: 'Java capacity projected below demand',
    body: 'September projection shows 18% shortfall. 6 Java engineers on partial allocation can partially address this.',
    time: '3h ago',
  },
  {
    id: 3,
    severity: 'warning',
    title: 'NA utilization 6.4% below target',
    body: 'North America Delivery practice tracking below 85% target for September.',
    time: '4h ago',
  },
  {
    id: 4,
    severity: 'warning',
    title: 'GenAI skill gap widening',
    body: 'GenAI demand growing 51% faster than supply. Q4 shortage projected at 420 FTE.',
    time: '6h ago',
  },
  {
    id: 5,
    severity: 'opportunity',
    title: '146 employees becoming available',
    body: '146 employees will reach 0% allocation within 30 days. Proactive matching recommended to prevent bench growth.',
    time: '1d ago',
  },
  {
    id: 6,
    severity: 'opportunity',
    title: '3,180 FTE recoverable capacity identified',
    body: 'AI analysis found 3,180 FTE of potentially recoverable capacity across 6,420 partially allocated employees.',
    time: '1d ago',
  },
  {
    id: 7,
    severity: 'info',
    title: '28 employees available within 14 days',
    body: 'Short-lead availability across Java (8), Cloud (6), QA (5), and Data Engineering (4) practices.',
    time: '2d ago',
  },
];

const SEVERITY_STYLE = {
  critical: { border: 'var(--w-red)', link: 'var(--w-red)' },
  warning: { border: 'var(--w-amber)', link: 'var(--w-amber)' },
  opportunity: { border: 'var(--w-green)', link: 'var(--w-green)' },
  info: { border: 'var(--w-accent-blue)', link: 'var(--w-accent-blue)' },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'opportunity', label: 'Opportunity' },
];

function NotificationCard({ n }) {
  const s = SEVERITY_STYLE[n.severity];
  return (
    <div
      style={{
        background: 'var(--w-sunken-bg)',
        border: '1px solid var(--w-card-border)',
        borderLeft: `3px solid ${s.border}`,
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--w-text-primary)' }}>{n.title}</p>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-label)', whiteSpace: 'nowrap' }}>{n.time}</span>
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-tertiary)', marginTop: '8px' }}>{n.body}</p>
      <button style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: s.link, marginTop: '12px' }}>
        Take Action →
      </button>
    </div>
  );
}

function NotificationsPanel({ open, onClose, notifications, onMarkTabRead }) {
  const [activeTab, setActiveTab] = useState('all');

  const visible = activeTab === 'all' ? notifications : notifications.filter((n) => n.severity === activeTab);
  const activeTabLabel = TABS.find((t) => t.key === activeTab)?.label;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--w-card-bg)', borderLeft: '1px solid var(--w-card-border)', boxShadow: '-8px 0 24px rgba(0,0,0,0.25)' }}
      >
        <div className="flex items-center justify-between" style={{ padding: '24px 24px 0' }}>
          <div className="flex items-center gap-3">
            <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', color: 'var(--w-text-primary)' }}>Notifications</h2>
            {notifications.length > 0 && (
              <span
                style={{
                  // A solid, deliberately darker red than --w-red (which
                  // is tuned as a legible TEXT color, not a fill) — white
                  // text on --w-red itself only measures ~3.8:1, under
                  // WCAG AA's 4.5:1 for this badge's 13px text.
                  background: '#b91c1c',
                  color: '#FFFFFF',
                  borderRadius: '999px',
                  minWidth: '24px',
                  height: '24px',
                  padding: '0 7px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                {notifications.length}
              </span>
            )}
          </div>
          <button onClick={onClose} aria-label="Close notifications">
            <XMarkIcon className="w-6 h-6" style={{ color: 'var(--w-text-label)' }} />
          </button>
        </div>

        <div className="flex items-center gap-6" style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--w-divider)' }}>
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '14px',
                  color: isActive ? 'var(--w-text-primary)' : 'var(--w-text-label)',
                  paddingBottom: '12px',
                  borderBottom: isActive ? '2px solid var(--w-accent-blue)' : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-3" style={{ padding: '20px 24px' }}>
          {visible.length === 0 ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'var(--w-text-label)', textAlign: 'center', paddingTop: '48px' }}>
              {notifications.length === 0 ? "You're all caught up." : 'No notifications in this category.'}
            </p>
          ) : (
            visible.map((n) => <NotificationCard key={n.id} n={n} />)
          )}
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          <button
            onClick={() => onMarkTabRead(activeTab)}
            disabled={visible.length === 0}
            className="w-full"
            style={{
              border: '1px solid var(--w-card-border)',
              borderRadius: '8px',
              padding: '11px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: visible.length === 0 ? 'var(--w-text-label)' : 'var(--w-text-secondary)',
              background: 'transparent',
            }}
          >
            {activeTab === 'all' ? 'Mark All as Read' : `Mark ${activeTabLabel} as Read`}
          </button>
        </div>
      </div>
    </>
  );
}

export default NotificationsPanel;
