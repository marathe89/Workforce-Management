import React, { useEffect, useRef, useState } from 'react';
import { parseQuery, getSuggestions } from '../data/talentData';

// Matches the Coforge Workforce Intelligence Figma "NATURAL LANGUAGE
// SEARCH" widget exactly (node 6:10066, Talent Finder page). No real NLP
// backend exists (same as the Header's own search), but the box is now a
// working "vibe search" input — data/talentData.js parses skills,
// locations, availability phrases ("immediate", "within 30 days", "40%
// capacity") and role keywords out of free text and ranks candidates by
// how well they match, rather than requiring an exact phrase. Below the
// input: an autocomplete dropdown (matches skills/roles/locations/names
// as you type) and, once something's recognized, a row of removable
// pills showing exactly what was understood from the query — the example
// chips only show while the box is empty, since once there's a real
// query the parsed pills are the more useful thing to look at. No
// separate Search button — results filter live as you type (see
// TalentResultsTable), so a submit button was redundant; only a Clear
// (×) button remains once there's a query.
const EXAMPLE_CHIPS = [
  'Java developers in Pune',
  'Available in 30 days',
  'AWS certified',
  'Cloud Architects > 40% capacity',
  'GenAI engineers',
];

function TalentSearchBar({ value, onChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [dropdownOpen]);

  const suggestions = getSuggestions(value);
  const criteria = value.trim() ? parseQuery(value) : null;
  const pills = criteria
    ? [
        ...criteria.skills.map((s) => ({ key: `skill-${s}`, label: s, remove: s })),
        ...criteria.locations.map((l) => ({ key: `loc-${l}`, label: l[0].toUpperCase() + l.slice(1), remove: l })),
        ...criteria.roleTerms.map((r) => ({ key: `role-${r}`, label: r, remove: r })),
        ...(criteria.availability ? [{ key: 'avail', label: criteria.availability.label, remove: null }] : []),
      ]
    : [];

  const removeTerm = (term) => {
    if (!term) return;
    const next = value.replace(new RegExp(term, 'gi'), '').replace(/\s+/g, ' ').trim();
    onChange(next);
  };

  return (
    <div
      ref={containerRef}
      style={{
        background: 'var(--w-card-bg)',
        border: '1px solid color-mix(in srgb, var(--w-accent-blue) 25%, transparent)',
        borderRadius: '12px',
        padding: '20px 24px',
      }}
    >
      <p style={{ fontFamily: '"DM Mono", monospace', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-label)' }}>
        NATURAL LANGUAGE SEARCH
      </p>

      <div className="relative" style={{ marginTop: '8px', height: '44px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '10px', fontSize: '16px', color: 'var(--w-accent-blue)' }}>✦</span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          placeholder="Find 5 senior Java developers with AWS experience and at least 40% available capacity within 30 days..."
          style={{
            width: '100%',
            height: '44px',
            background: 'var(--w-sunken-bg)',
            border: '1px solid var(--w-card-border)',
            borderRadius: '8px',
            paddingLeft: '40px',
            paddingRight: value ? '38px' : '14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: 'var(--w-text-primary)',
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: '12px',
              top: '10px',
              fontSize: '16px',
              color: 'var(--w-text-label)',
            }}
          >
            ×
          </button>
        )}

        {/* Autocomplete dropdown — matches skills/roles/locations/names
            against what's typed so far; clicking one replaces the query
            with that term so it's immediately searchable. */}
        {dropdownOpen && suggestions.length > 0 && (
          <div
            className="absolute left-0 top-full mt-1.5 w-full z-30 overflow-hidden"
            style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}
          >
            {suggestions.map((s) => (
              <button
                key={`${s.type}-${s.text}`}
                onClick={() => {
                  onChange(s.text);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center justify-between"
                style={{ padding: '8px 14px', textAlign: 'left' }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)' }}>{s.text}</span>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>{s.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Parsed-criteria pills — only once there's a query and the
          parser recognized something in it. */}
      {pills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" style={{ paddingTop: '10px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)' }}>Understood:</span>
          {pills.map((p) => (
            <span
              key={p.key}
              className="flex items-center gap-1"
              style={{
                background: 'color-mix(in srgb, var(--w-accent-blue) 13%, transparent)',
                border: '1px solid color-mix(in srgb, var(--w-accent-blue) 25%, transparent)',
                borderRadius: '20px',
                padding: '3px 6px 3px 10px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                color: 'var(--w-accent-blue)',
              }}
            >
              {p.label}
              {p.remove && (
                <button
                  onClick={() => removeTerm(p.remove)}
                  aria-label={`Remove ${p.label}`}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '999px',
                    background: 'color-mix(in srgb, var(--w-accent-blue) 20%, transparent)',
                    fontSize: '10px',
                    lineHeight: '14px',
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Example chips — decorative starting points, hidden once a real
          query with recognized pills is in play so they don't compete
          with the parsed-criteria row above. */}
      {pills.length === 0 && (
        <div className="flex flex-wrap gap-2" style={{ paddingTop: '10px' }}>
          {EXAMPLE_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => onChange(chip)}
              style={{
                background: value === chip ? 'color-mix(in srgb, var(--w-accent-blue) 15%, var(--w-sunken-bg))' : 'var(--w-sunken-bg)',
                border: `1px solid ${value === chip ? 'var(--w-accent-blue)' : 'var(--w-card-border)'}`,
                borderRadius: '20px',
                padding: '5px 12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                color: value === chip ? 'var(--w-accent-blue)' : 'var(--w-text-secondary)',
                whiteSpace: 'nowrap',
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TalentSearchBar;
