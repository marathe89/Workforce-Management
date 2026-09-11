// Project Phoenix staffing data model — single source of truth for the
// Project Staffing screen (summary cards, skill/role requirements,
// timeline, candidate matching and the draft staffing plan).
//
// No backend record exists for "Project Phoenix" (it's a Figma-matched
// mockup screen — checked workforce-schema.sql / seed data, there's no
// matching row), so requirements, candidates and commitments below are
// invented-but-internally-consistent fixtures, same convention as the
// rest of this app's assumed data. What's real is the calculation
// engine: FTE, coverage and gaps are computed the same way they would be
// against live `project_skill_requirements` / `project_assignments`
// records (see backend/src/routes/projects.js), so wiring a real project
// in later only means swapping these fixtures for an API response with
// the same shape — the math doesn't change.
//
// Terminology (deliberately not "assigned/partial/gap", which conflated
// a status with a coverage bucket):
//   - requiredFTE   — the role's demand for the period.
//   - confirmedFTE  — capacity already booked (assignment_status typically
//                     'confirmed'/'active' in the real schema), independent
//                     of whether it's 100% or a partial allocation — a
//                     partial allocation just means the committed FTE
//                     contribution is <1, it's still confirmed capacity,
//                     counted once.
//   - proposedFTE   — capacity from the *draft* plan being built on this
//                     screen (not booked yet).
//   - remainingGap  — max(0, required - confirmed - proposed), per
//                     requirement, then summed — so a role with excess
//                     coverage can never cancel out a shortfall elsewhere.
//   - potentialFTE  — capacity available from eligible-but-unassigned
//                     people whose skills match a requirement that still
//                     has a gap, capped at that gap (not a flat constant).

// ---------------------------------------------------------------------
// Project & period
// ---------------------------------------------------------------------
export const PROJECT = {
  id: 'phoenix',
  name: 'Project Phoenix',
  client: 'Global Financial Services',
  practice: 'BFS Digital',
  status: 'Planning',
  periodStart: '2026-09-01',
  periodEnd: '2027-03-31',
};

// ---------------------------------------------------------------------
// Date / FTE math
// ---------------------------------------------------------------------
const DAY_MS = 86400000;

export function toDate(d) {
  return d instanceof Date ? d : new Date(`${d}T00:00:00`);
}

export function daysBetween(startISO, endISO) {
  const days = Math.round((toDate(endISO) - toDate(startISO)) / DAY_MS) + 1;
  return Math.max(0, days);
}

// Inclusive-day overlap between two [start, end] ranges, in days.
export function overlapDays(aStart, aEnd, bStart, bEnd) {
  const start = Math.max(toDate(aStart).getTime(), toDate(bStart).getTime());
  const end = Math.min(toDate(aEnd).getTime(), toDate(bEnd).getTime());
  if (end < start) return 0;
  return Math.round((end - start) / DAY_MS) + 1;
}

// FTE contribution of one allocation against one requirement's period:
// percent capacity, prorated by how much of the requirement's period the
// allocation's [startDate, endDate] actually overlaps. An allocation
// that covers the full requirement period at 40% contributes 0.4 FTE; one
// that only covers half the period at 40% contributes 0.2 FTE.
export function computeAllocationFTE(allocation, requirement) {
  const reqDays = daysBetween(requirement.startDate, requirement.endDate);
  if (reqDays === 0) return 0;
  const overlap = overlapDays(allocation.startDate, allocation.endDate, requirement.startDate, requirement.endDate);
  const proration = overlap / reqDays;
  return (Number(allocation.percent) / 100) * proration;
}

