import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Matches the Coforge Workforce Intelligence Figma "Bench Aging
// Distribution" widget (node 8:11138, Bench Management page). The chart
// body in Figma is a frozen SVG export of an already-rendered Recharts bar
// chart — rebuilt here as a real, live chart, same convention as the other
// rebuilt charts in this app. All 4 bucket values are exact: they're the
// same 524/318/192/92 figures shown in the stat cards above.
//
// Interactive: clicking a bar (or the "Prioritize →" callout) filters
// Bench Employees below to that aging bucket — `activeBucket`/`onSelect`
// lifted to BenchManagement.jsx, same key ('d0_15'/'d16_30'/'d31_60'/
// 'd60') the employees table and business-unit table both use.
const DATA = [
  { bucket: '0-15 Days', key: 'd0_15', count: 524, color: 'var(--w-green)' },
  { bucket: '16-30 Days', key: 'd16_30', count: 318, color: 'var(--w-amber)' },
  { bucket: '31-60 Days', key: 'd31_60', count: 192, color: 'var(--w-orange)' },
  { bucket: '60+ Days', key: 'd60', count: 92, color: 'var(--w-red)' },
];

function BenchAgingChart({ activeBucket, onSelect }) {
  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
        Bench Aging Distribution
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-label)', marginTop: '4px' }}>
        Days on bench across 1,126 employees
      </p>
      <div style={{ height: '260px', paddingTop: '14px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--w-card-border)" vertical={false} />
            <XAxis dataKey="bucket" stroke="var(--w-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 600]} ticks={[0, 150, 300, 450, 600]} stroke="var(--w-text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'var(--w-sunken-bg)' }} contentStyle={{ backgroundColor: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: 8, color: 'var(--w-text-primary)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(d) => onSelect?.(activeBucket === d.key ? null : d.key)}>
              {DATA.map((d) => (
                <Cell key={d.bucket} fill={d.color} fillOpacity={activeBucket && activeBucket !== d.key ? 0.35 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="flex items-center justify-between gap-3"
        style={{
          marginTop: 'auto',
          paddingTop: '16px',
        }}
      >
        <div
          className="flex items-center justify-between gap-3 w-full"
          style={{
            background: 'color-mix(in srgb, var(--w-red) 8%, var(--w-sunken-bg))',
            border: '1px solid color-mix(in srgb, var(--w-red) 25%, transparent)',
            borderRadius: '8px',
            padding: '12px 14px',
          }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--w-red)' }}>92 employees</span> have been on bench for more than 60 days.
          </p>
          <button
            onClick={() => onSelect?.('d60')}
            style={{
              border: '1px solid color-mix(in srgb, var(--w-red) 35%, transparent)',
              borderRadius: '5px',
              padding: '6px 12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '11px',
              color: 'var(--w-red)',
              whiteSpace: 'nowrap',
            }}
          >
            Prioritize →
          </button>
        </div>
      </div>
    </div>
  );
}

export default BenchAgingChart;
