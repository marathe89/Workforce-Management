import React, { useState } from 'react';
import LightboxModal from './LightboxModal';
import { CATEGORIES, BUSINESS_UNIT_OPTIONS } from '../stores/reportsStore';

const PERIODS = ['Last 30 days', 'Last quarter', 'Last 6 months', 'Custom range'];

// "+ New Report" workflow (the user's "New Workflow" button — this page
// has no button literally labeled that; treating it as the same one,
// since building a new report IS the workflow this button starts).
// A 3-step flow: define the report, scope it, then run now or schedule
// it. On confirm, a real new report card is added to the grid.
function NewReportModal({ onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [businessUnit, setBusinessUnit] = useState(BUSINESS_UNIT_OPTIONS[0]);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [runMode, setRunMode] = useState('now');
  const [frequency, setFrequency] = useState('Weekly');
  const [created, setCreated] = useState(false);

  const step1Valid = title.trim().length > 0;

  const handleCreate = () => {
    onCreate({
      title: title.trim(), category, description: description.trim() || `${period} • ${businessUnit}`,
      businessUnit, period, runNow: runMode === 'now',
      schedule: runMode === 'schedule' ? { frequency, time: '08:00', recipients: [] } : null,
    });
    setCreated(true);
  };

  if (created) {
    return (
      <LightboxModal onClose={onClose} width={420} titleId="new-report-title">
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <span style={{ fontSize: '28px' }}>✓</span>
          <h2 id="new-report-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '17px', color: 'var(--w-text-primary)', marginTop: '8px' }}>
            "{title}" created
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
            {runMode === 'now' ? 'Generated now — added to the top of your reports.' : `Scheduled ${frequency.toLowerCase()} — added to your reports.`}
          </p>
          <button onClick={onClose} style={{ marginTop: '16px', background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '8px 20px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#FFFFFF' }}>
            Done
          </button>
        </div>
      </LightboxModal>
    );
  }

  return (
    <LightboxModal onClose={onClose} width={460} titleId="new-report-title">
      <h2 id="new-report-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '17px', color: 'var(--w-text-primary)' }}>New Report</h2>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)', marginTop: '2px' }}>Step {step} of 3</p>

      {step === 1 && (
        <div className="flex flex-col gap-3" style={{ marginTop: '14px' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Title</p>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Attrition Risk Report"
              style={{ marginTop: '6px', width: '100%', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-primary)' }}
            />
          </div>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Category</p>
            <div className="flex flex-wrap gap-1.5" style={{ marginTop: '6px' }}>
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)} style={{ borderRadius: '20px', padding: '5px 12px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', background: category === c ? 'var(--w-accent-blue)' : 'var(--w-sunken-bg)', border: `1px solid ${category === c ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`, color: category === c ? '#FFFFFF' : 'var(--w-text-secondary)' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Description (optional)</p>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              style={{ marginTop: '6px', width: '100%', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)', resize: 'vertical' }}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3" style={{ marginTop: '14px' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Business unit</p>
            <select value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)} style={{ marginTop: '6px', width: '100%', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-primary)' }}>
              {BUSINESS_UNIT_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>Period</p>
            <div className="flex flex-wrap gap-1.5" style={{ marginTop: '6px' }}>
              {PERIODS.map((p) => (
                <button key={p} onClick={() => setPeriod(p)} style={{ borderRadius: '6px', padding: '6px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', background: period === p ? 'var(--w-accent-blue)' : 'var(--w-sunken-bg)', border: `1px solid ${period === p ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`, color: period === p ? '#FFFFFF' : 'var(--w-text-secondary)' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3" style={{ marginTop: '14px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: 'var(--w-text-label)', textTransform: 'uppercase' }}>When</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: runMode === 'now' ? 'color-mix(in srgb, var(--w-accent-blue) 10%, transparent)' : 'var(--w-sunken-bg)', border: `1px solid ${runMode === 'now' ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`, borderRadius: '8px', padding: '10px 12px', cursor: 'pointer' }}>
            <input type="radio" checked={runMode === 'now'} onChange={() => setRunMode('now')} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)' }}>Run now</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: runMode === 'schedule' ? 'color-mix(in srgb, var(--w-accent-blue) 10%, transparent)' : 'var(--w-sunken-bg)', border: `1px solid ${runMode === 'schedule' ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`, borderRadius: '8px', padding: '10px 12px', cursor: 'pointer' }}>
            <input type="radio" checked={runMode === 'schedule'} onChange={() => setRunMode('schedule')} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)' }}>Schedule for later</span>
          </label>
          {runMode === 'schedule' && (
            <div className="flex gap-2">
              {['Daily', 'Weekly', 'Monthly'].map((f) => (
                <button key={f} onClick={() => setFrequency(f)} style={{ flex: 1, borderRadius: '6px', padding: '7px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', background: frequency === f ? 'var(--w-accent-blue)' : 'var(--w-sunken-bg)', border: `1px solid ${frequency === f ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`, color: frequency === f ? '#FFFFFF' : 'var(--w-text-secondary)' }}>
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between" style={{ marginTop: '20px' }}>
        <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: step === 1 ? 'var(--w-text-label)' : 'var(--w-text-secondary)', padding: '8px 14px' }}>
          Back
        </button>
        {step < 3 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !step1Valid} style={{ background: (step === 1 && !step1Valid) ? 'var(--w-card-border)' : 'var(--w-accent-blue)', borderRadius: '6px', padding: '8px 18px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: (step === 1 && !step1Valid) ? 'var(--w-text-label)' : '#FFFFFF' }}>
            Next
          </button>
        ) : (
          <button onClick={handleCreate} style={{ background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '8px 18px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#FFFFFF' }}>
            Create report
          </button>
        )}
      </div>
    </LightboxModal>
  );
}

export default NewReportModal;
