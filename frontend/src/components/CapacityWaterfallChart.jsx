import React from 'react';
import { useNavigate } from 'react-router-dom';
import useFilterStore from '../stores/filterStore';

// Matches the Coforge Workforce Intelligence Figma "Capacity Waterfall"
// widget exactly (node 6:9500, Workforce page). Bar heights are computed
// proportionally against the first (largest) value rather than hardcoding
// Figma's pixel heights verbatim, with a 12px floor matching its own
// min-height — same value, more robust if the numbers ever change.
const MAX_BAR_HEIGHT = 120;
const MIN_BAR_HEIGHT = 12;

// Colors aligned with Overview's WorkforceHealthCard on request (same
// allocation-state buckets should read as the same color across the
// app): Partially Allocated=amber, Available=green, Bench=text-tertiary.
// "Fully Allocated" uses --w-indigo rather than WorkforceHealthCard's own
// --w-accent-blue — that accent-blue is also the sidebar/active-nav/
// button blue used throughout the surrounding chrome, so a bar in that
// exact shade read as blending into the page rather than standing out as
// its own data series; indigo is a distinct-enough blue to tell apart at
// a glance while still reading as "blue". "Total Workforce" isn't one of
// WorkforceHealthCard's buckets (it's the whole-population starting bar
// here) — set to a fixed yellow instead, per explicit request, not
// theme-inverted like the other tokens. "Recoverable Capacity" also has
// no WorkforceHealthCard equivalent, so it keeps its own distinct color
// (orange) rather than colliding with one of the aligned buckets.
//
// Interactive: each bar is a shortcut into the same Allocation dimension
// the header's FilterBar exposes (useFilterStore) — clicking one filters
// Workforce's stat cards and the Business Unit table below to that
// bucket, same as clicking the matching stat card above. "Recoverable
// Capacity" has no Allocation-dropdown equivalent (it's a derived slice
// of Partially Allocated), so it navigates to Capacity & Utilization
// instead — the page that's actually built around that exact metric.
const STEPS = [
  { label: ['Total', 'Workforce'], value: 48620, barColor: '#EAB308', allocation: 'All Workforce' },
  { label: ['Fully', 'Allocated'], value: 35840, barColor: 'var(--w-indigo)', allocation: 'Fully Allocated' },
  { label: ['Partially', 'Allocated'], value: 6420, barColor: 'var(--w-amber)', allocation: 'Partially Allocated' },
  { label: ['Recoverable', 'Capacity'], value: 3180, barColor: 'var(--w-orange)', linkTo: '/capacity-utilization' },
  { label: ['Available'], value: 2840, barColor: 'var(--w-green)', allocation: 'Available' },
  { label: ['Bench'], value: 1126, barColor: 'var(--w-text-tertiary)', allocation: 'Bench' },
];

const maxValue = Math.max(...STEPS.map((s) => s.value));

function CapacityWaterfallChart() {
  const navigate = useNavigate();
  const appliedAllocation = useFilterStore((s) => s.applied.allocation);
  const setAllocationNow = useFilterStore((s) => s.setAllocationNow);

  const handleSelect = (step) => {
    if (step.linkTo) navigate(step.linkTo);
    else setAllocationNow(appliedAllocation === step.allocation ? 'All Workforce' : step.allocation);
  };

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' }}>
      <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: 'var(--w-text-primary)' }}>
        Capacity Waterfall — Where is Unused Workforce Capacity?
      </p>
      <div className="flex items-end justify-center gap-4" style={{ height: '174px', paddingTop: '14px' }}>
        {STEPS.map((step) => {
          const barHeight = Math.max(MIN_BAR_HEIGHT, (step.value / maxValue) * MAX_BAR_HEIGHT);
          const active = step.allocation && appliedAllocation === step.allocation;
          return (
            <button
              key={step.label.join(' ')}
              onClick={() => handleSelect(step)}
              className="flex-1 flex flex-col items-center gap-1.5 min-w-0"
              title={step.linkTo ? 'View in Capacity & Utilization' : `Filter workforce to ${step.allocation}`}
            >
              <p style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '11px', color: step.barColor }}>
                {step.value.toLocaleString()}
              </p>
              <div
                style={{
                  width: '60px',
                  maxWidth: '60px',
                  height: `${barHeight}px`,
                  minHeight: `${MIN_BAR_HEIGHT}px`,
                  borderRadius: '4px',
                  backgroundColor: step.barColor,
                  opacity: active ? 1 : 0.85,
                  outline: active ? '2px solid var(--w-accent-blue)' : 'none',
                  outlineOffset: '2px',
                  transition: 'opacity 0.15s',
                }}
              />
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: active ? 700 : 400, fontSize: '10px', lineHeight: '13px', color: active ? 'var(--w-accent-blue)' : 'var(--w-text-secondary)', textAlign: 'center' }}>
                {step.label.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CapacityWaterfallChart;
