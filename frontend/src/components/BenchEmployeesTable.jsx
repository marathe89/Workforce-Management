import React, { useMemo, useState } from 'react';
import { REAL_BUSINESS_UNITS } from '../data/businessUnits';
import { ROLES, getBookingStatus } from '../data/benchWorkflowData';
import useBenchWorkflowStore from '../stores/benchWorkflowStore';
import FindRoleModal from './FindRoleModal';
import AIMatchWorkflowModal from './AIMatchWorkflowModal';

// Matches the Coforge Workforce Intelligence Figma "Bench Employees" table
// (node 8:11442, Bench Management page). Days-on-bench badge color is a
// reverse-engineered threshold (documented inline) that reproduces every
// row's actual color: green 0-15d, amber 16-30d, orange 31-60d, red 60+d.
//
// Business unit assigned per employee from the canonical list
// (data/businessUnits.js) so it lines up with the header filter bar and
// with Bench by Business Unit & Aging above.
//
// "Find Role" and "AI Match" now implement the full workflow specified
// in bench-management-workflow.md (8 Sep 2026): both converge on the
// shared AssignmentEditor (percentage + dates + "Allocation by date" +
// validation + a two-step Review/Confirm), against two real demonstration
// open roles (data/benchWorkflowData.js's ROLES) rather than an
// unexplained employee-wide match score. Aarav Patil (full bench) and
// Priya Sharma (existing 60% Project Atlas commitment, 40% available)
// are the two illustrative employees the spec's use cases are built
// around — Priya's `commitments` entry is read-only and protected: no
// proposed role assignment can overwrite it.
export const EMPLOYEES = [
  { id: 'aishwarya-reddy', initials: 'AR', name: 'Aishwarya Reddy', role: 'Network Engineer', gradient: 'linear-gradient(135deg, #3b7ef8 0%, #162038 100%)', practice: 'Infrastructure', unit: 'Digital Process Automation (DPA)', location: 'Pune', skills: ['Cisco', 'CCNA'], since: '4 Jun', days: 71, project: 'Project Infrastructure', matches: 1, commitments: [] },
  { id: 'kabir-singh', initials: 'KS', name: 'Kabir Singh', role: 'SAP Consultant', gradient: 'linear-gradient(135deg, #22c55e 0%, #162038 100%)', practice: 'SAP', unit: 'Banking and Financial Services (BFS)', location: 'Mumbai', skills: ['SAP ERP', 'ABAP'], since: '10 Jun', days: 65, project: 'Project Saturn', matches: 2, commitments: [] },
  { id: 'divya-menon', initials: 'DM', name: 'Divya Menon', role: 'ML Engineer', gradient: 'linear-gradient(135deg, #f59e0b 0%, #162038 100%)', practice: 'Data & AI', unit: 'Momentum AI', location: 'Bangalore', skills: ['Python', 'ML'], since: '5 Jul', days: 40, project: 'Project Orion', matches: 6, commitments: [] },
  { id: 'manish-gupta', initials: 'MG', name: 'Manish Gupta', role: 'Frontend Engineer', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #162038 100%)', practice: 'Frontend', unit: 'Insurance', location: 'Hyderabad', skills: ['React', 'TypeScript'], since: '15 Jul', days: 30, project: 'Project Nova', matches: 5, commitments: [] },
  { id: 'sanjay-kumar', initials: 'SK', name: 'Sanjay Kumar', role: 'Java Engineer', gradient: 'linear-gradient(135deg, #ef4444 0%, #162038 100%)', practice: 'Engineering', unit: 'Healthcare and Life Sciences / Hi-Tech', location: 'Pune', skills: ['Java', 'Spring'], since: '22 Jul', days: 23, project: 'Project Delta', matches: 4, commitments: [] },
  { id: 'pooja-iyer', initials: 'PI', name: 'Pooja Iyer', role: 'QA Engineer', gradient: 'linear-gradient(135deg, #06b6d4 0%, #162038 100%)', practice: 'Testing', unit: 'Travel, Transportation, and Hospitality (TTH)', location: 'Chennai', skills: ['Selenium', 'JIRA'], since: '1 Aug', days: 13, project: 'Project Velocity', matches: 8, commitments: [] },
  // Use case 1 (full bench): no existing allocation, 100% available from 8 Sep.
  { id: 'aarav-patil', initials: 'AP', name: 'Aarav Patil', role: 'Java Engineer', gradient: 'linear-gradient(135deg, #10b981 0%, #162038 100%)', practice: 'Engineering', unit: 'Momentum AI', location: 'Pune', skills: ['Java', 'AWS'], since: '8 Sep', days: 0, project: '—', matches: 0, commitments: [] },
  // Use case 2 (partial capacity): 60% booked to Project Atlas, 40% spare — demonstrates Find Role/AI Match working for a partially allocated employee too, not only full-bench ones.
  { id: 'priya-sharma-bench', initials: 'PS', name: 'Priya Sharma', role: 'Senior Java Engineer', gradient: 'linear-gradient(135deg, #3b7ef8 0%, #162038 100%)', practice: 'Engineering', unit: 'Digital Process Automation (DPA)', location: 'Pune', skills: ['Java', 'AWS'], since: '—', days: 0, project: 'Project Atlas (60%)', matches: 0,
    commitments: [{ id: 'atlas', name: 'Project Atlas', hoursPerWeek: 24, startDate: '2026-08-01', endDate: '2026-12-31', status: 'confirmed' }] },
];

// Reproduces every row's exact badge color from Figma.
function daysColor(d) {
  if (d >= 60) return 'var(--w-red)';
  if (d >= 31) return 'var(--w-orange)';
  if (d >= 16) return 'var(--w-amber)';
  return 'var(--w-green)';
}

function bucketOf(days) {
  if (days >= 60) return 'd60';
  if (days >= 31) return 'd31_60';
  if (days >= 16) return 'd16_30';
  return 'd0_15';
}

const BUCKET_LABEL = { d0_15: '0–15 Days', d16_30: '16–30 Days', d31_60: '31–60 Days', d60: '60+ Days' };

const COLUMNS = [
  { key: 'name', label: 'Employee' },
  { key: 'practice', label: 'Practice' },
  { key: 'unit', label: 'Business Unit' },
  { key: 'location', label: 'Location' },
  { key: 'skills', label: 'Skills', sortable: false },
  { key: 'days', label: 'Days' },
  { key: 'project', label: 'Current Status' },
  { key: 'matches', label: 'AI Matches' },
  { key: 'action', label: 'Action', sortable: false },
];

function EmployeeRow({ e, onFindRole, onAiMatch }) {
  const color = daysColor(e.days);
  const bookings = useBenchWorkflowStore((s) => s.bookings.filter((b) => b.employeeId === e.id));
  const isBenched = (e.commitments || []).length === 0;

  return (
    <tr style={{ borderBottom: '1px solid var(--w-divider)' }}>
      <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: '28px', height: '28px', borderRadius: '14px', backgroundImage: e.gradient, color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '10px' }}
          >
            {e.initials}
          </div>
          <div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-primary)', display: 'block' }}>{e.name}</span>
            {bookings.length > 0 && (
              <div className="flex flex-wrap gap-1" style={{ marginTop: '3px' }}>
                {bookings.map((b) => {
                  const role = ROLES.find((r) => r.id === b.roleId);
                  const status = getBookingStatus(b);
                  const c = status === 'Active' ? 'var(--w-green)' : status === 'Scheduled' ? 'var(--w-accent-blue)' : 'var(--w-text-label)';
                  return (
                    <span key={b.id} title={`${role.role} · ${b.percent}% · ${b.startDate} → ${b.endDate}`} style={{ background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c, borderRadius: '8px', padding: '1px 6px', fontFamily: '"DM Mono", monospace', fontSize: '9px', whiteSpace: 'nowrap' }}>
                      {status} · {role.role.split(' ')[0]} {b.percent}%
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>{e.practice}</td>
      <td style={{ padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>{e.unit}</td>
      <td style={{ padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>{e.location}</td>
      <td style={{ padding: '12px' }}>
        <div className="flex flex-wrap gap-1">
          {e.skills.map((s) => (
            <span
              key={s}
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
              {s}
            </span>
          ))}
        </div>
      </td>
      <td style={{ padding: '12px' }}>
        <span
          style={{
            background: `color-mix(in srgb, ${color} 13%, transparent)`,
            color,
            borderRadius: '10px',
            padding: '2px 8px',
            fontFamily: '"DM Mono", monospace',
            fontWeight: 500,
            fontSize: '11px',
            whiteSpace: 'nowrap',
          }}
        >
          {isBenched ? `${e.days}d bench` : 'partial'}
        </span>
      </td>
      <td style={{ padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>{e.project}</td>
      <td style={{ padding: '12px' }}>
        <span
          style={{
            background: 'color-mix(in srgb, var(--w-green) 13%, transparent)',
            color: 'var(--w-green)',
            borderRadius: '10px',
            padding: '2px 8px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            whiteSpace: 'nowrap',
          }}
        >
          {e.matches} found
        </span>
      </td>
      <td style={{ padding: '12px' }}>
        <div className="flex gap-1.5">
          <button onClick={() => onFindRole(e)} style={{ border: '1px solid color-mix(in srgb, var(--w-accent-blue) 25%, transparent)', borderRadius: '4px', padding: '5px 10px', fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-accent-blue)', whiteSpace: 'nowrap' }}>
            Find Role →
          </button>
          <button onClick={() => onAiMatch(e)} style={{ border: '1px solid var(--w-card-border)', borderRadius: '4px', padding: '5px 10px', fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-secondary)', whiteSpace: 'nowrap' }}>
            AI Match
          </button>
        </div>
      </td>
    </tr>
  );
}

// Owned by BenchManagement.jsx, driven by the page's `?q=` URL param (set
// by the header's global search when it links here), plus `activeFilters`
// (aging bucket / business unit) lifted from the stat cards, chart and
// business-unit table above.
function BenchEmployeesTable({ query = '', onClearQuery, activeFilters = {}, onClearFilters }, ref) {
  const [sortKey, setSortKey] = useState('days');
  const [sortDir, setSortDir] = useState('desc');
  const [findRoleEmployee, setFindRoleEmployee] = useState(null);
  const [aiMatchEmployee, setAiMatchEmployee] = useState(null);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'unit' || key === 'practice' ? 'asc' : 'desc');
    }
  };

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return EMPLOYEES.filter((e) => {
      if (q && ![e.name, e.practice, e.location, ...e.skills].join(' ').toLowerCase().includes(q)) return false;
      if (activeFilters.bucket && bucketOf(e.days) !== activeFilters.bucket) return false;
      if (activeFilters.businessUnit && e.unit !== activeFilters.businessUnit) return false;
      return true;
    });
  }, [q, activeFilters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string') {
        const cmp = av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const hasFilter = Boolean(q || activeFilters.bucket || activeFilters.businessUnit);
  const clearAll = () => {
    onClearQuery?.();
    onClearFilters?.();
  };

  return (
    <div ref={ref} style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px 24px', scrollMarginTop: '16px' }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
            Bench Employees
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '18px', color: 'var(--w-text-tertiary)', marginTop: '3px' }}>
            {sorted.length} of {EMPLOYEES.length} shown · click a column header to sort
          </p>
        </div>
        {hasFilter && (
          <button
            onClick={clearAll}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: 'var(--w-accent-blue)', border: '1px solid var(--w-accent-blue)', borderRadius: '20px', padding: '4px 10px', whiteSpace: 'nowrap' }}
          >
            {[q && `"${query}"`, activeFilters.bucket && BUCKET_LABEL[activeFilters.bucket], activeFilters.businessUnit].filter(Boolean).join(' · ')} · Clear ×
          </button>
        )}
      </div>

      <div style={{ paddingTop: '14px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1080px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--w-divider)' }}>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={c.sortable === false ? undefined : () => toggleSort(c.key)}
                  style={{
                    padding: '0 12px 8px',
                    textAlign: 'left',
                    fontFamily: '"DM Mono", monospace',
                    fontWeight: 500,
                    fontSize: '10px',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    color: sortKey === c.key ? 'var(--w-accent-blue)' : 'var(--w-text-label)',
                    whiteSpace: 'nowrap',
                    cursor: c.sortable === false ? 'default' : 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {c.label}{sortKey === c.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: '32px 12px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-tertiary)' }}>
                  No bench employee matches the current filter.
                </td>
              </tr>
            )}
            {sorted.map((e) => (
              <EmployeeRow key={e.id} e={e} onFindRole={setFindRoleEmployee} onAiMatch={setAiMatchEmployee} />
            ))}
          </tbody>
        </table>
      </div>

      {findRoleEmployee && <FindRoleModal employee={findRoleEmployee} onClose={() => setFindRoleEmployee(null)} />}
      {aiMatchEmployee && <AIMatchWorkflowModal employee={aiMatchEmployee} onClose={() => setAiMatchEmployee(null)} />}
    </div>
  );
}

export default React.forwardRef(BenchEmployeesTable);