// ---------------------------------------------------------------------
// Role / skill requirements — already-confirmed capacity is modeled as
// bookedAllocations so "confirmed" is computed the same FTE-prorating
// way as the draft plan, not a separately-hardcoded number.
// ---------------------------------------------------------------------
export const REQUIREMENTS = [
  {
    id: 'req-java', role: 'Senior Java Engineer', skill: 'Java', proficiency: 'Senior (5+ yrs)',
    priority: 'Critical', requiredFTE: 1, headcountFTE: 12,
    startDate: '2026-09-01', endDate: '2027-03-31',
    bookedAllocations: [{ percent: 75, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
  {
    id: 'req-aws', role: 'Cloud Architect', skill: 'AWS', proficiency: 'Expert',
    priority: 'Critical', requiredFTE: 1, headcountFTE: 8,
    startDate: '2026-09-01', endDate: '2027-03-31',
    bookedAllocations: [{ percent: 75, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
  {
    id: 'req-devops', role: 'DevOps Engineer', skill: 'DevOps', proficiency: 'Mid-Senior',
    priority: 'High', requiredFTE: 1, headcountFTE: 6,
    startDate: '2026-10-01', endDate: '2027-03-31',
    bookedAllocations: [{ percent: (5 / 6) * 100, startDate: '2026-10-01', endDate: '2027-03-31' }],
  },
  {
    id: 'req-data', role: 'Lead Data Engineer', skill: 'Data Engineering', proficiency: 'Senior (5+ yrs)',
    priority: 'High', requiredFTE: 1, headcountFTE: 5,
    startDate: '2026-09-01', endDate: '2027-03-31',
    bookedAllocations: [{ percent: 80, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
  {
    id: 'req-ux', role: 'UX Designer', skill: 'UX', proficiency: 'Mid-level',
    priority: 'Critical', requiredFTE: 1, headcountFTE: 4,
    startDate: '2026-09-01', endDate: '2026-12-31',
    bookedAllocations: [{ percent: 75, startDate: '2026-09-01', endDate: '2026-12-31' }],
  },
  {
    id: 'req-qa', role: 'QA Engineer', skill: 'QA', proficiency: 'Mid-level',
    priority: 'Medium', requiredFTE: 1, headcountFTE: 4,
    startDate: '2026-11-01', endDate: '2027-03-31',
    bookedAllocations: [{ percent: 100, startDate: '2026-11-01', endDate: '2027-03-31' }],
  },
  {
    id: 'req-pm', role: 'Project Manager', skill: 'Project Management', proficiency: 'Senior (5+ yrs)',
    priority: 'Medium', requiredFTE: 1, headcountFTE: 3,
    startDate: '2026-09-01', endDate: '2027-03-31',
    bookedAllocations: [{ percent: 100, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
];

// headcountFTE is expressed as a headcount-of-people scale to match the
// "42 required FTE" the screen has always shown (12+8+6+5+4+4+3 = 42);
// bookedAllocations are per-1-person-equivalent percentages, so a
// requirement's confirmed FTE = headcountFTE * (sum of prorated booked
// allocation fractions for a single slot). To keep the existing 34 FTE
// confirmed / 8 FTE gap baseline exactly reproducible, each requirement's
// booked allocation fraction already equals its own (assigned+partial)/
// headcount ratio from the previous per-skill breakdown.
export function getRequirementConfirmedFTE(requirement) {
  const bookedFraction = requirement.bookedAllocations.reduce(
    (sum, a) => sum + computeAllocationFTE(a, requirement),
    0
  );
  return bookedFraction * requirement.headcountFTE;
}

export function getRequirementRequiredFTE(requirement) {
  return requirement.headcountFTE;
}

// ---------------------------------------------------------------------
// Candidate pool — people who could fill a gap. Each has real skill
// evidence (not an opaque score), an availability window, and existing
// commitments elsewhere so capacity checks are meaningful.
// ---------------------------------------------------------------------
// `pool: 'review'` candidates are the ones surfaced for a manager to
// manually review and choose per gap (AI Talent Matching). `pool:
// 'bench'` candidates are additional eligible-but-unassigned people the
// "Optimize Staffing" heuristic is allowed to auto-propose from — kept
// separate so Optimize can't silently consume someone already sitting in
// the manual review list under the manager's nose.
export const CANDIDATES = [
  {
    id: 'priya-sharma', name: 'Priya Sharma', initials: 'PS', role: 'Senior Java Engineer', pool: 'review',
    location: 'Pune / Bangalore', skills: [{ name: 'Java', proficiency: 'Senior (5+ yrs)' }, { name: 'AWS', proficiency: 'Mid-level' }, { name: 'Kubernetes', proficiency: 'Mid-level' }],
    matchesRequirement: 'req-java',
    matchEvidence: ['6 years of Java + Spring Boot delivery on BFS projects', 'AWS-certified, hands-on with Kubernetes'],
    availableFrom: '2026-09-15', availableCapacityPercent: 40,
    commitments: [{ project: 'Project Atlas', percent: 60, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
  {
    id: 'rahul-mehta', name: 'Rahul Mehta', initials: 'RM', role: 'Lead Data Engineer', pool: 'review',
    location: 'Pune / Bangalore', skills: [{ name: 'Data Engineering', proficiency: 'Senior (5+ yrs)' }, { name: 'Python', proficiency: 'Senior (5+ yrs)' }, { name: 'AWS', proficiency: 'Mid-level' }],
    matchesRequirement: 'req-data',
    matchEvidence: ['Led data pipeline builds on 3 prior BFS engagements', 'Spark + AWS Glue at production scale'],
    availableFrom: '2026-09-01', availableCapacityPercent: 50,
    commitments: [{ project: 'Project Orion', percent: 50, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
  {
    id: 'sneha-kulkarni', name: 'Sneha Kulkarni', initials: 'SK', role: 'UX Designer', pool: 'review',
    location: 'Pune / Bangalore', skills: [{ name: 'UX', proficiency: 'Mid-level' }, { name: 'Figma', proficiency: 'Senior (5+ yrs)' }, { name: 'Design Systems', proficiency: 'Mid-level' }],
    matchesRequirement: 'req-ux',
    matchEvidence: ['Owns the BFS Digital design system used across 4 projects', 'Delivered UX for 2 prior client-facing portals'],
    availableFrom: '2026-10-01', availableCapacityPercent: 30,
    commitments: [{ project: 'Project Nova', percent: 70, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
  // Additional eligible-but-unassigned bench candidates — these back the
  // "potential additional capacity" figure with real matched people
  // instead of a flat constant.
  {
    id: 'arjun-nair', name: 'Arjun Nair', initials: 'AN', role: 'Cloud Architect', pool: 'bench',
    location: 'Pune / Bangalore', skills: [{ name: 'AWS', proficiency: 'Expert' }, { name: 'Azure', proficiency: 'Senior (5+ yrs)' }, { name: 'Terraform', proficiency: 'Senior (5+ yrs)' }],
    matchesRequirement: 'req-aws',
    matchEvidence: ['AWS Solutions Architect (Professional)', 'On the bench since 4 Sep, immediately available'],
    availableFrom: '2026-09-04', availableCapacityPercent: 60,
    commitments: [],
  },
  {
    id: 'vikram-rao', name: 'Vikram Rao', initials: 'VR', role: 'DevOps Engineer', pool: 'bench',
    location: 'Pune / Bangalore', skills: [{ name: 'DevOps', proficiency: 'Senior (5+ yrs)' }, { name: 'Kubernetes', proficiency: 'Senior (5+ yrs)' }, { name: 'Terraform', proficiency: 'Mid-level' }],
    matchesRequirement: 'req-devops',
    matchEvidence: ['CI/CD + Kubernetes platform lead on Project Horizon (wrapping down)', 'Immediately available'],
    availableFrom: '2026-09-01', availableCapacityPercent: 55,
    commitments: [{ project: 'Project Horizon', percent: 45, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
  {
    id: 'ankit-desai', name: 'Ankit Desai', initials: 'AD', role: 'Java Tech Lead', pool: 'bench',
    location: 'Pune / Bangalore', skills: [{ name: 'Java', proficiency: 'Senior (5+ yrs)' }, { name: 'Spring Boot', proficiency: 'Senior (5+ yrs)' }, { name: 'Microservices', proficiency: 'Senior (5+ yrs)' }],
    matchesRequirement: 'req-java',
    matchEvidence: ['Java tech lead on Project Atlas, wrapping down 30 Sep', '8 years Java/Spring Boot'],
    availableFrom: '2026-09-30', availableCapacityPercent: 40,
    commitments: [{ project: 'Project Atlas', percent: 60, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
  // The three below exist so UX, DevOps and Data Engineering each have a
  // real second option too, not just one person — every open requirement
  // should give a manager an actual choice to compare, not a single name.
  {
    id: 'meera-iyer', name: 'Meera Iyer', initials: 'MI', role: 'UX Designer', pool: 'bench',
    location: 'Pune / Bangalore', skills: [{ name: 'UX', proficiency: 'Senior (5+ yrs)' }, { name: 'Figma', proficiency: 'Senior (5+ yrs)' }],
    matchesRequirement: 'req-ux',
    matchEvidence: ['Led UX for 2 client-facing BFS portals', 'On the bench since 1 Sep, immediately available'],
    availableFrom: '2026-09-01', availableCapacityPercent: 50,
    commitments: [],
  },
  {
    id: 'karan-bose', name: 'Karan Bose', initials: 'KB', role: 'DevOps Engineer', pool: 'bench',
    location: 'Pune / Bangalore', skills: [{ name: 'DevOps', proficiency: 'Mid-Senior' }, { name: 'Kubernetes', proficiency: 'Mid-level' }],
    matchesRequirement: 'req-devops',
    matchEvidence: ['CI/CD pipeline owner on Project Nexus, wrapping down'],
    availableFrom: '2026-09-20', availableCapacityPercent: 45,
    commitments: [{ project: 'Project Nexus', percent: 55, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
  {
    id: 'kavya-nair', name: 'Kavya Nair', initials: 'KN', role: 'Data Engineer', pool: 'bench',
    location: 'Pune / Bangalore', skills: [{ name: 'Data Engineering', proficiency: 'Mid-Senior' }, { name: 'Python', proficiency: 'Senior (5+ yrs)' }],
    matchesRequirement: 'req-data',
    matchEvidence: ['Data pipeline engineer on Project Titan, wrapping down'],
    availableFrom: '2026-09-15', availableCapacityPercent: 40,
    commitments: [{ project: 'Project Titan', percent: 60, startDate: '2026-09-01', endDate: '2027-03-31' }],
  },
];

// Ranks a requirement's candidate pool so the UI can show a "Recommended"
// badge on the top option and a plain rank (#2, #3, ...) on the rest —
// same ordering signals a manager would use themselves: people already
// under manual review first, then more evidence, then more spare
// capacity. Deterministic, not a black-box score.
export function getRankedCandidates(requirement) {
  return CANDIDATES
    .filter((c) => c.skills.some((s) => s.name === requirement.skill))
    .sort((a, b) =>
      (a.pool === 'review' ? -1 : 1) - (b.pool === 'review' ? -1 : 1) ||
      b.matchEvidence.length - a.matchEvidence.length ||
      b.availableCapacityPercent - a.availableCapacityPercent
    )
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

// ---------------------------------------------------------------------
// Coverage / summary calculations
// ---------------------------------------------------------------------
// draftAllocations: [{ id, candidateId, requirementId, percent, startDate, endDate, status }]

export function getRequirementCoverage(requirement, draftAllocations) {
  const requiredFTE = getRequirementRequiredFTE(requirement);
  const confirmedFTE = getRequirementConfirmedFTE(requirement);
  const proposedFTE = draftAllocations
    .filter((a) => a.requirementId === requirement.id)
    .reduce((sum, a) => sum + computeAllocationFTE(a, requirement) * requirement.headcountFTE, 0);
  const remainingGap = Math.max(0, requiredFTE - confirmedFTE - proposedFTE);
  const coveredFTE = Math.min(requiredFTE, confirmedFTE + proposedFTE);
  return {
    requiredFTE,
    confirmedFTE,
    proposedFTE,
    remainingGap,
    coveragePercent: requiredFTE > 0 ? (coveredFTE / requiredFTE) * 100 : 100,
    isFilled: remainingGap <= 0.001,
  };
}

// Project-wide summary. Gap is the SUM of each requirement's own clipped
// gap — a requirement with surplus coverage (proposed pushes it past
// 100%) contributes 0 to the gap total, it never goes negative and
// offsets another requirement's shortfall.
export function getProjectSummary(draftAllocations, requirements = REQUIREMENTS) {
  let requiredFTE = 0;
  let confirmedFTE = 0;
  let proposedFTE = 0;
  let remainingGap = 0;

  requirements.forEach((req) => {
    const c = getRequirementCoverage(req, draftAllocations);
    requiredFTE += c.requiredFTE;
    confirmedFTE += c.confirmedFTE;
    // Only count proposed FTE up to what's still needed on that
    // requirement — a candidate over-proposed on an already-filled role
    // shouldn't inflate the project-wide "proposed" figure.
    proposedFTE += Math.min(c.proposedFTE, Math.max(0, c.requiredFTE - c.confirmedFTE));
    remainingGap += c.remainingGap;
  });

  const potentialFTE = getPotentialCapacity(requirements, draftAllocations);
  const confirmedCoveragePercent = requiredFTE > 0 ? (confirmedFTE / requiredFTE) * 100 : 100;
  const proposedCoveragePercent = requiredFTE > 0 ? (Math.min(requiredFTE, confirmedFTE + proposedFTE) / requiredFTE) * 100 : 100;

  return { requiredFTE, confirmedFTE, proposedFTE, remainingGap, potentialFTE, confirmedCoveragePercent, proposedCoveragePercent };
}

// Potential additional capacity: sum of eligible, unassigned candidates'
// available FTE for requirements that still have a gap, each capped at
// that requirement's own remaining gap (not a flat constant) and
// prorated for the portion of the requirement's period they can cover.
export function getPotentialCapacity(requirements = REQUIREMENTS, draftAllocations = [], excludeCandidateIds = []) {
  const assignedIds = new Set([...draftAllocations.map((a) => a.candidateId), ...excludeCandidateIds]);
  let total = 0;
  requirements.forEach((req) => {
    const coverage = getRequirementCoverage(req, draftAllocations);
    if (coverage.remainingGap <= 0) return;
    const eligible = CANDIDATES.filter((c) => c.pool === 'bench' && c.matchesRequirement === req.id && !assignedIds.has(c.id));
    let gapLeft = coverage.remainingGap;
    eligible.forEach((c) => {
      if (gapLeft <= 0) return;
      const fte = computeAllocationFTE(
        { percent: c.availableCapacityPercent, startDate: c.availableFrom, endDate: req.endDate },
        req
      ) * req.headcountFTE;
      const applied = Math.min(fte, gapLeft);
      total += applied;
      gapLeft -= applied;
    });
  });
  return total;
}

// A candidate's total committed capacity across every project (existing
// commitments + this draft plan) for a given date range, so the same
// available hours are never counted twice against two different skills.
export function getCandidateTotalPercent(candidate, draftAllocations, atDate = null) {
  const draftForCandidate = draftAllocations.filter((a) => a.candidateId === candidate.id);
  const committed = candidate.commitments.reduce((sum, c) => sum + Number(c.percent), 0);
  const proposed = draftForCandidate.reduce((sum, a) => sum + Number(a.percent), 0);
  return { committed, proposed, total: committed + proposed };
}

// Validates a proposed allocation against the candidate's real spare
// capacity and dates. Returns a list of human-readable conflicts (empty
// = valid).
export function validateAllocation(candidate, allocation, draftAllocations, requirement) {
  const conflicts = [];
  const { committed, proposed } = getCandidateTotalPercent(candidate, draftAllocations.filter((a) => a.id !== allocation.id));
  const totalAfter = committed + proposed + Number(allocation.percent);
  if (totalAfter > 100) {
    conflicts.push(`Over-allocated: ${totalAfter}% of capacity committed (existing ${committed}% + draft ${proposed + Number(allocation.percent)}%).`);
  }
  if (toDate(allocation.startDate) > toDate(allocation.endDate)) {
    conflicts.push('Start date is after end date.');
  }
  if (requirement && toDate(allocation.startDate) < toDate(candidate.availableFrom)) {
    conflicts.push(`Not available until ${candidate.availableFrom}.`);
  }
  if (requirement && (toDate(allocation.startDate) > toDate(requirement.endDate) || toDate(allocation.endDate) < toDate(requirement.startDate))) {
    conflicts.push('Proposed dates do not overlap the requirement period.');
  }
  return conflicts;
}

// ---------------------------------------------------------------------
// Timeline — required/confirmed/proposed/gap FTE by month, for the
// Staffing Timeline chart. A requirement counts toward a month only if
// that month falls inside its own [startDate, endDate] (e.g. UX ends in
// December, QA doesn't start until November), so the chart reflects the
// real per-role windows rather than a flat ramp. Selecting a month (see
// staffingPlanStore) narrows the requirement list to whichever
// requirements are actually active then.
// ---------------------------------------------------------------------
const TIMELINE_MONTHS = [
  { key: '2026-09', label: 'Sep' }, { key: '2026-10', label: 'Oct' }, { key: '2026-11', label: 'Nov' },
  { key: '2026-12', label: 'Dec' }, { key: '2027-01', label: 'Jan' }, { key: '2027-02', label: 'Feb' },
  { key: '2027-03', label: 'Mar' },
];

function monthContains(monthKey, requirement) {
  const [y, m] = monthKey.split('-').map(Number);
  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0);
  return monthStart <= toDate(requirement.endDate) && monthEnd >= toDate(requirement.startDate);
}

export function getRequirementIdsForMonth(monthKey, requirements = REQUIREMENTS) {
  return requirements.filter((r) => monthContains(monthKey, r)).map((r) => r.id);
}

export function getTimelineByMonth(draftAllocations = [], requirements = REQUIREMENTS) {
  return TIMELINE_MONTHS.map(({ key, label }) => {
    const active = requirements.filter((r) => monthContains(key, r));
    let requiredFTE = 0, confirmedFTE = 0, proposedFTE = 0, gapFTE = 0;
    active.forEach((r) => {
      const c = getRequirementCoverage(r, draftAllocations);
      requiredFTE += c.requiredFTE;
      confirmedFTE += c.confirmedFTE;
      proposedFTE += Math.min(c.proposedFTE, Math.max(0, c.requiredFTE - c.confirmedFTE));
      gapFTE += c.remainingGap;
    });
    return { month: label, monthKey: key, requiredFTE, confirmedFTE, proposedFTE, gapFTE, activeRequirementIds: active.map((r) => r.id) };
  });
}

// ---------------------------------------------------------------------
// Optimize Staffing heuristic — deterministic and transparent (not an
// AI/ML model): for each requirement still short of its target, ranked
// by priority (Critical > High > Medium) then by size of remaining gap,
// greedily proposes the best-evidenced eligible candidate whose skill
// matches and who has spare capacity in the requirement's window, until
// the requirement is filled, out of eligible people, or (if set) the
// budget/must-have constraints rule everyone out.
const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2 };

export function runOptimizeHeuristic(options, requirements = REQUIREMENTS, existingDraft = []) {
  const { mustHaveRequirementIds = [], allowPartialAllocations = true, planningStart = PROJECT.periodStart, planningEnd = PROJECT.periodEnd } = options;

  const targeted = requirements
    .filter((r) => mustHaveRequirementIds.length === 0 || mustHaveRequirementIds.includes(r.id))
    .map((r) => ({ req: r, coverage: getRequirementCoverage(r, existingDraft) }))
    .filter((x) => x.coverage.remainingGap > 0)
    .sort((a, b) => PRIORITY_RANK[a.req.priority] - PRIORITY_RANK[b.req.priority] || b.coverage.remainingGap - a.coverage.remainingGap);

  const proposals = [];
  const unfilled = [];
  const usedCandidateIds = new Set(existingDraft.map((a) => a.candidateId));

  targeted.forEach(({ req, coverage }) => {
    let gapLeft = coverage.remainingGap;
    // Only the bench pool is eligible for auto-optimization — the
    // AI Talent Matching candidates stay reserved for manual review
    // (see the `pool` comment above CANDIDATES).
    const eligible = CANDIDATES
      .filter((c) => c.pool === 'bench' && c.matchesRequirement === req.id && !usedCandidateIds.has(c.id))
      .filter((c) => toDate(c.availableFrom) <= toDate(req.endDate))
      .sort((a, b) => b.matchEvidence.length - a.matchEvidence.length);

    for (const candidate of eligible) {
      if (gapLeft <= 0) break;
      const start = toDate(candidate.availableFrom) > toDate(req.startDate) ? candidate.availableFrom : req.startDate;
      const clampedStart = Math.max(toDate(start).getTime(), toDate(planningStart).getTime());
      const clampedEnd = Math.min(toDate(req.endDate).getTime(), toDate(planningEnd).getTime());
      if (clampedEnd < clampedStart) continue;

      let percent = candidate.availableCapacityPercent;
      if (!allowPartialAllocations && percent < 100) continue;

      const dates = { startDate: new Date(clampedStart).toISOString().slice(0, 10), endDate: new Date(clampedEnd).toISOString().slice(0, 10) };
      const maxFte = computeAllocationFTE({ percent, ...dates }, req) * req.headcountFTE;
      if (maxFte <= 0) continue;

      // Don't propose more capacity than the requirement actually still
      // needs — trim the percentage proportionally so this candidate
      // closes exactly the remaining gap instead of overstaffing the
      // role while other roles stay short.
      let cappedPercent = percent;
      let fte = maxFte;
      if (maxFte > gapLeft) {
        cappedPercent = Math.round(percent * (gapLeft / maxFte) * 100) / 100;
        fte = computeAllocationFTE({ percent: cappedPercent, ...dates }, req) * req.headcountFTE;
      }

      proposals.push({
        candidateId: candidate.id,
        candidateName: candidate.name,
        requirementId: req.id,
        requirementRole: req.role,
        percent: cappedPercent,
        startDate: dates.startDate,
        endDate: dates.endDate,
        fte: Math.round(fte * 100) / 100,
        reason: cappedPercent < percent
          ? `${candidate.name} matches ${req.skill} (${req.proficiency}) — ${candidate.matchEvidence[0]}. Proposed at a reduced ${cappedPercent}% (of their available ${percent}%) to close the remaining ${Math.round(gapLeft * 100) / 100} FTE gap without overstaffing the role.`
          : `${candidate.name} matches ${req.skill} (${req.proficiency}) — ${candidate.matchEvidence[0]}. Contributes ${Math.round(fte * 100) / 100} FTE toward the ${Math.round(gapLeft * 100) / 100} FTE gap.`,
      });
      usedCandidateIds.add(candidate.id);
      gapLeft -= fte;
    }

    if (gapLeft > 0.05) {
      unfilled.push({ requirementId: req.id, requirementRole: req.role, remainingGap: Math.round(gapLeft * 100) / 100 });
    }
  });

  return {
    method: 'Deterministic rule-based heuristic: unmet requirements are ranked by priority then gap size, and each is filled by the best-evidenced eligible candidate with matching skill, dates and spare capacity — not a machine-learning or globally-optimal solver.',
    proposals,
    unfilled,
  };
}
