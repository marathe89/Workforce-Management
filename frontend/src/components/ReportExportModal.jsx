import React, { useState } from 'react';
import LightboxModal from './LightboxModal';
import { getReportPreview } from '../data/reportPreviews';

const FORMATS = [
  { id: 'csv', label: 'CSV', available: true, note: 'Downloads a real .csv file of the preview data.' },
  { id: 'pdf', label: 'PDF', available: false, note: 'Not available in this prototype — no PDF renderer is wired up.' },
  { id: 'xlsx', label: 'XLSX', available: false, note: 'Not available in this prototype — no spreadsheet writer is wired up.' },
];

function toCsv(report, preview) {
  const lines = [`Report,${report.title}`, `Category,${report.category}`, `Last run,${report.lastRun}`, ''];
  lines.push('Metric,Value');
  preview.metrics.forEach((m) => lines.push(`${m.label},${m.value}`));
  if (preview.rows.length > 0) {
    lines.push('', 'Breakdown,Value');
    preview.rows.forEach((r) => lines.push(`${r.label},${r.value}`));
  }
  return lines.join('\n');
}

// "Export" workflow. CSV is a genuine, working client-side export (Blob +
// a temporary <a download>) since that's a real browser capability this
// deployed app can use — not decorative. PDF/XLSX are shown but marked
// unavailable, honestly, since no such generator exists here.
function ReportExportModal({ report, onClose }) {
  const [format, setFormat] = useState('csv');
  const [done, setDone] = useState(false);
  const preview = getReportPreview(report.title);
  const chosen = FORMATS.find((f) => f.id === format);

  const handleExport = () => {
    if (!chosen.available) return;
    const csv = toCsv(report, preview);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDone(true);
  };

  return (
    <LightboxModal onClose={onClose} width={440} titleId="report-export-title">
      <h2 id="report-export-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '17px', color: 'var(--w-text-primary)' }}>
        Export "{report.title}"
      </h2>

      {done ? (
        <div style={{ marginTop: '16px', background: 'color-mix(in srgb, var(--w-green) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--w-green) 30%, transparent)', borderRadius: '8px', padding: '14px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-green)' }}>✓ Downloaded {report.title.replace(/\s+/g, '_')}.csv</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>Check your browser's downloads.</p>
        </div>
      ) : (
        <>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>Choose a format.</p>
          <div className="flex flex-col gap-2" style={{ marginTop: '12px' }}>
            {FORMATS.map((f) => (
              <label
                key={f.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  background: format === f.id ? 'color-mix(in srgb, var(--w-accent-blue) 10%, transparent)' : 'var(--w-sunken-bg)',
                  border: `1px solid ${format === f.id ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`,
                  borderRadius: '8px', padding: '10px 12px', cursor: f.available ? 'pointer' : 'default', opacity: f.available ? 1 : 0.6,
                }}
              >
                <input type="radio" name="format" checked={format === f.id} onChange={() => f.available && setFormat(f.id)} disabled={!f.available} style={{ marginTop: '3px' }} />
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-primary)' }}>
                    {f.label} {!f.available && <span style={{ fontSize: '10px', color: 'var(--w-text-label)', fontWeight: 400 }}>(unavailable)</span>}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>{f.note}</p>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={!chosen.available}
            style={{
              marginTop: '16px', background: chosen.available ? 'var(--w-accent-blue)' : 'var(--w-card-border)', borderRadius: '6px',
              padding: '9px 16px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
              color: chosen.available ? '#FFFFFF' : 'var(--w-text-label)', width: '100%',
            }}
          >
            Export as {chosen.label}
          </button>
        </>
      )}
    </LightboxModal>
  );
}

export default ReportExportModal;
