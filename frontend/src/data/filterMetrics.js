// Assumed-data engine for Overview's filters. No backend exists for any
// of these breakdowns, so — on explicit request — every widget's numbers
// now move together in a way that's internally consistent (ratios and
// totals still add up to each other) rather than each card independently
// making up unrelated numbers.
//
// Model: each filter dimension (except the two with a real per-item
// dataset already in this app) contributes a small "weight" — a
// headcount SHARE (for Business Unit and Allocation, which really do
// partition the workforce) or a modest UTIL delta / neutral 1.0 headcount
// multiplier (for Practice/Geography/Grade, which have no real headcount
// split anywhere in this app's mock data). Selecting "All ..." on any
// dimension contributes no adjustment (share/multiplier of 1, delta of
// 0) — the model collapses back to the exact original static numbers
// when every filter is at its default, so "no filters" still means "the
// numbers everyone already reviewed."
//
// - Business Unit shares are the exact same figures already used in
//   UtilizationPerformanceCard's table (renamed to match the dropdown),
//   normalized to sum to 1 — so picking a BU here and reading that table
//   agree with each other.
// - Allocation shares are the exact same figures already used in
//   WorkforceHealthCard's segmented bar.
// - Practice/Geography/Grade get a modest ±15% headcount nudge and a
//   small utilization delta each, invented for variety since no real
//   split exists for them — picking one visibly moves the numbers
//   without collapsing them to an implausible near-zero.
const BUSINESS_UNIT_WEIGHTS = {
  'Banking and Financial Services (BFS)': { share: 12400, utilDelta: -0.8 },
  Insurance: { share: 9800, utilDelta: -3.4 },
  'Travel, Transportation, and Hospitality (TTH)': { share: 7200, utilDelta: -1.6 },
  'Healthcare and Life Sciences / Hi-Tech': { share: 6100, utilDelta: -5.2 },
  'Public Sector & Government': { share: 5800, utilDelta: 0.1 },
  'Private Equity Business Unit': { share: 4200, utilDelta: 2.3 },
  'Momentum AI': { share: 2800, utilDelta: -4.6 },
  'Digital Process Automation (DPA)': { share: 1120, utilDelta: -6.8 },
};
const BU_SHARE_TOTAL = Object.values(BUSINESS_UNIT_WEIGHTS).reduce((sum, w) => sum + w.share, 0);

const ALLOCATION_WEIGHTS = {
  'Fully Allocated': { share: 73.7, utilDelta: 3.1 },
  'Partially Allocated': { share: 13.2, utilDelta: -6.4 },
  Available: { share: 5.8, utilDelta: -18.6 },
  Bench: { share: 2.3, utilDelta: -82.6 },
  Training: { share: 2.5, utilDelta: -14.2 },
  Internal: { share: 2.4, utilDelta: -9.8 },
};

const PRACTICE_WEIGHTS = {
  'Artificial Intelligence (AI) & Data Engineering': { mult: 1.12, utilDelta: -2.1 },
  'Digital Process Automation (DPA)': { mult: 0.88, utilDelta: 1.4 },
  'Cloud & Infrastructure Management Services (CIMS)': { mult: 1.05, utilDelta: -1.2 },
  'Advanced Application & Product Engineering': { mult: 1.15, utilDelta: 0.6 },
  'Enterprise Integration Services': { mult: 0.92, utilDelta: -3.0 },
  'Quality Engineering (QE)': { mult: 0.9, utilDelta: 2.5 },
  'AI-Led Business Process Solutions (BPS)': { mult: 0.95, utilDelta: -1.8 },
  'Digital Workplace Services': { mult: 0.85, utilDelta: 1.9 },
};

const GEOGRAPHY_WEIGHTS = {
  Americas: { mult: 1.14, utilDelta: 1.1 },
  'UK & Europe': { mult: 1.02, utilDelta: -0.9 },
  'Middle East': { mult: 0.86, utilDelta: 0.4 },
  India: { mult: 1.1, utilDelta: -1.5 },
  'Asia Pacific (APAC)': { mult: 0.9, utilDelta: -2.3 },
  'ANZ (Australia and New Zealand)': { mult: 0.82, utilDelta: 2.0 },
};

