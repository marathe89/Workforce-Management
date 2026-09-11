import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Matches the Coforge Workforce Intelligence Figma filter row exactly
// (node 6:10097, Talent Finder page) — distinct from the shared FilterBar
// component (different fields, no Apply/Clear buttons, card-toned rather
// than sunken-toned dropdowns). Decorative for now, like FilterBar — each
// dropdown's own option list added per the reference screenshots.
const FIELDS = [
  { label: 'All Skills', options: ['All Skills', 'Java', 'Python', 'AWS', 'React', 'GenAI', 'DevOps'] },
  { label: 'All Experience', options: ['All Experience', '3–5 years', '5–8 years', '8+ years'] },
  { label: 'All Bands', options: ['All Bands', 'Band 1', 'Band 2', 'Band 3', 'Band 4', 'Band 5', 'Band 6'] },
  {
    label: 'All Geographies',
    options: ['All Geographies', 'Americas', 'UK & Europe', 'Middle East', 'India', 'Asia Pacific (APAC)', 'ANZ (Australia and New Zealand)'],
  },
  { label: 'Any Date', options: ['Any Date', 'Immediate', 'Within 15 days', 'Within 30 days'] },
  { label: 'Any', options: ['Any', '< 50%', '50–70%', '70–99%', 'On Bench'] },
];

function TalentFilterRow() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {FIELDS.map((field) => (
        <div key={field.label} className="relative">
          <select
            style={{
              appearance: 'none',
              background: 'var(--w-card-bg)',
              border: '1px solid var(--w-card-border)',
              borderRadius: '6px',
              height: '29px',
              padding: '0 26px 0 14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              color: 'var(--w-text-tertiary)',
            }}
          >
            {field.options.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDownIcon
            className="w-2.5 h-2.5 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--w-text-secondary)' }}
          />
        </div>
      ))}
    </div>
  );
}

export default TalentFilterRow;
