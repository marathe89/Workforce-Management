import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useFilterStore from '../stores/filterStore';
import { getFactorExcludingBU, getUtilDeltaExcludingBU } from '../data/filterMetrics';

// Matches the Coforge Workforce Intelligence Figma "Utilization Performance"
// widget (node 6:8837). The mini trend chart's body is a frozen SVG export
// in Figma, not reconstructable data, so it's rebuilt here as a real,
// interactive Recharts chart with visually equivalent (not pixel-exact)
// data — same reasoning as SupplyDemandChart. The table's numbers were
// originally exact, read directly from the design's text nodes; they're
// now the BASE the shared filter model (filterMetrics.js) scales from.
//
// Business unit names were renamed (1:1, same 8 rows) from Figma's
// originals (Digital Services/Technology/Cloud & Infrastructure/Data &
// AI/Engineering/BFS/Healthcare/Retail) to match the real org's business
// units, so this table lines up with the Header's "All Business Units"
// dropdown — Business Unit filters this table down to one row; the other
// filters (Practice/Geography/Allocation/Grade) scale every row's
// workforce/utilization on top, via getFactorExcludingBU/
// getUtilDeltaExcludingBU (BU's own contribution is already the row
// selection itself, so it isn't applied twice).
const BASE_TREND = [
  { month: 'Mar', actual: 80.9, target: 85 },
  { month: 'Apr', actual: 81.9, target: 85 },
  { month: 'May', actual: 83.6, target: 85 },
  { month: 'Jun', actual: 83.6, target: 85 },
  { month: 'Jul', actual: 81.9, target: 85 },
  { month: 'Aug', actual: 83.6, target: 85 },
];

const BASE_BUSINESS_UNITS = [
  { name: 'Banking and Financial Services (BFS)', workforce: 12400, utilization: 84.2 },
  { name: 'Insurance', workforce: 9800, utilization: 81.6 },
  { name: 'Travel, Transportation, and Hospitality (TTH)', workforce: 7200, utilization: 83.4 },
  { name: 'Healthcare and Life Sciences / Hi-Tech', workforce: 6100, utilization: 79.8 },
  { name: 'Public Sector & Government', workforce: 5800, utilization: 85.1 },
  { name: 'Private Equity Business Unit', workforce: 4200, utilization: 87.3 },
  { name: 'Momentum AI', workforce: 2800, utilization: 80.4 },
  { name: 'Digital Process Automation (DPA)', workforce: 1120, utilization: 78.2 },
];

const TARGET = 85;

function trendFor(gap) {
  if (gap > 0.05) return { glyph: '↑', color: 'var(--w-green)' };
  if (gap < -0.05) return { glyph: '↓', color: 'var(--w-red)' };
  return { glyph: '→', color: 'var(--w-amber)' };
}

const CHART_GRID = 'var(--w-card-border)';
const CHART_TEXT = 'var(--w-text-secondary)';

function UtilizationPerformanceCard() {
  const applied = useFilterStore((s) => s.applied);
  const businessUnit = applied.businessUnit;
  const factor = getFactorExcludingBU(applied);
  const utilDelta = getUtilDeltaExcludingBU(applied);

  const rows = (businessUnit === 'All Business Units' ? BASE_BUSINESS_UNITS : BASE_BUSINESS_UNITS.filter((r) => r.name === businessUnit)).map((r) => {
    const workforce = Math.max(1, Math.round(r.workforce * factor));
    const utilization = Math.min(99, Math.max(35, r.utilization + utilDelta));
    const gap = utilization - TARGET;
    return {
      name: r.name,
      workforce: workforce.toLocaleString('en-US'),
      utilization: `${utilization.toFixed(1)}%`,
      target: `${TARGET}%`,
      gap: `${gap >= 0 ? '+' : ''}${gap.toFixed(1)}%`,
      trend: trendFor(gap),
    };
  });

  const trendData = BASE_TREND.map((row) => ({
    month: row.month,
    target: row.target,
    actual: Math.min(99, Math.max(35, row.actual + utilDelta)),
  }));

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' }}>
      <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
        Utilization Performance
      </p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-label)', marginTop: '3px' }}>
        Actual vs target utilization by business unit
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ paddingTop: '16px' }}>
        {/* Mini trend chart */}
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="month" stroke={CHART_TEXT} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke={CHART_TEXT}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[30, 90]}
                ticks={[30, 50, 70, 90]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: 8, color: 'var(--w-text-primary)' }}
                formatter={(v, name) => [`${v.toFixed(1)}%`, name === 'actual' ? 'Actual' : 'Target']}
              />
              <Line type="monotone" dataKey="target" name="target" stroke="var(--w-green)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
              <Line type="monotone" dataKey="actual" name="actual" stroke="var(--w-accent-blue)" strokeWidth={2} dot={{ r: 4, fill: 'var(--w-accent-blue)', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--w-divider)' }}>
                {['Business Unit', 'Workforce', 'Utilization', 'Target', 'Gap', 'Trend'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '0 8px 8px 8px',
                      fontFamily: '"DM Mono", monospace',
                      fontWeight: 500,
                      fontSize: '10px',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      color: 'var(--w-text-label)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '24px 8px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-label)' }}>
                    No utilization data for "{businessUnit}".
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const gapColor = row.gap.startsWith('-') ? 'var(--w-red)' : 'var(--w-green)';
                return (
                  <tr key={row.name} style={{ borderBottom: '1px solid var(--w-divider)' }}>
                    <td style={{ padding: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>{row.name}</td>
                    <td style={{ padding: '8px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-secondary)' }}>{row.workforce}</td>
                    <td style={{ padding: '8px', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '12px', color: 'var(--w-text-primary)' }}>{row.utilization}</td>
                    <td style={{ padding: '8px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-label)' }}>{row.target}</td>
                    <td style={{ padding: '8px', fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '12px', color: gapColor }}>{row.gap}</td>
                    <td style={{ padding: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: row.trend.color }}>{row.trend.glyph}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UtilizationPerformanceCard;
