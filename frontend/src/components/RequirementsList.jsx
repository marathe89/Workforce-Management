import React from 'react';
import { REQUIREMENTS, getRequirementCoverage, getRequirementIdsForMonth } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';
import RequirementDetailPanel from './RequirementDetailPanel';

// Replaces "Project Skill Demand" — every role/skill gap is now a real,
// keyboard-accessible button (not just a progress bar) that expands into
// its RequirementDetailPanel. When a timeline period is selected (see
// StaffingTimelineChart), the list narrows to the requirements actually
// active that month.
const PRIORITY_COLOR = { Critical: 'var(--w-red)', High: 'var(--w-amber)', Medium: 'var(--w-text-secondary)' };

function RequirementRow({ requirement }) {
  const draftAllocations = useStaffingPlanStore((s) => s.draftAllocations);
  const selectedRequirementId = useStaffingPlanStore((s) => s.selectedRequirementId);
  const selectRequirement = useStaffingPlanStore((s) => s.selectRequirement);
  const coverage = getRequirementCoverage(requirement, draftAllocations);
  const isOpen = selectedRequirementId === requirement.id;
  const round1 = (n) => Math.round(n * 10) / 10;

  const [assignedPct, proposedPct, gapPct] = [
    (coverage.confirmedFTE / coverage.requiredFTE) * 100,
    (Math.min(coverage.proposedFTE, Math.max(0, coverage.requiredFTE - coverage.confirmedFTE)) / coverage.requiredFTE) * 100,
    (coverage.remainingGap / coverage.requiredFTE) * 100,
  ];

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => selectRequirement(requirement.id)}
        className="w-full text-left"
        style={{ display: 'block', borderRadius: '8px', padding: '4px 0' }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-text-primary)' }}>{requirement.role}</span>
            <span
              style={{
                background: `color-mix(in srgb, ${PRIORITY_COLOR[requirement.priority]} 14%, transparent)`,
                border: `1px solid color-mix(in srgb, ${PRIORITY_COLOR[requirement.priority]} 35%, transparent)`,
                fontFamily: '"DM Mono", monospace', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                color: PRIORITY_COLOR[requirement.priority], borderRadius: '10px', padding: '1px 7px',
              }}
            >
              {requirement.priority}
            </span>
          </span>
          <div className="flex items-center gap-2.5">
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--w-accent-blue)' }}>{round1(coverage.confirmedFTE)}/{requirement.headcountFTE}</span>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: coverage.isFilled ? 'var(--w-green)' : 'var(--w-red)' }}>
              {coverage.isFilled ? '✓ filled' : `-${round1(coverage.remainingGap)} gap`}
            </span>
            <span aria-hidden="true" style={{ fontSize: '11px', color: 'var(--w-text-label)', transform: isOpen ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
          </div>
        </div>
        <div className="flex" style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'var(--w-sunken-bg)', marginTop: '4px', gap: '1px' }}>
          {assignedPct > 0 && <div style={{ width: `${assignedPct}%`, background: 'var(--w-accent-blue)' }} />}
          {proposedPct > 0 && <div style={{ width: `${proposedPct}%`, background: 'var(--w-indigo)' }} />}
          {gapPct > 0 && <div style={{ width: `${gapPct}%`, background: 'color-mix(in srgb, var(--w-red) 13%, transparent)' }} />}
        </div>
      </button>
      {isOpen && <RequirementDetailPanel requirement={requirement} />}
    </div>
  );
}

function RequirementsList() {
  const selectedPeriodMonth = useStaffingPlanStore((s) => s.selectedPeriodMonth);
  const selectPeriod = useStaffingPlanStore((s) => s.selectPeriod);

  const activeIds = selectedPeriodMonth ? new Set(getRequirementIdsForMonth(selectedPeriodMonth)) : null;
  const visible = activeIds ? REQUIREMENTS.filter((r) => activeIds.has(r.id)) : REQUIREMENTS;

  return (
    <div style={{ background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '20px' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '21px', color: 'var(--w-text-primary)' }}>
          Requirements & Coverage
        </p>
        {selectedPeriodMonth && (
          <button
            onClick={() => selectPeriod(selectedPeriodMonth)}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-accent-blue)', border: '1px solid var(--w-accent-blue)', borderRadius: '20px', padding: '3px 10px' }}
          >
            Showing {selectedPeriodMonth} only · Clear ×
          </button>
        )}
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '2px' }}>
        Select a role to see its confirmed/proposed/remaining split and matching candidates.
      </p>
      <div className="flex flex-col gap-3" style={{ paddingTop: '14px' }}>
        {visible.map((requirement) => (
          <RequirementRow key={requirement.id} requirement={requirement} />
        ))}
        {visible.length === 0 && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)' }}>No requirements are active in this period.</p>
        )}
      </div>
    </div>
  );
}

export default RequirementsList;
