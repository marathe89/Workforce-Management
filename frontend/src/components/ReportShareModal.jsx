import React, { useState } from 'react';
import LightboxModal from './LightboxModal';

const PERMISSIONS = ['View only', 'Can comment'];

// "Share" workflow — add recipients + a permission level, and a
// generated link with a genuinely working "Copy link" (real
// navigator.clipboard call). Session-only (no sharing backend exists)
// but drives the "Shared Reports" stat and each card's share badge.
function ReportShareModal({ report, onClose, onSave, onClear }) {
  const existing = report.shared;
  const [permission, setPermission] = useState(existing?.permission || 'View only');
  const [recipientInput, setRecipientInput] = useState('');
  const [recipients, setRecipients] = useState(existing?.recipients || []);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const link = existing?.link || `https://workforce.internal/reports/${report.title.toLowerCase().replace(/\s+/g, '-')}?t=${Math.random().toString(36).slice(2, 8)}`;

  const addRecipient = () => {
    const v = recipientInput.trim();
    if (v && !recipients.includes(v)) setRecipients((r) => [...r, v]);
    setRecipientInput('');
  };
  const removeRecipient = (v) => setRecipients((r) => r.filter((x) => x !== v));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleSave = () => {
    onSave({ recipients, permission, link });
    setSaved(true);
  };

  return (
    <LightboxModal onClose={onClose} width={440} titleId="report-share-title">
      <h2 id="report-share-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '17px', color: 'var(--w-text-primary)' }}>
        Share "{report.title}"
      </h2>

      {saved ? (
        <div style={{ marginTop: '16px', background: 'color-mix(in srgb, var(--w-green) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--w-green) 30%, transparent)', borderRadius: '8px', padding: '14px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-green)' }}>✓ Shared with {recipients.length} recipient{recipients.length === 1 ? '' : 's'}</p>
        </div>
      ) : (
        <>
          <div style={{ marginTop: '14px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Share link</p>
            <div className="flex gap-2" style={{ marginTop: '6px' }}>
              <input readOnly value={link} style={{ flex: 1, background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '7px 10px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-secondary)' }} />
              <button onClick={copyLink} style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '7px 12px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: copied ? 'var(--w-green)' : 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Permission</p>
            <div className="flex gap-2" style={{ marginTop: '6px' }}>
              {PERMISSIONS.map((p) => (
                <button
                  key={p} onClick={() => setPermission(p)}
                  style={{
                    flex: 1, borderRadius: '6px', padding: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                    background: permission === p ? 'var(--w-accent-blue)' : 'var(--w-sunken-bg)',
                    border: `1px solid ${permission === p ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`,
                    color: permission === p ? '#FFFFFF' : 'var(--w-text-secondary)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>People</p>
            <div className="flex flex-wrap gap-1.5" style={{ marginTop: '6px' }}>
              {recipients.map((r) => (
                <span key={r} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'color-mix(in srgb, var(--w-accent-blue) 13%, transparent)', borderRadius: '20px', padding: '3px 10px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-accent-blue)' }}>
                  {r}
                  <button onClick={() => removeRecipient(r)} aria-label={`Remove ${r}`} style={{ fontSize: '12px', lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2" style={{ marginTop: '6px' }}>
              <input
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                placeholder="name@coforge.com"
                style={{ flex: 1, background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '7px 10px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)' }}
              />
              <button onClick={addRecipient} style={{ border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '7px 12px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>Add</button>
            </div>
          </div>

          <div className="flex gap-2" style={{ marginTop: '18px' }}>
            <button onClick={handleSave} disabled={recipients.length === 0} style={{ flex: 1, background: recipients.length ? 'var(--w-accent-blue)' : 'var(--w-card-border)', borderRadius: '6px', padding: '9px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: recipients.length ? '#FFFFFF' : 'var(--w-text-label)' }}>
              Share
            </button>
            {existing && (
              <button onClick={() => { onClear(); onClose(); }} style={{ border: '1px solid var(--w-red)', borderRadius: '6px', padding: '9px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-red)' }}>
                Stop sharing
              </button>
            )}
          </div>
        </>
      )}
    </LightboxModal>
  );
}

export default ReportShareModal;
