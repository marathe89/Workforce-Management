import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import useFilterStore from '../stores/filterStore';

// Matches the Coforge Workforce Intelligence Figma "FilterBar" widget
// (node 6:8210). In Figma this appears on Bench Management, Capacity &
// Utilization, Skills Intelligence, and Workforce — not Overview — but
// none of those are built yet, so it's added to Overview on request,
// ahead of the mockup.
//
// Deliberately has no "Business Unit" field of its own: Header.jsx
// already renders one global Business Unit selector on every page (see
// stores/filterStore.js). This bar owns the rest — Practice/Geography/
// Allocation/Grade — as staged ("draft") picks that only take effect
// when Apply is clicked, matching its own Apply/Clear All buttons.
const FIELDS = [
  {
    key: 'practice',
    label: 'Practice:',
    options: [
      'All Practices',
      'Artificial Intelligence (AI) & Data Engineering',
      'Digital Process Automation (DPA)',
      'Cloud & Infrastructure Management Services (CIMS)',
      'Advanced Application & Product Engineering',
      'Enterprise Integration Services',
      'Quality Engineering (QE)',
      'AI-Led Business Process Solutions (BPS)',
      'Digital Workplace Services',
    ],
  },
  {
    key: 'geography',
    label: 'Geography:',
    options: [
      'All Geographies',
      'Americas',
      'UK & Europe',
      'Middle East',
      'India',
      'Asia Pacific (APAC)',
      'ANZ (Australia and New Zealand)',
    ],
  },
  {
    key: 'allocation',
    label: 'Allocation:',
    options: [
      'All Workforce',
      'Fully Allocated',
      'Partially Allocated',
      'Available',
      'Bench',
      'Training',
      'Internal',
    ],
  },
  {
    key: 'grade',
    label: 'Grade:',
    options: ['All Bands', 'Band 1', 'Band 2', 'Band 3', 'Band 4', 'Band 5', 'Band 6'],
  },
];

function FilterBar() {
  const draft = useFilterStore((s) => s.draft);
  const setDraft = useFilterStore((s) => s.setDraft);
  const apply = useFilterStore((s) => s.apply);
  const clearAll = useFilterStore((s) => s.clearAll);
  const hasPending = useFilterStore((s) => JSON.stringify(s.draft) !== JSON.stringify(s.applied));

  return (
    <div className="overflow-x-auto" style={{ background: 'var(--w-sunken-bg)', borderBottom: '1px solid var(--w-divider)' }}>
      <div className="flex items-center gap-2.5 px-6 py-2.5 w-full min-w-max">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex items-center shrink-0">
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '11px',
                lineHeight: '16.5px',
                color: 'var(--w-text-label)',
                whiteSpace: 'nowrap',
                paddingRight: '4px',
              }}
            >
              {field.label}
            </span>
            <div className="relative">
              <select
                value={draft[field.key]}
                onChange={(e) => setDraft(field.key, e.target.value)}
                style={{
                  appearance: 'none',
                  background: 'var(--w-sunken-bg)',
                  border: '1px solid var(--w-divider)',
                  borderRadius: '5px',
                  height: '25px',
                  padding: '0 24px 0 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '11px',
                  color: 'var(--w-text-tertiary)',
                }}
              >
                {field.options.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDownIcon
                className="w-2.5 h-2.5 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--w-text-secondary)' }}
              />
            </div>
          </div>
        ))}

        <div className="flex-1 flex justify-end gap-1.5 min-w-fit">
          <button
            onClick={apply}
            disabled={!hasPending}
            style={{
              background: hasPending ? 'var(--w-accent-blue)' : 'var(--w-divider)',
              borderRadius: '5px',
              height: '28px',
              padding: '0 14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '11px',
              color: hasPending ? '#FFFFFF' : 'var(--w-text-label)',
              whiteSpace: 'nowrap',
            }}
          >
            Apply
          </button>
          <button
            onClick={clearAll}
            style={{
              border: '1px solid var(--w-card-border)',
              borderRadius: '5px',
              height: '28px',
              padding: '0 14px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '11px',
              color: 'var(--w-text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
