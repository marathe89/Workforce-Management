import React, { useMemo, useState } from 'react';
import { searchTalent, daysFromToday } from '../data/talentData';
import AssignModal from './AssignModal';

// Matches the Coforge Workforce Intelligence Figma "Talent Results" table
// exactly (node 6:10146 header + 6:10195 row structure, Talent Finder
// page). Static Figma mockup data — no talent-matching backend exists yet.
// The match-score ring is a real SVG gauge (computed from the score),
// not a re-embedded Figma image export — same reasoning as the charts
// rebuilt elsewhere in this app. Rows are ranked by the "vibe search"
// engine in data/talentData.js when a query is present, instead of a
// strict substring filter — see that file for how it scores candidates.
//
// Sorting (both the column headers and the "Sort:" dropdown, kept in
// sync) and the Assign workflow (checkbox selection → AssignModal →
// local "Assigned" state) are both real client-side behavior now — there's
// still no staffing backend, so an assignment only lasts the session
// (flagged in AssignModal.jsx too), but the interaction itself is fully
// functional rather than decorative.
const SORT_OPTIONS = [
  { key: 'score', label: 'Search Match', queryOnly: true },
  { key: 'match', label: 'Match %' },
  { key: 'name', label: 'Name' },
  { key: 'allocation', label: 'Allocation %' },
  { key: 'available', label: 'Available %' },
  { key: 'availableFrom', label: 'Available From' },
];

const COLUMNS = [
  { key: null, label: '' },
  { key: 'name', label: 'Employee' },
  { key: null, label: 'Role / Grade' },
  { key: null, label: 'Skills' },
  { key: null, label: 'Project' },
  { key: 'allocation', label: 'Allocation' },
  { key: 'available', label: 'Available' },
  { key: 'availableFrom', label: 'Available From' },
  { key: null, label: 'Location' },
  { key: 'match', label: 'Match %' },
  { key: null, label: 'Actions' },
];

const th = {
  textAlign: 'left',
  padding: '0 10px 10px 10px',
  fontFamily: '"DM Mono", monospace',
  fontWeight: 500,
  fontSize: '10px',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  color: 'var(--w-text-label)',
  borderBottom: '1px solid var(--w-divider)',
  whiteSpace: 'nowrap',
};

const td = { padding: '10px', borderBottom: '1px solid var(--w-sunken-bg)', verticalAlign: 'middle' };

function sortValue(person, key) {
  if (key === 'name') return person.name.toLowerCase();
  if (key === 'availableFrom') return daysFromToday(person.availableFrom);
  if (key === 'score') return person.searchScore ?? -1;
  return person[key];
}

function MatchGauge({ score }) {
  const size = 36;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 90 ? 'var(--w-green)' : 'var(--w-amber)';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--w-divider)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '9px', color: 'var(--w-text-primary)' }}
      >
        {score}
      </div>
    </div>
  );
}

