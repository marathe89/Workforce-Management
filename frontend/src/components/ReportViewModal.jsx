import React, { useState } from 'react';
import LightboxModal from './LightboxModal';
import { getReportPreview } from '../data/reportPreviews';

// "View" workflow — a preview of the report's content rendered right in
// the app (metrics + top rows), plus quick access into Export/Schedule/
// Share so a viewer can act without leaving the preview. Clicking "Run
// report" marks it generated today, which is what feeds the "Last
// Generated" stat card on the Reports page. The click itself was already
// updating state — it just gave no visible confirmation, which read as
// "not working". Now it shows an inline "✓ Report run" confirmation and
// disables the button so a repeat click isn't mistaken for a no-op.
function ReportViewModal({ report, onClose, onRun, onOpenExport, onOpenSchedule, onOpenShare }) {
  const preview = getReportPreview(report.title);
  const [justRan, setJustRan] = useState(false);
  const handleRun = () => {
    onRun();
    setJustRan(true);
  };
  return (
    <LightboxModal onClose={onClose} width={560} titleId="report-view-title">
      <div className="flex items-center gap-2">
        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: report.categoryColor, display: 'inline-block' }} />
        <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '10px', letterSpacing: '0.6px', textTransform: 'uppercase', color: report.categoryColor }}>{report.category}</span>
      </div>
      <h2 id="report-view-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '19px', color: 'var(--w-text-primary)', marginTop: '4px' }}>{report.title}</h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-secondary)', marginTop: '4px' }}>{report.description}</p>
      <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '8px' }}>Last run: {report.lastRun}</p>
      {justRan && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-green)', marginTop: '6px' }}>
          ✓ Report run — data refreshed and Last Generated updated.
        </p>
      )}

      <div style={{ marginTop: '18px', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview</p>
        <div className="grid grid-cols-3 gap-2" style={{ marginTop: '10px' }}>
          {preview.metrics.map((m) => (
            <div key={m.label} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--w-text-primary)' }}>{m.value}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '2px' }}>{m.label}</p>
            </div>
          ))}
        </div>
        {preview.rows.length > 0 && (
          <div className="flex flex-col gap-1.5" style={{ marginTop: '10px' }}>
            {preview.rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between" style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '7px', padding: '7px 12px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)' }}>{r.label}</span>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-accent-blue)' }}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '10px' }}>
          Illustrative preview — no report-generation backend is wired up yet, so this is representative sample data, not a live pull.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" style={{ marginTop: '18px' }}>
        <button
          onClick={handleRun}
          disabled={justRan}
          style={{
            background: justRan ? 'var(--w-card-border)' : report.categoryColor,
            borderRadius: '6px', padding: '7px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
            color: justRan ? 'var(--w-text-label)' : '#FFFFFF',
          }}
        >
          {justRan ? '✓ Run' : 'Run report now'}
        </button>
        <button onClick={onOpenExport} style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '7px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>
          Export
        </button>
        <button onClick={onOpenSchedule} style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '7px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>
          Schedule
        </button>
        <button onClick={onOpenShare} style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '7px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>
          Share
        </button>
      </div>
    </LightboxModal>
  );
}

export default ReportViewModal;
