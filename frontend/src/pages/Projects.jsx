import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProjectHeaderCard from '../components/ProjectHeaderCard';
import ProjectSummaryCards from '../components/ProjectSummaryCards';
import StaffingTimelineChart from '../components/StaffingTimelineChart';
import RequirementsList from '../components/RequirementsList';
import StaffingPlanReviewPanel from '../components/StaffingPlanReviewPanel';
import OptimizeStaffingPanel from '../components/OptimizeStaffingPanel';
import { PROJECT, REQUIREMENTS } from '../data/staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';

// Other projects referenced elsewhere in this app (Talent Finder's
// candidate roster, the Assign workflow's project list) — listed here so
// the selector reflects the same portfolio, not just Phoenix. None of
// them have a staffing model of their own yet (see the empty state
// below); Phoenix is the only project this screen is actually wired to.
const OTHER_PROJECTS = ['Project Atlas', 'Project Orion', 'Project Nova', 'Project Horizon', 'Project Nexus', 'Project Titan', 'Project Quantum'];

// Project Staffing screen for Project Phoenix. Rebuilt around one shared
// data model (data/staffingModel.js) and one shared draft-plan store
// (stores/staffingPlanStore.js) so every widget — summary cards,
// requirements & coverage, the timeline, candidate matching and the
// review panel — reads and writes the same numbers instead of each
// carrying its own hardcoded copy. See staffingModel.js's header
// comment for what's real (the calculation engine) vs. invented-but-
// consistent fixture data (no backend project record exists for
// "Project Phoenix" — checked workforce-schema.sql/seed data).
//
// Layout: a two-column grid on desktop (lg+) — the main column and the
// review panel start in the SAME grid row, so "Staffing Plan (Draft)"'s
// top edge lines up exactly with "Project Phoenix"'s, and the panel is
// `position: sticky` within its own column (follows the page scroll,
// pins near the top) rather than `fixed` with a guessed pixel offset.
// Below lg the grid collapses to one column, so the panel just stacks
// under the main content in normal flow.
function Projects() {
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(PROJECT.name);
  const isPhoenix = selectedProject === PROJECT.name;
  const [searchParams] = useSearchParams();
  const selectRequirement = useStaffingPlanStore((s) => s.selectRequirement);

  // Deep link from elsewhere in the app (e.g. Capacity & Utilization's
  // "Find Opportunity") — /projects?requirement=req-id opens straight to
  // that requirement's detail panel instead of making the manager find
  // it again in the list.
  useEffect(() => {
    const reqId = searchParams.get('requirement');
    if (reqId && REQUIREMENTS.some((r) => r.id === reqId)) {
      selectRequirement(reqId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '24px', lineHeight: '36px', color: 'var(--w-text-primary)' }}>
            Project Staffing
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '19.5px', color: 'var(--w-text-tertiary)', marginTop: '4px' }}>
            Identify priority gaps, review suitable people, adjust allocations and understand coverage before submitting a plan.
          </p>
        </div>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{
            appearance: 'none',
            background: 'var(--w-card-bg)',
            border: '1px solid var(--w-card-border)',
            borderRadius: '6px',
            height: '30.5px',
            padding: '0 16px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: 'var(--w-text-tertiary)',
          }}
        >
          <option>{PROJECT.name}</option>
          {OTHER_PROJECTS.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </div>

      {isPhoenix ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start" style={{ marginTop: '16px' }}>
          <div className="space-y-4 min-w-0">
            <ProjectHeaderCard onOptimizeClick={() => setOptimizeOpen(true)} />
            <ProjectSummaryCards />
            <StaffingTimelineChart />
            <RequirementsList />
          </div>

          <StaffingPlanReviewPanel />
        </div>
      ) : (
        // Every other project in the dropdown is real-in-name-only here —
        // there's no requirements/candidates/timeline model behind it
        // (see data/staffingModel.js's header comment on why Phoenix is
        // fixture data too, but at least internally consistent). Rather
        // than silently showing Phoenix's numbers under a different
        // project's name, this says so plainly.
        <div style={{ marginTop: '16px', background: 'var(--w-card-bg)', border: '1px solid var(--w-card-border)', borderRadius: '10px', padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--w-text-primary)' }}>
            No staffing plan set up for {selectedProject} yet
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--w-text-tertiary)', marginTop: '6px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            This screen's requirements, candidates and timeline are only wired up for Project Phoenix so far. Switch back to see it in action.
          </p>
          <button
            onClick={() => setSelectedProject(PROJECT.name)}
            style={{ marginTop: '18px', background: 'var(--w-accent-blue)', borderRadius: '7px', padding: '9px 20px', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}
          >
            View {PROJECT.name}
          </button>
        </div>
      )}

      {optimizeOpen && <OptimizeStaffingPanel onClose={() => setOptimizeOpen(false)} />}
    </div>
  );
}

export default Projects;
