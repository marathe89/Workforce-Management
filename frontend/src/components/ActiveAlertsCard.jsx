import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFilterStore from '../stores/filterStore';
import { BASE, getFactor, getUtilDelta } from '../data/filterMetrics';

// Matches the Coforge Workforce Intelligence Figma "Active Alerts" widget
// exactly (node 6:8590). Sits below HiddenCapacityCard in Overview.jsx.
// Base figures are the original static Figma mockup content — no
// alerting/anomaly-detection backend exists — scaled by Overview's
// shared filter model (see filterMetrics.js) so the numbers embedded in
// these messages stay consistent with the same facts referenced on
// WorkforceIntelligenceCards. Each action link routes to the page it's
// talking about, replacing the original `href="#"` placeholders.
function ActiveAlertsCard() {
  const navigate = useNavigate();
  const applied = useFilterStore((s) => s.applied);
  const factor = getFactor(applied);
  const utilDelta = getUtilDelta(applied);
  const javaShortfall = Math.max(2, Math.round(BASE.javaShortfallPct + utilDelta * 0.4));
  const dataEngGap = Math.max(10, Math.round(BASE.dataEngGapFTE * factor));
  const naGap = Math.max(1, (BASE.naUtilizationGapPct - utilDelta * 0.3).toFixed(1));

  const ALERTS = [
    {
      dotColor: 'var(--w-red)',
      message: `Java delivery capacity projected to fall ${javaShortfall}% below demand in...`,
      actionLabel: 'View Skill Gap →',
      linkTo: '/skills-intelligence',
    },
    {
      dotColor: 'var(--w-red)',
      message: `Data Engineering demand exceeds available supply by ${dataEngGap} FTE ...`,
      actionLabel: 'Build Plan →',
      linkTo: '/workforce-planning',
    },
    {
      dotColor: 'var(--w-amber)',
      message: `NA Delivery utilization trending ${naGap}% below target for Septe...`,
      actionLabel: 'Analyze →',
      linkTo: '/workforce',
    },
  ];

  return (
    <div
      style={{
        height: '100%',
        background: 'var(--w-card-bg)',
        border: '1px solid var(--w-card-border)',
        borderRadius: '10px',
        padding: '20px',
      }}
    >
      <p
        style={{
          fontFamily: '"DM Mono", monospace',
          fontWeight: 500,
          fontSize: '12px',
          lineHeight: '18px',
          letterSpacing: '0.48px',
          textTransform: 'uppercase',
          color: 'var(--w-text-label)',
        }}
      >
        Active Alerts
      </p>

      <div style={{ marginTop: '10px' }}>
        {ALERTS.map((alert, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5"
            style={{
              padding: '8px 0',
              borderBottom: i < ALERTS.length - 1 ? '1px solid var(--w-divider)' : 'none',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: alert.dotColor,
                flexShrink: 0,
                marginTop: '5px',
              }}
            />
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '16.8px', color: 'var(--w-text-tertiary)' }}>
                {alert.message}
              </p>
              <a
                href={alert.linkTo}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(alert.linkTo);
                }}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '11px',
                  lineHeight: '16.5px',
                  color: 'var(--w-accent-blue)',
                  display: 'inline-block',
                  marginTop: '3px',
                }}
              >
                {alert.actionLabel}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActiveAlertsCard;