const GRADE_WEIGHTS = {
  'Band 1': { mult: 1.18, utilDelta: 2.4 },
  'Band 2': { mult: 1.08, utilDelta: 1.2 },
  'Band 3': { mult: 1.0, utilDelta: 0 },
  'Band 4': { mult: 0.92, utilDelta: -1.1 },
  'Band 5': { mult: 0.88, utilDelta: -2.0 },
  'Band 6': { mult: 0.8, utilDelta: -3.2 },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Combined headcount-scale factor. Business Unit and Allocation are real
// shares of the workforce (so picking one meaningfully shrinks the
// total); Practice/Geography/Grade are modest multipliers layered on
// top. Clamped so no combination collapses to an implausible sliver.
export function getFactor(applied) {
  let factor = 1;
  const bu = BUSINESS_UNIT_WEIGHTS[applied.businessUnit];
  if (bu) factor *= bu.share / BU_SHARE_TOTAL;

  const alloc = ALLOCATION_WEIGHTS[applied.allocation];
  if (alloc) factor *= alloc.share / 100;

  const practice = PRACTICE_WEIGHTS[applied.practice];
  if (practice) factor *= practice.mult;

  const geo = GEOGRAPHY_WEIGHTS[applied.geography];
  if (geo) factor *= geo.mult;

  const grade = GRADE_WEIGHTS[applied.grade];
  if (grade) factor *= grade.mult;

  return clamp(factor, 0.015, 1);
}

// Combined utilization delta (percentage points), applied additively to
// base utilization/coverage-style metrics — these are rates, not counts,
// so they shift rather than scale.
export function getUtilDelta(applied) {
  let delta = 0;
  const bu = BUSINESS_UNIT_WEIGHTS[applied.businessUnit];
  if (bu) delta += bu.utilDelta;
  const alloc = ALLOCATION_WEIGHTS[applied.allocation];
  if (alloc) delta += alloc.utilDelta;
  const practice = PRACTICE_WEIGHTS[applied.practice];
  if (practice) delta += practice.utilDelta;
  const geo = GEOGRAPHY_WEIGHTS[applied.geography];
  if (geo) delta += geo.utilDelta;
  const grade = GRADE_WEIGHTS[applied.grade];
  if (grade) delta += grade.utilDelta;
  return delta;
}

// Overview's original static figures — the exact numbers shown when
// every filter is at its default ("All ..."). Every widget derives from
// these plus the factor/delta above, so clearing all filters always
// reproduces the original numbers exactly.
export const BASE = {
  totalWorkforce: 48620,
  billableUtilization: 82.6,
  availableCapacity: 2840,
  partiallyAllocated: 6420,
  recoverableFTE: 3180,
  bench: 1126,
  demandCoverage: 91,
  atRiskSkills: 37,
  utilizationGainPct: 3.5,
  benchReductionFTE: 216,
  costAvoidanceM: 2.8,
  employeesAvailableSoon: 146,
  redistributeResources: 18,
  javaShortfallPct: 18,
  naUtilizationGapPct: 6.4,
  dataEngGapFTE: 180,
};

// Same as getFactor/getUtilDelta but omitting Business Unit's own
// contribution — for UtilizationPerformanceCard, which already selects
// down to one exact BU row (or all of them) rather than scaling by BU
// share, so applying the BU factor again on top would double-count it.
export function getFactorExcludingBU(applied) {
  return getFactor({ ...applied, businessUnit: 'All Business Units' });
}
export function getUtilDeltaExcludingBU(applied) {
  return getUtilDelta({ ...applied, businessUnit: 'All Business Units' });
}

export function fmtNum(n) {
  return Math.round(n).toLocaleString('en-US');
}

export function fmtPct(n, digits = 1) {
  return `${n.toFixed(digits)}%`;
}
