import React from 'react';
import { getRecoverability } from '../data/capacityModel';
import { REAL_BUSINESS_UNITS } from '../data/businessUnits';

// Matches the Coforge Workforce Intelligence Figma "Recoverable Capacity by
// Business Unit" widget (node 8:436, Capacity & Utilization page).
//
// Rebuilt as per-business-unit recoverable FTE totals computed directly
// from data/capacityModel.js's EMPLOYEES fixture, rather than a 5-range
// heat matrix with hand-picked counts/alphas — with only 13 sample
// employees across 8 business units (see capacityModel.js's
// reconciliation note on why this isn't a fabricated 6,420-row
// dataset), a full range×unit heatmap would be almost entirely empty
// cells, which reads as broken rather than honest. Every FTE value here
// sums to EXACTLY the "Recoverable Capacity" stat card above (same
// getRecoverability() calls, same period) — reconciled by construction,
// not by hand-tuning two separately hardcoded numbers to agree. The
// "highest recoverable capacity" callout is computed from these totals
// each render (previously a hardcoded claim that didn't match the
// table's own row total).
function RecoverableCapacityTable({ employees, period, activeFilter, onSelectUnit, onExplore }) {
  const rows = REAL_BUSINESS_UNITS.map((unit) => {
    const members = employees.filter((e) => e.unit === unit);
    const fte = members.reduce((sum, e) => sum + getRecoverability(e, period).fte, 0);
    const hours = members.reduce((sum, e) => sum + getRecoverability(e, period).recoverableHours, 0);
    return { unit, fte, hours, headcount: members.length };
  }).filter((r) => r.headcount > 0);

  const total = rows.reduce((s, r) => s + r.fte, 0);
  const top = rows.reduce((max, r) => (r.fte > max.fte ? r : max), rows[0] || { unit: '—', fte: 0 });
  const maxFte = Math.max(0.01, ...rows.map((r) => r.fte));

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px' }}>
      <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
        Recoverable Capacity by Business Unit
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-tertiary)', marginTop: '3px' }}>
        FTE eligible for reassignment (after release dates &amp; restrictions) · click a unit to filter employees below
      </p>

      <div className="flex flex-col gap-2" style={{ paddingTop: '14px' }}>
        {rows.length === 0 && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>No recoverable capacity for this period.</p>
        )}
        {rows.map((r) => {
          const isActive = activeFilter?.businessUnit === r.unit;
          return (
            <button
              key={r.unit}
              onClick={() => onSelectUnit(isActive ? null : r.unit)}
              className="text-left"
              style={{
                background: isActive ? 'color-mix(in srgb, var(--w-amber) 10%, var(--w-sunken-bg))' : 'var(--w-sunken-bg)',
                border: `1px solid ${isActive ? 'var(--w-amber)' : 'var(--w-divider)'}`,
                borderRadius: '7px', padding: '9px 12px', cursor: 'pointer',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: isActive ? 'var(--w-amber)' : 'var(--w-text-primary)' }}>{r.unit}</span>
                <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 700, fontSize: '13px', color: 'var(--w-amber)' }}>{r.fte.toFixed(2)} FTE</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'var(--w-divider)', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${(r.fte / maxFte) * 100}%`, height: '100%', background: 'var(--w-amber)' }} />
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '4px' }}>
                {r.hours.toFixed(0)}h recoverable across {r.headcount} employee{r.headcount === 1 ? '' : 's'}
              </p>
            </button>
          );
        })}
      </div>

      {rows.length > 0 && (
        <div
          className="flex items-center justify-between flex-wrap gap-2"
          style={{
            marginTop: '12px',
            background: 'var(--w-sunken-bg)',
            border: '1px solid color-mix(in srgb, var(--w-amber) 19%, transparent)',
            borderRadius: '7px',
            padding: '10px 12px',
          }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--w-amber)' }}>{top.unit}</span> has the highest recoverable capacity at{' '}
            <span style={{ color: 'var(--w-text-primary)' }}>{top.fte.toFixed(2)} FTE</span> — reconciles with the {total.toFixed(2)} FTE total above.
          </p>
          <button
            onClick={() => onExplore(top.unit)}
            style={{
              border: '1px solid color-mix(in srgb, var(--w-amber) 31%, transparent)',
              borderRadius: '5px',
              padding: '5px 10px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '11px',
              color: 'var(--w-amber)',
              whiteSpace: 'nowrap',
            }}
          >
            Explore →
          </button>
        </div>
      )}
    </div>
  );
}

export default RecoverableCapacityTable;
