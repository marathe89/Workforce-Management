import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFilterStore from '../stores/filterStore';
import { getFactor, fmtNum } from '../data/filterMetrics';

// Matches the Coforge Workforce Intelligence Figma "Workforce Health" widget
// exactly (node 6:8409): a proportional segmented bar + a 3x2 legend grid.
// Base figures are the original static Figma mockup content; scaled by
// Overview's shared filter model (see filterMetrics.js) so this card's
// numbers move with the applied filters instead of staying fixed — the
// percentages stay ~identical to Figma's since every segment scales by
// the same factor (only the absolute headcounts shrink/grow together).
// Each legend tile is clickable — added on request ("make all cards
// interactive") — routing to the page that goes deeper on that
// allocation state; `linkTo: null` (Training/Internal) has no dedicated
// page yet, so those two stay static rather than link somewhere
// misleading.
// "Fully Allocated" uses --w-indigo, matching Workforce's
// CapacityWaterfallChart (changed there from --w-accent-blue on
// request, since that's also the sidebar/nav/button blue used
// throughout the surrounding chrome) — kept in sync here so the same
// allocation state reads as the same color on both pages.
const BASE_SEGMENTS = [
  { key: 'fully', label: 'Fully Allocated', base: 35840, percent: 73.7, color: 'var(--w-indigo)', linkTo: '/workforce' },
  { key: 'partial', label: 'Partially Allocated', base: 6420, percent: 13.2, color: 'var(--w-amber)', linkTo: '/capacity-utilization' },
  { key: 'available', label: 'Available', base: 2840, percent: 5.8, color: 'var(--w-green)', linkTo: '/capacity-utilization' },
  { key: 'bench', label: 'Bench', base: 1126, percent: 2.3, color: 'var(--w-text-tertiary)', linkTo: '/bench-management' },
  { key: 'training', label: 'Training', base: 1240, percent: 2.5, color: 'var(--w-violet)', linkTo: '/workforce-planning' },
  { key: 'internal', label: 'Internal', base: 1154, percent: 2.4, color: 'var(--w-cyan)', linkTo: null },
];

function WorkforceHealthCard() {
  const navigate = useNavigate();
  const applied = useFilterStore((s) => s.applied);
  const factor = getFactor(applied);
  const SEGMENTS = BASE_SEGMENTS.map((seg) => ({ ...seg, value: fmtNum(seg.base * factor) }));
  const totalWorkforce = fmtNum(48620 * factor);
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
            Workforce Health
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-label)', marginTop: '3px' }}>
            Current allocation state across {totalWorkforce} employees
          </p>
        </div>
        <p style={{ fontFamily: '"DM Mono", monospace', fontWeight: 400, fontSize: '11px', lineHeight: '16.5px', color: 'var(--w-accent-blue)' }}>
          Aug 2026
        </p>
      </div>

      {/* Segmented bar */}
      <div className="flex w-full mt-4" style={{ height: '40px', borderRadius: '6px', overflow: 'hidden', gap: '1px' }}>
        {SEGMENTS.map((seg) => (
          <div key={seg.key} style={{ flex: `${seg.percent} 0 0`, backgroundColor: seg.color }} />
        ))}
      </div>

      {/* Percent labels under the bar */}
      <div className="flex w-full" style={{ gap: '2px', paddingTop: '2px' }}>
        {SEGMENTS.map((seg) => (
          <p
            key={seg.key}
            className="text-center"
            style={{
              flex: `${seg.percent} 0 0`,
              fontFamily: '"DM Mono", monospace',
              fontWeight: 400,
              fontSize: '9px',
              lineHeight: '13.5px',
              color: 'var(--w-text-label)',
            }}
          >
            {seg.percent}%
          </p>
        ))}
      </div>

      {/* Legend grid */}
      <div className="grid grid-cols-3 gap-2.5 mt-3">
        {SEGMENTS.map((seg) => (
          <div
            key={seg.key}
            onClick={seg.linkTo ? () => navigate(seg.linkTo) : undefined}
            role={seg.linkTo ? 'button' : undefined}
            tabIndex={seg.linkTo ? 0 : undefined}
            onKeyDown={seg.linkTo ? (e) => (e.key === 'Enter' || e.key === ' ') && navigate(seg.linkTo) : undefined}
            className={`flex items-center gap-2 ${seg.linkTo ? 'w-clickable-card' : ''}`}
            style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-divider)', borderRadius: '8px', padding: '10px 12px' }}
          >
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: seg.color, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-secondary)' }}>
                {seg.label}
              </p>
              <p style={{ marginTop: '2px' }}>
                <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
                  {seg.value}
                </span>{' '}
                <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 400, fontSize: '11px', lineHeight: '16.5px', color: seg.color }}>
                  {seg.percent}%
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkforceHealthCard;
