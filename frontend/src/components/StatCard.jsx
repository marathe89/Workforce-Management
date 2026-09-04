import React from 'react';

// Fixed-size stat widget matching the Coforge Workforce Intelligence Figma
// "KpiCard" component exactly (node 6:8290) — dev-mode measurements and
// typography, not approximated with Tailwind's default scale/fonts. Used
// for the stat-card row across Overview/Workforce/etc. pages.
const CARD_STYLE = {
  display: 'flex',
  width: '8.91944rem',
  height: '12.98731rem',
  padding: '1.125rem 1.25rem',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderRadius: '0.625rem',
  borderTop: '2px solid #1E2D45',
  borderRight: '1px solid #1E2D45',
  borderBottom: '1px solid #1E2D45',
  borderLeft: '1px solid #1E2D45',
  background: '#131C2E',
};

const LABEL_STYLE = {
  fontFamily: '"DM Mono", monospace',
  fontWeight: 500,
  fontSize: '11px',
  lineHeight: '16.5px',
  letterSpacing: '0.66px',
  textTransform: 'uppercase',
  color: '#3D5373',
};

const VALUE_STYLE = {
  fontFamily: '"Outfit", sans-serif',
  fontWeight: 700,
  fontSize: '28px',
  lineHeight: '30.8px',
  color: '#E2E8F4',
};

const SUBTITLE_STYLE = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: '12px',
  lineHeight: '18px',
  color: '#64748B',
};

const TREND_STYLE = {
  fontFamily: '"DM Mono", monospace',
  fontWeight: 500,
  fontSize: '11px',
  lineHeight: '16.5px',
};

function StatCard({ label, value, subtitle, trend }) {
  return (
    <div style={CARD_STYLE}>
      <p style={{ ...LABEL_STYLE, width: '101px' }}>{label}</p>
      <p style={{ ...VALUE_STYLE, marginTop: '8px' }}>{value}</p>
      {subtitle && <p style={{ ...SUBTITLE_STYLE, width: '101px', marginTop: '4px' }}>{subtitle}</p>}
      {trend && (
        <p
          style={{
            ...TREND_STYLE,
            color: trend.direction === 'down' ? '#EF4444' : '#22C55E',
            marginTop: 'auto',
            paddingTop: '6px',
          }}
        >
          {trend.direction === 'down' ? '▼' : '▲'} {trend.label}
        </p>
      )}
    </div>
  );
}

export default StatCard;
