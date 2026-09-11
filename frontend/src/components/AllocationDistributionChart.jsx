import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { getPlannedAllocation } from '../data/capacityModel';

// Matches the Coforge Workforce Intelligence Figma "Allocation Distribution"
// widget (node 8:346, Capacity & Utilization page), rebuilt on real,
// continuous, non-overlapping allocation ranges computed from
// data/capacityModel.js instead of a frozen 5-bucket export. 0%
// allocation is its own bucket, kept separate from the partially
// allocated cohort (0% < x < 100%) per spec — an unbooked employee is
// not "partially allocated". 100%+ is its own bucket too (never lumped
// into "81–99%" the way the old fixed chart did).
export const RANGES = [
  { key: '0', label: '0%', test: (pct) => pct === 0 },
  { key: '1-20', label: '1–20%', test: (pct) => pct > 0 && pct <= 20 },
  { key: '21-40', label: '21–40%', test: (pct) => pct > 20 && pct <= 40 },
  { key: '41-60', label: '41–60%', test: (pct) => pct > 40 && pct <= 60 },
  { key: '61-80', label: '61–80%', test: (pct) => pct > 60 && pct <= 80 },
  { key: '81-99', label: '81–99%', test: (pct) => pct > 80 && pct < 100 },
  { key: '100+', label: '100%+', test: (pct) => pct >= 100 },
];
const COLORS = ['var(--w-text-tertiary)', 'var(--w-red)', 'var(--w-orange)', 'var(--w-amber)', 'var(--w-yellow)', 'var(--w-green)', 'var(--w-accent-blue)'];

export function bucketEmployees(employees, period) {
  return RANGES.map((r, i) => {
    const members = employees.filter((e) => {
      const pct = getPlannedAllocation(e, period).pct;
      return pct != null && r.test(pct);
    });
    return { range: r.key, label: r.label, count: members.length, color: COLORS[i] };
  });
}

function AllocationDistributionChart({ employees, period, activeRange, onSelect }) {
  const data = bucketEmployees(employees, period);
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px' }}>
      <div className="flex items-center justify-between gap-2">
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
          Allocation Distribution
        </p>
        {activeRange && (
          <button
            onClick={() => onSelect?.(null)}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-accent-blue)', border: '1px solid var(--w-accent-blue)', borderRadius: '20px', padding: '2px 8px', whiteSpace: 'nowrap' }}
          >
            Clear ×
          </button>
        )}
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
        Employee count by exact allocation % · 0% shown separately from the partially allocated cohort
      </p>
      <div style={{ height: '240px', paddingTop: '14px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--w-card-border)" horizontal={false} />
            <XAxis type="number" domain={[0, Math.max(4, maxCount + 1)]} allowDecimals={false} stroke="var(--w-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="label" stroke="var(--w-text-secondary)" fontSize={11} tickLine={false} axisLine={false} width={54} />
            <Tooltip
              cursor={{ fill: 'var(--w-sunken-bg)' }}
              formatter={(value) => [`${value} employee${value === 1 ? '' : 's'}`, '']}
              contentStyle={{ backgroundColor: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: 8, color: 'var(--w-text-primary)' }}
            />
            <Bar dataKey="count" radius={[0, 3, 3, 0]} cursor="pointer" onClick={(d) => onSelect?.(activeRange === d.range ? null : d.range)}>
              {data.map((d) => (
                <Cell key={d.range} fill={d.color} fillOpacity={activeRange && activeRange !== d.range ? 0.35 : 1} />
              ))}
              <LabelList dataKey="count" position="right" style={{ fill: 'var(--w-text-tertiary)', fontSize: 10, fontFamily: '"DM Mono", monospace' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AllocationDistributionChart;
