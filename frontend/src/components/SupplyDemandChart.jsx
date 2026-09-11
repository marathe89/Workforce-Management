import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useFilterStore from '../stores/filterStore';
import { getFactor, getUtilDelta } from '../data/filterMetrics';

// Matches the Coforge Workforce Intelligence Figma "Workforce Supply vs
// Demand" widget (node 6:8705). The chart body in Figma is a frozen SVG
// export of an already-rendered Recharts chart, not reconstructable data —
// so this rebuilds it as a real, live Recharts chart with visually
// equivalent (not pixel-exact) static data, same reasoning as the rest of
// Overview.jsx's mockup content. The whole series scales uniformly by
// Overview's shared filter model (see filterMetrics.js), preserving the
// chart's shape while its absolute levels move with the applied filters.
const BASE_DATA = [
  { month: 'Aug', current: 49500, committed: 44800, forecast: 48200, available: 2800 },
  { month: 'Sep', current: 49000, committed: 46200, forecast: 48900, available: 2900 },
  { month: 'Oct', current: 48800, committed: 47400, forecast: 49700, available: 2850 },
  { month: 'Nov', current: 49200, committed: 48200, forecast: 50400, available: 2950 },
  { month: 'Dec', current: 48600, committed: 47600, forecast: 50900, available: 2900 },
  { month: 'Jan', current: 49000, committed: 48400, forecast: 51600, available: 3000 },
  { month: 'Feb', current: 49500, committed: 49000, forecast: 52200, available: 3050 },
];

const SERIES = [
  { key: 'current', label: 'Current Workforce', color: 'var(--w-accent-blue)', dashed: false },
  { key: 'committed', label: 'Committed Demand', color: 'var(--w-green)', dashed: false },
  { key: 'forecast', label: 'Forecast Demand', color: 'var(--w-amber)', dashed: true },
  { key: 'available', label: 'Available Capacity', color: 'var(--w-cyan)', dashed: true },
];

// Utilization % view — no dedicated dataset exists for this in Figma or
// anywhere else in this app, so it's derived from the same monthly FTE
// rows above (billable = committed/current, forecast = forecast/current)
// rather than inventing an unrelated series. Both ratios already cancel
// out the headcount-scale factor (committed and current scale together),
// so they only move with the applied filters' utilization delta (see
// filterMetrics.js) — same mechanism as every other %-type metric on
// this page. Target stays fixed at 85%, matching the org-wide target
// used everywhere else in this app (UtilizationPerformanceCard, etc).
const UTIL_TARGET = 85;
const UTIL_SERIES = [
  { key: 'committedPct', label: 'Billable Utilization', color: 'var(--w-accent-blue)', dashed: false },
  { key: 'forecastPct', label: 'Forecast Utilization', color: 'var(--w-amber)', dashed: true },
  { key: 'target', label: 'Target 85%', color: 'var(--w-green)', dashed: true },
];

const CHART_GRID = 'var(--w-card-border)';
const CHART_TEXT = 'var(--w-text-secondary)';
const TOOLTIP_STYLE = { backgroundColor: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: 8, color: 'var(--w-text-primary)' };

function SupplyDemandChart() {
  const [mode, setMode] = useState('fte');
  const applied = useFilterStore((s) => s.applied);
  const factor = getFactor(applied);
  const utilDelta = getUtilDelta(applied);
  const DATA = BASE_DATA.map((row) => ({
    month: row.month,
    current: Math.round(row.current * factor),
    committed: Math.round(row.committed * factor),
    forecast: Math.round(row.forecast * factor),
    available: Math.round(row.available * factor),
  }));
  const UTIL_DATA = BASE_DATA.map((row) => ({
    month: row.month,
    committedPct: Math.min(130, Math.max(30, (row.committed / row.current) * 100 + utilDelta)),
    forecastPct: Math.min(150, Math.max(30, (row.forecast / row.current) * 100 + utilDelta)),
    target: UTIL_TARGET,
  }));

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' }}>
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
            Workforce Supply vs Demand
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-label)', marginTop: '3px' }}>
            6-month rolling forecast with capacity gap analysis
          </p>
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'fte', label: 'FTE' },
            { key: 'utilization', label: 'Utilization %' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              style={{
                background: mode === opt.key ? 'var(--w-accent-blue)' : 'var(--w-sunken-bg)',
                color: mode === opt.key ? '#FFFFFF' : 'var(--w-text-secondary)',
                borderRadius: '5px',
                padding: '5px 12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '11px',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4" style={{ paddingTop: '16px' }}>
        {(mode === 'fte' ? SERIES : UTIL_SERIES).map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span style={{ width: '24px', height: '2px', borderRadius: '1px', backgroundColor: s.color }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '11px', color: 'var(--w-text-secondary)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {mode === 'fte' ? (
        <div style={{ paddingTop: '12px', height: '232px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="month" stroke={CHART_TEXT} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke={CHART_TEXT}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 60000]}
                ticks={[0, 15000, 30000, 45000, 60000]}
                tickFormatter={(v) => `${v / 1000}k`}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => v.toLocaleString()} />
              {SERIES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? '5 4' : undefined}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ paddingTop: '12px', height: '232px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={UTIL_DATA} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="month" stroke={CHART_TEXT} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke={CHART_TEXT}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[30, 150]}
                ticks={[30, 60, 90, 120, 150]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v.toFixed(1)}%`} />
              {UTIL_SERIES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  strokeDasharray={s.dashed ? '5 4' : undefined}
                  dot={s.key === 'target' ? false : { r: 3, fill: s.color, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default SupplyDemandChart;
