import React from 'react';
import { useNavigate } from 'react-router-dom';

// Stat widget matching the Coforge Workforce Intelligence Figma "KpiCard"
// component (node 6:8290) — typography/colors/padding/radius taken from its
// dev-mode spec exactly. Sizing is NOT taken from that spec verbatim: Figma
// gave a fixed 8.91944rem x 12.98731rem box, which only ever looks right at
// the exact canvas width the design was authored at (7 cards fit in one row
// only around ~1360px+). To actually be responsive, width fills whatever
// grid cell the parent lays out (see Overview.jsx's responsive grid) and
// height is a min-height floor rather than a hard cap, so cards can grow if
// wrapped text needs more room on a narrow column instead of clipping.
// Default min-height matches Overview's stat row (node 6:8290-6:8391).
// Other pages use shorter cards (e.g. Workforce's are ~140px, node
// 6:9373) — pass `minHeight` to override rather than duplicating this
// component per page.
const DEFAULT_MIN_HEIGHT = '12.98731rem';

const CARD_STYLE = {
  display: 'flex',
  width: '100%',
  padding: '1.125rem 1.25rem',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderRadius: '0.625rem',
  borderTop: '2px solid var(--w-card-border)',
  borderRight: '1px solid var(--w-card-border)',
  borderBottom: '1px solid var(--w-card-border)',
  borderLeft: '1px solid var(--w-card-border)',
  background: 'var(--w-card-bg)',
};

const LABEL_STYLE = {
  fontFamily: '"DM Mono", monospace',
  fontWeight: 500,
  fontSize: '11px',
  lineHeight: '16.5px',
  letterSpacing: '0.66px',
  textTransform: 'uppercase',
  color: 'var(--w-text-label)',
};

const VALUE_STYLE = {
  fontFamily: '"Outfit", sans-serif',
  fontWeight: 700,
  fontSize: '28px',
  lineHeight: '30.8px',
  color: 'var(--w-text-primary)',
};

const SUBTITLE_STYLE = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: '12px',
  lineHeight: '18px',
  color: 'var(--w-text-secondary)',
};

const TREND_STYLE = {
  fontFamily: '"DM Mono", monospace',
  fontWeight: 500,
  fontSize: '11px',
  lineHeight: '16.5px',
};

// The "Partially Allocated" card (node 6:8341) swaps the arrow/DM-Mono trend
// line for a plain amber Inter-semibold callout instead — no arrow, no
// direction semantics, just a highlighted second metric.
const HIGHLIGHT_STYLE = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: '12px',
  lineHeight: '18px',
  color: 'var(--w-amber)',
};

// `linkTo` navigates to another page (Overview's row does this, e.g.).
// `onClick` runs a local handler instead — for pages like Capacity &
// Utilization where a stat card should filter/scroll within the SAME
// page rather than navigate away. Either makes the card interactive;
// most other callers (Workforce, Bench Management, Demand Forecast)
// pass neither and render a plain static card, matching Figma exactly.
function StatCard({ label, value, subtitle, trend, highlight, minHeight = DEFAULT_MIN_HEIGHT, linkTo, onClick, active }) {
  const navigate = useNavigate();
  const clickable = Boolean(linkTo || onClick);
  const handleActivate = () => {
    if (onClick) onClick();
    else if (linkTo) navigate(linkTo);
  };

  return (
    <div
      onClick={clickable ? handleActivate : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => (e.key === 'Enter' || e.key === ' ') && handleActivate() : undefined}
      className={clickable ? 'w-clickable-card' : undefined}
      style={
        active
          ? { ...CARD_STYLE, minHeight, borderTop: '2px solid var(--w-accent-blue)', borderRight: '1px solid var(--w-accent-blue)', borderBottom: '1px solid var(--w-accent-blue)', borderLeft: '1px solid var(--w-accent-blue)' }
          : { ...CARD_STYLE, minHeight }
      }
    >
      <p style={{ ...LABEL_STYLE, width: '100%' }}>{label}</p>
      <p style={{ ...VALUE_STYLE, marginTop: '8px' }}>{value}</p>
      {subtitle && <p style={{ ...SUBTITLE_STYLE, width: '100%', marginTop: '4px' }}>{subtitle}</p>}
      {trend && (
        <p
          style={{
            ...TREND_STYLE,
            width: '100%',
            color: trend.direction === 'down' ? 'var(--w-red)' : 'var(--w-green)',
            marginTop: 'auto',
            paddingTop: '6px',
          }}
        >
          {trend.direction === 'down' ? '▼' : '▲'} {trend.label}
        </p>
      )}
      {highlight && (
        <p style={{ ...HIGHLIGHT_STYLE, width: '100%', marginTop: 'auto', paddingTop: '6px' }}>
          {highlight}
        </p>
      )}
    </div>
  );
}

export default StatCard;
