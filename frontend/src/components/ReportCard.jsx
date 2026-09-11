import React from 'react';

// Matches the Coforge Workforce Intelligence Figma report card component
// (node 8:13106 and its 7 siblings, Reports page). Static Figma mockup
// data for the report content — no report-generation backend exists —
// but View/Export/Schedule/Share are now real interactive workflows
// (see ReportViewModal/ReportExportModal/ReportScheduleModal/
// ReportShareModal), each opened by the parent Reports page.
function ReportCard({ report, onView, onExport, onSchedule, onShare }) {
  const { category, categoryColor, title, description, lastRun, scheduled, shared } = report;
  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '18px 20px' }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: categoryColor, display: 'inline-block' }} />
            <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '9px', letterSpacing: '0.72px', textTransform: 'uppercase', color: categoryColor }}>{category}</span>
          </div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--w-text-primary)', marginTop: '4px' }}>{title}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {scheduled && (
            <span title={`Scheduled ${scheduled.frequency.toLowerCase()} at ${scheduled.time}`} style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--w-amber)', border: '1px solid color-mix(in srgb, var(--w-amber) 35%, transparent)', borderRadius: '10px', padding: '2px 7px', whiteSpace: 'nowrap' }}>
              ⏱ {scheduled.frequency}
            </span>
          )}
          {shared && (
            <span title={`Shared with ${shared.recipients.length} people`} style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--w-violet)', border: '1px solid color-mix(in srgb, var(--w-violet) 35%, transparent)', borderRadius: '10px', padding: '2px 7px', whiteSpace: 'nowrap' }}>
              ⇢ Shared
            </span>
          )}
        </div>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', marginTop: '10px' }}>{description}</p>

      <div className="flex flex-wrap items-center justify-between gap-2" style={{ marginTop: '14px' }}>
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-label)' }}>Last run: {lastRun}</span>
        <div className="flex gap-1.5">
          <button
            onClick={onView}
            style={{
              background: categoryColor,
              borderRadius: '5px',
              padding: '5px 10px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '11px',
              // Dark text, not white: categoryColor varies per report
              // (blue/green/amber/violet/indigo) and white text fails
              // WCAG AA against several of them (as low as 2.15:1 on
              // amber) — dark text clears 5:1+ against all five.
              color: 'var(--w-text-on-accent-dark)',
              whiteSpace: 'nowrap',
            }}
          >
            View
          </button>
          {[
            { label: 'Export', onClick: onExport },
            { label: 'Schedule', onClick: onSchedule },
            { label: 'Share', onClick: onShare },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              style={{
                border: '1px solid var(--w-card-border)',
                borderRadius: '5px',
                padding: '5px 10px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                color: 'var(--w-text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportCard;
