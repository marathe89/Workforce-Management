import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceDot, ResponsiveContainer } from 'recharts';

// Matches the Coforge Workforce Intelligence Figma "Workforce Supply vs
// Forecast Demand" widget (node 38:323, Demand Forecast page). The chart
// body in Figma is a frozen SVG export of an already-rendered Recharts
// area/line combo chart (recharts-area-* node names) — rebuilt here as a
// real, live chart, same convention as the other rebuilt charts in this
// app. Series values are visually-approximated month-over-month trends
// (not pixel-exact reconstructions), EXCEPT the Nov 2026 forecast-demand
// peak, which is exact — it's the same "53,200 FTE · Nov 2026" annotation
// called out in Figma, so the Nov data point is pinned to that value.
const DATA = [
  { month: 'Aug', current: 51000, committed: 51200, forecast: 51400, band: [50800, 52000] },
  { month: 'Sep', current: 51100, committed: 51500, forecast: 51900, band: [51200, 52600] },
  { month: 'Oct', current: 51200, committed: 52000, forecast: 52700, band: [51900, 53500] },
  { month: 'Nov', current: 51300, committed: 52400, forecast: 53200, band: [52300, 54100] },
  { month: 'Dec', current: 51400, committed: 52100, forecast: 52600, band: [51800, 53400] },
  { month: 'Jan', current: 51500, committed: 51800, forecast: 52100, band: [51400, 52800] },
  { month: 'Feb', current: 51600, committed: 51600, forecast: 51700, band: [51100, 52300] },
];

const LEGEND = [
  { key: 'current', label: 'Current Workforce', color: 'var(--w-text-tertiary)' },
  { key: 'committed', label: 'Committed Demand', color: 'var(--w-green)' },
  { key: 'forecast', label: 'Forecast Demand', color: 'var(--w-amber)' },
  { key: 'band', label: 'Confidence Band', color: 'color-mix(in srgb, var(--w-amber) 25%, transparent)' },
];

// Legend entries are now real toggles — click one to hide/show that
// series (or the confidence band), same "click legend to isolate a
// series" convention as most charting libraries' built-in legends.
function LegendRow({ hidden, onToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {LEGEND.map((l) => {
        const isHidden = hidden.has(l.key);
        return (
          <button key={l.key} onClick={() => onToggle(l.key)} className="flex items-center gap-1.5" style={{ opacity: isHidden ? 0.4 : 1 }}>
            <span style={{ width: '18px', height: l.key === 'band' ? '10px' : '2px', borderRadius: l.key === 'band' ? '2px' : 0, background: l.color }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', textDecoration: isHidden ? 'line-through' : 'none' }}>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PeakLabel({ viewBox }) {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <g>
      <rect x={x - 46} y={y - 46} width={92} height={36} rx={6} fill="var(--w-sunken-bg)" stroke="var(--w-card-border)" />
      <text x={x} y={y - 30} textAnchor="middle" style={{ fontFamily: '"DM Mono", monospace', fontWeight: 700, fontSize: 11, fill: 'var(--w-text-primary)' }}>
        53,200 FTE
      </text>
      <text x={x} y={y - 16} textAnchor="middle" style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fill: 'var(--w-text-tertiary)' }}>
        Nov 2026
      </text>
    </g>
  );
}

function SupplyVsForecastChart() {
  const [hidden, setHidden] = React.useState(new Set());
  const toggle = (key) => setHidden((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
            Workforce Supply vs Forecast Demand
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-tertiary)', marginTop: '3px' }}>
            Aug 2026 – Feb 2027 · With confidence band · click legend to toggle a series
          </p>
        </div>
        <LegendRow hidden={hidden} onToggle={toggle} />
      </div>

      <div style={{ height: '300px', paddingTop: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={DATA} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--w-card-border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--w-text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--w-text-secondary)" fontSize={11} tickLine={false} axisLine={false} domain={[49500, 55000]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: 8, color: 'var(--w-text-primary)' }} />
            {!hidden.has('band') && <Area dataKey="band" fill="color-mix(in srgb, var(--w-amber) 15%, transparent)" stroke="none" isAnimationActive={false} />}
            {!hidden.has('current') && <Line dataKey="current" stroke="var(--w-text-tertiary)" strokeWidth={2} dot={false} name="Current Workforce" />}
            {!hidden.has('committed') && <Line dataKey="committed" stroke="var(--w-green)" strokeWidth={2} strokeDasharray="5 3" dot={false} name="Committed Demand" />}
            {!hidden.has('forecast') && <Line dataKey="forecast" stroke="var(--w-amber)" strokeWidth={2.5} dot={false} name="Forecast Demand" />}
            {!hidden.has('forecast') && <ReferenceDot x="Nov" y={53200} r={4} fill="var(--w-amber)" stroke="var(--w-card-bg)" strokeWidth={2} label={<PeakLabel />} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SupplyVsForecastChart;