function TalentResultsTable({ query = '' }) {
  const hasQuery = Boolean(query.trim());
  const [sortKey, setSortKey] = useState(hasQuery ? 'score' : 'match');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(() => new Set());
  const [assigned, setAssigned] = useState(() => new Map()); // name -> { allocations: [{project, percent, startDate}] }
  const [assignTarget, setAssignTarget] = useState(null); // person[] being assigned, or null
  const [favorites, setFavorites] = useState(() => new Set()); // names starred, session-only (no backend to persist to)

  const toggleFavorite = (name) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const searched = searchTalent(query);
  const results = useMemo(() => {
    const withScore = searched;
    const sorted = [...withScore].sort((a, b) => {
      // Favorited rows are pinned to the top regardless of the active
      // sort — checked first, before the normal column comparison, so
      // whichever sort/search is applied only orders *within* the
      // favorited and non-favorited groups, not across them.
      const aFav = favorites.has(a.name);
      const bFav = favorites.has(b.name);
      if (aFav !== bFav) return aFav ? -1 : 1;

      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [searched, sortKey, sortDir, favorites]);

  const toggleSort = (key) => {
    if (!key) return;
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const toggleSelect = (name) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === results.length ? new Set() : new Set(results.map((p) => p.name))));
  };

  const confirmAssign = ({ allocations }) => {
    setAssigned((prev) => {
      const next = new Map(prev);
      assignTarget.forEach((p) => next.set(p.name, { allocations }));
      return next;
    });
    setSelected((prev) => {
      const next = new Set(prev);
      assignTarget.forEach((p) => next.delete(p.name));
      return next;
    });
    setAssignTarget(null);
  };

  const availableSortOptions = SORT_OPTIONS.filter((o) => !o.queryOnly || hasQuery);

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px' }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--w-text-primary)' }}>
          {results.length} Talent Result{results.length === 1 ? '' : 's'}
          {hasQuery && <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', color: 'var(--w-text-label)' }}> for "{query}"</span>}
        </p>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => setAssignTarget(results.filter((p) => selected.has(p.name)))}
              style={{
                background: 'var(--w-accent-blue)',
                borderRadius: '6px',
                height: '27px',
                padding: '0 12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '11px',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
              }}
            >
              Assign Selected ({selected.size})
            </button>
          )}
          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => {
                setSortKey(e.target.value);
                setSortDir('desc');
              }}
              style={{
                appearance: 'none',
                background: 'var(--w-sunken-bg)',
                border: '1px solid var(--w-card-border)',
                borderRadius: '6px',
                height: '27px',
                padding: '0 28px 0 12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                color: 'var(--w-text-tertiary)',
              }}
            >
              {availableSortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  Sort: {o.label} {sortKey === o.key ? (sortDir === 'asc' ? '↑' : '↓') : '↓'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto" style={{ marginTop: '18px' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {COLUMNS.map((col, i) => (
                <th
                  key={i}
                  style={{ ...th, cursor: col.key ? 'pointer' : 'default' }}
                  onClick={() => toggleSort(col.key)}
                >
                  {i === 0 ? (
                    <input type="checkbox" checked={selected.size > 0 && selected.size === results.length} onChange={toggleSelectAll} />
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.key && sortKey === col.key && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: '32px 10px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-label)' }}>
                  No matching talent for "{query}".
                </td>
              </tr>
            )}
            {results.map((person) => {
              const isAssigned = assigned.has(person.name);
              return (
                <tr key={person.name} style={isAssigned ? { background: 'color-mix(in srgb, var(--w-green) 6%, transparent)' } : undefined}>
                  <td style={td}>
                    <input type="checkbox" checked={selected.has(person.name)} onChange={() => toggleSelect(person.name)} />
                  </td>
                  <td style={td}>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '14px',
                          backgroundImage: 'linear-gradient(135deg, var(--w-accent-blue) 0%, var(--w-sunken-bg) 100%)',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          fontSize: '10px',
                          color: '#FFFFFF',
                        }}
                      >
                        {person.initials}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-primary)' }}>
                          {person.name}
                        </p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-label)' }}>{person.practice}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...td, fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)' }}>{person.role}</td>
                  <td style={td}>
                    <div className="flex flex-wrap gap-1" style={{ maxWidth: '160px' }}>
                      {person.skills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            background: 'var(--w-sunken-bg)',
                            border: '1px solid var(--w-card-border)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '10px',
                            color: 'var(--w-text-tertiary)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...td, fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>{person.project}</td>
                  <td style={td}>
                    <div style={{ width: '70px' }}>
                      <div className="flex" style={{ height: '5px', gap: '1px' }}>
                        <div style={{ flex: person.allocation, background: 'var(--w-accent-blue)', borderRadius: '3px', minWidth: person.allocation ? 2 : 0 }} />
                        <div style={{ flex: person.available, background: 'color-mix(in srgb, var(--w-green) 19%, transparent)', borderRadius: '3px' }} />
                      </div>
                      <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-accent-blue)', marginTop: '2px' }}>
                        {person.allocation}%
                      </p>
                    </div>
                  </td>
                  <td style={{ ...td, fontFamily: '"DM Mono", monospace', fontWeight: 500, fontSize: '12px', color: 'var(--w-green)' }}>
                    {person.available}%
                  </td>
                  <td style={{ ...td, fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-text-tertiary)' }}>{person.availableFrom}</td>
                  <td style={{ ...td, fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>{person.location}</td>
                  <td style={td}>
                    <MatchGauge score={person.match} />
                  </td>
                  <td style={td}>
                    <div className="flex items-start gap-1">
                      <button
                        onClick={() => toggleFavorite(person.name)}
                        aria-label={favorites.has(person.name) ? `Remove ${person.name} from favorites` : `Mark ${person.name} as favorite`}
                        aria-pressed={favorites.has(person.name)}
                        className="shrink-0"
                        style={{
                          border: `1px solid ${favorites.has(person.name) ? 'color-mix(in srgb, var(--w-amber) 40%, transparent)' : 'var(--w-card-border)'}`,
                          background: favorites.has(person.name) ? 'color-mix(in srgb, var(--w-amber) 13%, transparent)' : 'transparent',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '10px',
                          color: favorites.has(person.name) ? 'var(--w-amber)' : 'var(--w-text-secondary)',
                        }}
                      >
                        {favorites.has(person.name) ? '★' : '☆'}
                      </button>
                      {isAssigned ? (
                        <div className="flex flex-col gap-1" style={{ minWidth: '150px' }}>
                          {assigned.get(person.name).allocations.map((a) => (
                            <span
                              key={a.project}
                              style={{
                                background: 'color-mix(in srgb, var(--w-green) 15%, transparent)',
                                color: 'var(--w-green)',
                                borderRadius: '4px',
                                padding: '3px 7px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 600,
                                fontSize: '10px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              ✓ {a.project} ({a.percent}%) — {a.startDate === 'Immediate' ? 'Immediate' : new Date(a.startDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssignTarget([person])}
                          style={{
                            border: '1px solid var(--w-card-border)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '10px',
                            color: 'var(--w-accent-blue)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {assignTarget && <AssignModal people={assignTarget} onCancel={() => setAssignTarget(null)} onConfirm={confirmAssign} />}
    </div>
  );
}

export default TalentResultsTable;
