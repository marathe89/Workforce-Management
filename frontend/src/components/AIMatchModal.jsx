import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REQUIREMENTS, PROJECT, getRequirementCoverage } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';
import LightboxModal from './LightboxModal';

// "AI Match" — recommends the 1–2 best-fitting Project Phoenix roles for
// this bench employee (the only project this app has a real
// requirements/coverage model for — see staffingModel.js's header
// comment), via a transparent, deterministic weighted score — exact
// skill match, a small documented set of related-skill pairs (e.g.
// "Spring" credits toward "Java", "ML"/"TensorFlow" credit toward "Data
// Engineering"), and delivery priority. The score breakdown is shown
// per match, so nothing here is a black box or a claim of a real
// machine-learning model.
//
// Accepting a recommendation opens an inline allocation form — same
// project-allocation pattern as the app's existing Assign workflow
// (AssignModal: percentage + start date, with an "Immediate" toggle) —
// scoped to the one matched role. Confirming records the decision for
// this session (same local/no-backend convention as AssignModal and
// every other workflow action in this app); it doesn't silently invent
// a real Project Staffing allocation, since a bench employee isn't part
// of that page's candidate pool — "View in Project Staffing" stays the
// path to make it official there.
const RELATED_SKILLS = {
  Spring: 'Java', 'Spring Boot': 'Java', Kubernetes: 'DevOps', Terraform: 'DevOps',
  ML: 'Data Engineering', TensorFlow: 'Data Engineering', Python: 'Data Engineering', Spark: 'Data Engineering',
  Selenium: 'QA', JIRA: 'QA', Figma: 'UX', 'Design Systems': 'UX',
};
const PRIORITY_WEIGHT = { Critical: 15, High: 10, Medium: 5 };
const TODAY = '2026-09-08';

function scoreRequirement(employee, requirement) {
  const reasons = [];
  let score = 0;

  const exact = employee.skills.filter((s) => s === requirement.skill);
  if (exact.length > 0) {
    score += 40;
    reasons.push(`Exact skill match on ${requirement.skill}`);
  }

  const related = employee.skills.filter((s) => RELATED_SKILLS[s] === requirement.skill && s !== requirement.skill);
  if (related.length > 0) {
    score += 20;
    reasons.push(`${related.join(', ')} is related experience for ${requirement.skill}`);
  }

  if (score > 0) {
    score += PRIORITY_WEIGHT[requirement.priority] || 0;
    reasons.push(`${requirement.priority} delivery priority`);
  }

  return { score, reasons };
}

