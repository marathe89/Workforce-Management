import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFilterStore from '../stores/filterStore';
import { BASE, getFactor, getUtilDelta } from '../data/filterMetrics';

// Matches the Coforge Workforce Intelligence Figma "Workforce Intelligence"
// insight-card row exactly (node 6:8635, 4 cards). Base figures are the
// original static Figma mockup content — no anomaly-detection/
// recommendation backend exists — scaled by Overview's shared filter
// model (see filterMetrics.js), and kept consistent with the same facts
// referenced on ActiveAlertsCard. Whole card is clickable (not just the
// action button), routing to the page it's about.
function WorkforceIntelligenceCards() {
  const navigate = useNavigate();
  const applied = useFilterStore((s) => s.applied);
  const factor = getFactor(applied);
  const utilDelta = getUtilDelta(applied);
  const javaShortfall = Math.max(2, Math.round(BASE.javaShortfallPct + utilDelta * 0.4));
  const naGap = Math.max(1, (BASE.naUtilizationGapPct - utilDelta * 0.3).toFixed(1));
  const employeesAvailable = Math.max(3, Math.round(BASE.employeesAvailableSoon * factor));
  const redistribute = Math.max(1, Math.round(BASE.redistributeResources * factor));
  const utilizationGain = Math.max(0.2, (BASE.utilizationGainPct + utilDelta * 0.3) * 0.9).toFixed(1);

  const CARDS = [
    {
      key: 'critical',
      color: 'var(--w-red)',
      icon: '⚠',
      tag: 'Critical',
      title: 'Java Capacity Shortfall',
      description: `Java delivery capacity is projected to fall ${javaShortfall}% below demand in September.`,
      actionLabel: 'View Skill Gap →',
      linkTo: '/skills-intelligence',
    },
    {
      key: 'opportunity',
      color: 'var(--w-green)',
      icon: '◎',
      tag: 'Opportunity',
      title: `${employeesAvailable} Employees Available Soon`,
      description: `${employeesAvailable} employees become available within the next 30 days.`,
      actionLabel: 'Explore Talent →',
      linkTo: '/talent-finder',
    },
    {
      key: 'utilization',
      color: 'var(--w-amber)',
      icon: '◷',
      tag: 'Utilization',
      title: 'NA Delivery Below Target',
      description: `North America Delivery utilization is trending ${naGap}% below target.`,
      actionLabel: 'Analyze →',
      linkTo: '/workforce',
    },
    {
      key: 'ai',
      color: 'var(--w-indigo)',
      icon: '✦',
      tag: 'AI Recommendation',
      title: 'Workforce Optimization Found',
      description: `Redistributing ${redistribute} resources across 4 delivery units could improve utilization by ~${utilizationGain}%.`,
      actionLabel: 'Review Recommendation →',
      linkTo: '/workforce-planning',
    },
  ];

  return (
    <div>
      <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '20px', color: 'var(--w-text-primary)' }}>
        Workforce Intelligence
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
        {CARDS.map((card) => (
          <div
            key={card.key}
            onClick={() => navigate(card.linkTo)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(card.linkTo)}
            className="flex flex-col gap-2 w-clickable-card"
            style={{
              minHeight: '11.25rem',
              background: 'var(--w-card-bg)',
              borderRadius: '10px',
              padding: '16px',
              borderTop: `1px solid ${card.color}`,
              borderRight: `1px solid ${card.color}`,
              borderBottom: `1px solid ${card.color}`,
              borderLeft: `3px solid ${card.color}`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '12px', color: card.color, lineHeight: '18px' }}>{card.icon}</span>
              <span
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontWeight: 500,
                  fontSize: '9px',
                  lineHeight: '13.5px',
                  letterSpacing: '0.72px',
                  textTransform: 'uppercase',
                  color: card.color,
                }}
              >
                {card.tag}
              </span>
            </div>
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-primary)' }}>
              {card.title}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-secondary)', flex: 1 }}>
              {card.description}
            </p>
            <button
              style={{
                // card.color is now a CSS var() reference (theme-aware),
                // not a literal hex string, so the old JS hex-parser
                // (hexToRgba) can no longer compute this — color-mix()
                // does the same 31%-opacity blend directly in CSS instead.
                border: `1px solid color-mix(in srgb, ${card.color} 31%, transparent)`,
                borderRadius: '5px',
                padding: '6px 10px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '11px',
                lineHeight: '16.5px',
                color: card.color,
                background: 'transparent',
                textAlign: 'center',
              }}
            >
              {card.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkforceIntelligenceCards;
