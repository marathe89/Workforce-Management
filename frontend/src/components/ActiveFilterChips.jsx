import React from 'react';
import useFilterStore, { DEFAULTS } from '../stores/filterStore';

// Row of removable chips, one per currently-applied non-default filter
// (Business Unit from the Header, Practice/Geography/Allocation/Grade
// from FilterBar). Renders nothing when every filter is at its default —
// this is meant to only show up once Apply has actually changed
// something, as visible proof the action did what it said.
const LABELS = {
  businessUnit: 'Business Unit',
  practice: 'Practice',
  geography: 'Geography',
  allocation: 'Allocation',
  grade: 'Grade',
};

function ActiveFilterChips() {
  const applied = useFilterStore((s) => s.applied);
  const clearOne = useFilterStore((s) => s.clearOne);
  const clearAll = useFilterStore((s) => s.clearAll);

  const active = Object.entries(applied).filter(([key, value]) => value !== DEFAULTS[key]);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-label)' }}>Filtered by:</span>
      {active.map(([key, value]) => (
        <span
          key={key}
          className="flex items-center gap-1.5"
          style={{
            background: 'color-mix(in srgb, var(--w-accent-blue) 13%, transparent)',
            border: '1px solid color-mix(in srgb, var(--w-accent-blue) 25%, transparent)',
            borderRadius: '20px',
            padding: '4px 6px 4px 12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: 'var(--w-accent-blue)',
          }}
        >
          <span style={{ color: 'var(--w-text-label)' }}>{LABELS[key]}:</span> {value}
          <button
            onClick={() => clearOne(key)}
            aria-label={`Remove ${LABELS[key]} filter`}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '999px',
              background: 'color-mix(in srgb, var(--w-accent-blue) 20%, transparent)',
              color: 'var(--w-accent-blue)',
              fontSize: '11px',
              lineHeight: '16px',
            }}
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-secondary)' }}
      >
        Clear all
      </button>
    </div>
  );
}

export default ActiveFilterChips;