function AcceptAssignForm({ employee, requirement, onCancel, onConfirm }) {
  const [percent, setPercent] = useState(100);
  const [immediate, setImmediate] = useState(true);
  const [startDate, setStartDate] = useState(TODAY);

  return (
    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--w-divider)' }}>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--w-text-label)' }}>
          Project Allocation
        </span>
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', fontWeight: 600, color: 'var(--w-text-secondary)' }}>{percent}% allocated</span>
      </div>

      <div style={{ marginTop: '8px', background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '8px', padding: '10px' }}>
        <div className="flex items-center gap-2">
          <div
            className="flex-1"
            style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '34px', padding: '0 10px', display: 'flex', alignItems: 'center', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-primary)' }}
          >
            {requirement.role}
          </div>
          <div className="relative shrink-0" style={{ width: '72px' }}>
            <input
              type="number" min="0" max="100" value={percent}
              onChange={(e) => setPercent(Number(e.target.value.replace(/[^0-9]/g, '').slice(0, 3)) || 0)}
              style={{ width: '100%', background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '34px', padding: '0 20px 0 8px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--w-text-primary)' }}
            />
            <span style={{ position: 'absolute', right: '7px', top: '8px', fontSize: '11px', color: 'var(--w-text-label)' }}>%</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '8px' }}>
          <label className="flex items-center gap-1.5 shrink-0" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-secondary)' }}>
            <input type="checkbox" checked={immediate} onChange={(e) => setImmediate(e.target.checked)} style={{ accentColor: 'var(--w-accent-blue)' }} />
            Immediate
          </label>
          {!immediate && (
            <input
              type="date" value={startDate} min={TODAY}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1"
              style={{ background: 'var(--w-sunken-bg)', border: '1px solid var(--w-card-border)', borderRadius: '6px', height: '30px', padding: '0 8px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-primary)', colorScheme: 'light dark', minWidth: 0 }}
            />
          )}
        </div>
      </div>

      <div className="flex gap-2" style={{ marginTop: '10px' }}>
        <button onClick={onCancel} className="flex-1" style={{ border: '1px solid var(--w-card-border)', borderRadius: '7px', height: '34px', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', color: 'var(--w-text-secondary)' }}>
          Cancel
        </button>
        <button
          onClick={() => onConfirm({ percent, startDate: immediate ? 'Immediate' : startDate })}
          disabled={percent <= 0}
          className="flex-1"
          style={{ background: percent > 0 ? 'var(--w-accent-blue)' : 'var(--w-divider)', borderRadius: '7px', height: '34px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: percent > 0 ? '#FFFFFF' : 'var(--w-text-label)' }}
        >
          Confirm Assignment
        </button>
      </div>
    </div>
  );
}

function MatchCard({ employee, requirement, coverage, score, reasons, rank }) {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [accepted, setAccepted] = useState(null); // { percent, startDate } | null
  const round1 = (n) => Math.round(n * 10) / 10;

  return (
    <div style={{ background: 'var(--w-sunken-bg)', border: `1px solid ${accepted ? 'var(--w-green)' : 'var(--w-divider)'}`, borderRadius: '9px', padding: '14px 16px' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span
            style={{
              background: rank === 1 ? 'color-mix(in srgb, var(--w-green) 15%, transparent)' : 'var(--w-card-bg)',
              border: `1px solid ${rank === 1 ? 'var(--w-green)' : 'var(--w-card-border)'}`,
              borderRadius: '10px', padding: '1px 8px',
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '10px', color: rank === 1 ? 'var(--w-green)' : 'var(--w-text-secondary)',
            }}
          >
            {rank === 1 ? '★ Best match' : `#${rank}`}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--w-text-primary)' }}>{requirement.role}</span>
        </span>
        <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: 700, fontSize: '13px', color: 'var(--w-accent-blue)' }}>{score} pts</span>
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'var(--w-text-tertiary)', marginTop: '6px' }}>{reasons.join(' · ')}</p>
      <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: coverage.remainingGap > 0 ? 'var(--w-red)' : 'var(--w-green)', marginTop: '4px' }}>
        {coverage.remainingGap > 0 ? `${round1(coverage.remainingGap)} FTE gap open` : 'Fully covered right now'}
      </p>

      {accepted ? (
        <div style={{ marginTop: '10px', background: 'color-mix(in srgb, var(--w-green) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--w-green) 35%, transparent)', borderRadius: '8px', padding: '10px 12px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--w-green)' }}>
            ✓ Accepted — {accepted.percent}% starting {accepted.startDate}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'var(--w-text-label)', marginTop: '2px' }}>
            Recorded for this session. To make it official in the staffing plan, use "View in Project Staffing" below.
          </p>
        </div>
      ) : formOpen ? (
        <AcceptAssignForm
          employee={employee}
          requirement={requirement}
          onCancel={() => setFormOpen(false)}
          onConfirm={(result) => { setAccepted(result); setFormOpen(false); }}
        />
      ) : (
        <div className="flex gap-2" style={{ marginTop: '10px' }}>
          <button
            onClick={() => setFormOpen(true)}
            style={{ background: 'var(--w-accent-blue)', borderRadius: '6px', padding: '7px 14px', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}
          >
            Accept &amp; Assign
          </button>
          <button
            onClick={() => navigate(`/projects?requirement=${requirement.id}`)}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px', color: 'var(--w-accent-blue)' }}
          >
            View in Project Staffing →
          </button>
        </div>
      )}
    </div>
  );
}

function AIMatchModal({ employee }) {
  const [open, setOpen] = useState(false);
  const draftAllocations = useStaffingPlanStore((s) => s.draftAllocations);

  const ranked = REQUIREMENTS
    .map((requirement) => ({ requirement, coverage: getRequirementCoverage(requirement, draftAllocations), ...scoreRequirement(employee, requirement) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-expanded={open}
        style={{
          border: '1px solid var(--w-card-border)',
          borderRadius: '4px',
          padding: '5px 10px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          color: 'var(--w-text-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        AI Match
      </button>

      {open && (
        <LightboxModal onClose={() => setOpen(false)} width={520} titleId="ai-match-title">
          <p id="ai-match-title" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--w-text-primary)', paddingRight: '24px' }}>
            AI Match — {employee.name}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
            Top {ranked.length || 0} {PROJECT.name} role{ranked.length === 1 ? '' : 's'} for this profile, ranked by a transparent rule-based score (exact + related skill match, weighted by delivery priority) — not a machine-learning recommendation.
          </p>

          <div className="flex flex-col gap-3" style={{ marginTop: '18px' }}>
            {ranked.length === 0 && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-tertiary)' }}>
                No requirement in {PROJECT.name} scores a match against {employee.name.split(' ')[0]}'s skills ({employee.skills.join(', ')}).
              </p>
            )}
            {ranked.map(({ requirement, coverage, score, reasons }, i) => (
              <MatchCard key={requirement.id} employee={employee} requirement={requirement} coverage={coverage} score={score} reasons={reasons} rank={i + 1} />
            ))}
          </div>
        </LightboxModal>
      )}
    </>
  );
}

export default AIMatchModal;
