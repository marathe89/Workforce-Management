import React, { useState } from 'react';
import ReviewWorkforcePlanModal from './ReviewWorkforcePlanModal';

// Matches the Coforge Workforce Intelligence Figma "Recommended Workforce
// Actions" widget (node 8:12154, Workforce Planning page). Actions and
// impact metrics now come from whichever scenario is selected above
// (data/workforcePlanningData.js) instead of always showing Base Case —
// no workforce-planning recommendation backend exists yet, same
// convention as the other AI-labeled widgets in this app (AI Talent
// Matching on Project Staffing, etc), so these are rule-scaled numbers
// per scenario rather than a real model's output.
//
// "Review Full Workforce Plan →" now opens a real screen
// (ReviewWorkforcePlanModal) instead of doing nothing.
function ActionRow({ a }) {
  return (
    <div
      className="flex items-center gap-3.5"
      style={{
        background: 'var(--w-sunken-bg)',
        border: `1px solid color-mix(in srgb, ${a.color} 13%, transparent)`,
        borderRadius: '8px',
        padding: '14px 16px',
      }}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `color-mix(in srgb, ${a.color} 13%, transparent)`,
          border: `1px solid color-mix(in srgb, ${a.color} 25%, transparent)`,
        }}
      >
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: a.color }}>{a.num}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--w-text-primary)' }}>{a.title}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)', marginTop: '2px' }}>{a.subtitle}</p>
      </div>
      <span
        className="shrink-0"
        style={{
          background: `color-mix(in srgb, ${a.color} 13%, transparent)`,
          border: `1px solid color-mix(in srgb, ${a.color} 25%, transparent)`,
          borderRadius: '10px',
          padding: '3px 10px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: '10px',
          color: a.color,
          whiteSpace: 'nowrap',
        }}
      >
        {a.tag}
      </span>
    </div>
  );
}

function RecommendedActionsCard({ scenario }) {
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <div
      style={{
        background: 'var(--w-card-bg)',
        borderTop: '2px solid color-mix(in srgb, var(--w-indigo) 25%, transparent)',
        borderRight: '1px solid color-mix(in srgb, var(--w-indigo) 25%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--w-indigo) 25%, transparent)',
        borderLeft: '1px solid color-mix(in srgb, var(--w-indigo) 25%, transparent)',
        borderRadius: '10px',
        padding: '20px 24px',
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span style={{ fontSize: '16px', color: 'var(--w-indigo)' }}>✦</span>
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--w-text-primary)' }}>Recommended Workforce Actions</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)' }}>AI-generated · Based on {scenario.label}</p>
      </div>

      <div className="flex flex-col gap-2.5" style={{ paddingTop: '16px' }}>
        {scenario.actions.map((a) => (
          <ActionRow key={a.num} a={a} />
        ))}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3" style={{ paddingTop: '20px', paddingBottom: '16px' }}>
        {scenario.metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center"
            style={{ background: 'var(--w-sunken-bg)', border: `1px solid color-mix(in srgb, ${m.color} 13%, transparent)`, borderRadius: '8px', padding: '14px' }}
          >
            <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '22px', color: m.color }}>{m.value}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)', marginTop: '4px', textAlign: 'center' }}>{m.label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setReviewOpen(true)}
        className="w-full"
        style={{
          height: '45px',
          borderRadius: '8px',
          backgroundImage: 'linear-gradient(178deg, var(--w-indigo) 0%, var(--w-accent-blue) 100%)',
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.28px',
          color: '#FFFFFF',
        }}
      >
        Review Full Workforce Plan →
      </button>

      {reviewOpen && <ReviewWorkforcePlanModal scenario={scenario} onClose={() => setReviewOpen(false)} />}
    </div>
  );
}

export default RecommendedActionsCard;
