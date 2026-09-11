import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { getTimelineByMonth, PROJECT } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';

// Confirmed / proposed / remaining-gap FTE by month, derived from the
// same requirement records as Requirements & Coverage (data/
// staffingModel.js) — a requirement only counts toward a month if that
// month falls inside its own start/end window (UX ends in December, QA
// doesn't start until November, etc), so the ramp reflects real per-role
// timing instead of a flat project-wide curve. Clicking a bar selects
// that period, narrowing Requirements & Coverage to whichever roles are
// active then (see staffingPlanStore.selectedPeriodMonth).
const LEGEND = [
  { label: 'Confirmed', color: 'var(--w-accent-blue)' },
  { label: 'Proposed (draft)', color: 'var(--w-indigo)' },
  { label: 'Remaining gap', color: 'color-mix(in srgb, var(--w-red) 55%, transparent)' },
];

function StaffingTimelineChart() {
  const draftAllocations = useStaffingPlanStore((s) => s.draftAllocations);
  const selectedPeriodMonth = useStaffingPlanStore((s) => s.selectedPeriodMonth);
  const selectPeriod = useStaffingPlanStore((s) => s.selectPeriod);
  const data = getTimelineByMonth(draftAllocations);
  const maxRequired = Math.max(...data.map((d) => d.requiredFTE));

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
          Staffing Timeline
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span aria-hidden="true" style={{ width: '9px', height: '9px', borderRadius: '2px', background: l.color, display: 'inline-block' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)' }}>{l.label}</span>
            </span>
          ))}
        </div>
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)', marginTop: '2px' }}>
        Dashed line = required capacity reference ({maxRequired} FTE). Click a month to filter the requirements below to that period.
      </p>
      <div style={{ height: '220px', paddingTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} onClick={(s) => s?.activeLabel && selectPeriod(data.find((d) => d.month === s.activeLabel)?.monthKey)}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--w-card-border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--w-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--w-text-secondary)" fontSize={10} tickLine={false} axisLine={false} domain={[0, Math.ceil(maxRequired / 15) * 15]} />
            <ReferenceLine y={maxRequired} stroke="var(--w-text-label)" strokeDasharray="4 4" />
            <Tooltip
              cursor={{ fill: 'color-mix(in srgb, var(--w-accent-blue) 8%, transparent)' }}
              formatter={(value, name) => [`${Math.round(value * 10) / 10} FTE`, name]}
              contentStyle={{ backgroundColor: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: 8, color: 'var(--w-text-primary)' }}
            />
            <Bar dataKey="confirmedFTE" stackId="a" name="Confirmed" fill="var(--w-accent-blue)" style={{ cursor: 'pointer' }}>
              {data.map((d) => <Cell key={d.monthKey} fill="var(--w-accent-blue)" fillOpacity={selectedPeriodMonth && selectedPeriodMonth !== d.monthKey ? 0.35 : 1} />)}
            </Bar>
            <Bar dataKey="proposedFTE" stackId="a" name="Proposed (draft)" fill="var(--w-indigo)" style={{ cursor: 'pointer' }}>
              {data.map((d) => <Cell key={d.monthKey} fill="var(--w-indigo)" fillOpacity={selectedPeriodMonth && selectedPeriodMonth !== d.monthKey ? 0.35 : 1} />)}
            </Bar>
            <Bar dataKey="gapFTE" stackId="a" name="Remaining gap" fill="color-mix(in srgb, var(--w-red) 55%, transparent)" radius={[3, 3, 0, 0]} style={{ cursor: 'pointer' }}>
              {data.map((d) => <Cell key={d.monthKey} fill="color-mix(in srgb, var(--w-red) 55%, transparent)" fillOpacity={selectedPeriodMonth && selectedPeriodMonth !== d.monthKey ? 0.35 : 1} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '6px' }}>
        Project period: {PROJECT.periodStart} → {PROJECT.periodEnd}
      </p>
    </div>
  );
}

export default StaffingTimelineChart;
