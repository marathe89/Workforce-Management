import React, { useState } from 'react';
import LightboxModal from './LightboxModal';

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];

// "Schedule" workflow — configure a recurring run (frequency, time,
// recipients) or remove an existing one. Session-only state (no job
// scheduler backend exists) but genuinely drives the Reports page's
// "Scheduled" stat count and each card's schedule badge.
function ReportScheduleModal({ report, onClose, onSave, onClear }) {
  const existing = report.scheduled;
  const [frequency, setFrequency] = useState(existing?.frequency || 'Weekly');
  const [time, setTime] = useState(existing?.time || '08:00');
  const [recipientInput, setRecipientInput] = useState('');
  const [recipients, setRecipients] = useState(existing?.recipients || []);
  const [saved, setSaved] = useState(false);

  const addRecipient = () => {
    const v = recipientInput.trim();
    if (v && !recipients.includes(v)) setRecipients((r) => [...r, v]);
    setRecipientInput('');
  };
  const removeRecipient = (v) => setRecipients((r) => r.filter((x) => x !== v));

  const handleSave = () => {
    onSave({ frequency, time, recipients });
    setSaved(true);
  };

  return (
    <LightboxModal onClose={onClose} width={440} titleId="report-schedule-title">
      <h2 id="report-schedule-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '17px', color: 'var(--w-text-primary)' }}>
        Schedule "{report.title}"
      </h2>

      {saved ? (
        <div style={{ marginTop: '16px', background: 'color-mix(in srgb, var(--w-green) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--w-green) 30%, transparent)', borderRadius: '8px', padding: '14px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-green)' }}>✓ Scheduled {frequency.toLowerCase()} at {time}</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>{recipients.length} recipient{recipients.length === 1 ? '' : 's'} will receive this report.</p>
        </div>
      ) : (
        <>
          <div style={{ marginTop: '14px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Frequency</p>
            <div className="flex gap-2" style={{ marginTop: '6px' }}>
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  style={{
                    flex: 1, borderRadius: '6px', padding: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
                    background: frequency === f ? 'var(--w-accent-blue)' : 'var(--w-sunken-bg)',
                    border: `1px solid ${frequency === f ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`,
                    color: frequency === f ? '#FFFFFF' : 'var(--w-text-secondary)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Time</p>
            <input
              type="time" value={time} onChange={(e) => setTime(e.target.value)}
              style={{ marginTop: '6px', width: '100%', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-primary)' }}
            />
          </div>

          <div style={{ marginTop: '14px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Recipients</p>
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
            <button onClick={handleSave} style={{ flex: 1, background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '9px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#FFFFFF' }}>
              Save schedule
            </button>
            {existing && (
              <button onClick={() => { onClear(); onClose(); }} style={{ border: '1px solid var(--w-red)', borderRadius: '6px', padding: '9px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-red)' }}>
                Remove
              </button>
            )}
          </div>
        </>
      )}
    </LightboxModal>
  );
}

export default ReportScheduleModal;
