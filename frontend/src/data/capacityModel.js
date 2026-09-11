// Capacity & Utilization calculation model — single source of truth for
// the "Partial Allocation" screen's summary cards, Allocation
// Distribution chart, Recoverable Capacity table and the employee table.
// Everything here works in HOURS, on a real day-by-day calendar (not a
// weekly-rate approximation), so mid-period joins/releases, leave, and
// over-allocation are all correct at the date level rather than being
// smoothed away by an average.
//
// No live workforce-calendar/timesheet backend exists for this screen
// (checked workforce-schema.sql — no leave/commitment/actuals tables),
// so the employee records below are new, internally consistent fixture
// data (this app's established "assume necessary data" convention), but
// every number on the page is now DERIVED from them through this shared
// model instead of being a separately hardcoded, unreconciled figure —
// see the reconciliation note at the bottom of this file for why the
// screen's old headline numbers (6,420 / 62% / 3,180 FTE) are gone.

import { REQUIREMENTS, getRequirementCoverage } from './staffingModel';
import useStaffingPlanStore from '../stores/staffingPlanStore';
import { REAL_BUSINESS_UNITS } from './businessUnits';

export const TODAY = '2026-09-08';

// The configured reference capacity used ONLY for FTE conversion — never
// an employee's own weekly hours. A part-time employee's 50% availability
// is not 0.5 FTE; it's (their available hours) ÷ (this standard), which
// is smaller than their own-capacity percentage would suggest.
export const STANDARD_FTE_WEEKLY_HOURS = 40;

// ---------------------------------------------------------------------
// Date helpers (day-by-day, not weekly-rate) — working days are Mon–Fri.
// ---------------------------------------------------------------------
function toDate(d) {
  return d instanceof Date ? d : new Date(`${d}T00:00:00`);
}
// Format back to YYYY-MM-DD using LOCAL date parts — toISOString() would
// convert to UTC first, which silently rolls the date backward (or
// forward) whenever the host timezone isn't UTC (e.g. IST, UTC+5:30:
// local midnight Sep 9 is still Sep 8 in UTC), making every "+1 day"
// step a no-op in that timezone and hanging any day-by-day loop.
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(dateISO, n) {
  const d = toDate(dateISO);
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}
function isWorkingDay(dateISO) {
  const day = toDate(dateISO).getDay();
  return day >= 1 && day <= 5;
}
function eachDay(period) {
  const days = [];
  let cur = period.start;
  while (toDate(cur) <= toDate(period.end)) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}
function inRange(dateISO, startISO, endISO) {
  return toDate(dateISO) >= toDate(startISO) && toDate(dateISO) <= toDate(endISO);
}
function periodWeeks(period) {
  return eachDay(period).length / 7; // calendar days / 7, matches how capacity is prorated below
}

// Default reporting periods (spec: staffing planning = next 30 days;
// actual utilization = last 4 completed weeks). Both are plain {start,
// end} objects the UI can override with its own date controls.
export function getDefaultStaffingPeriod(today = TODAY) {
  return { start: today, end: addDays(today, 30) };
}
export function getDefaultActualPeriod(today = TODAY) {
  // Most recent completed Sunday before today, and the 27 days before
  // that — a clean trailing 4-week (28-day) window of completed weeks.
  const d = toDate(today);
  const back = (d.getDay() + 7) % 7 || 7; // days back to the last completed Sunday
  const end = addDays(today, -back);
  const start = addDays(end, -27);
  return { start, end };
}

// ---------------------------------------------------------------------
// Employee fixture — hours-based, day-level commitments. Deliberately a
// small, hand-checkable cohort (not a literal 6,420 rows) rather than
// fabricating an organization-wide row count with no data behind it —
// see the reconciliation note at the bottom.
// ---------------------------------------------------------------------
export const EMPLOYEES = [
  {
    id: 'priya-sharma', name: 'Priya Sharma', initials: 'PS', role: 'Senior Java Engineer', unit: REAL_BUSINESS_UNITS[7], location: 'Pune',
    weeklyCapacityHours: 40, skills: ['Java', 'AWS'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Atlas', hoursPerWeek: 24, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' }],
    leave: [], actualBillableHours: 130,
  },
  {
    id: 'rahul-mehta', name: 'Rahul Mehta', initials: 'RM', role: 'Lead Data Engineer', unit: REAL_BUSINESS_UNITS[6], location: 'Bangalore',
    weeklyCapacityHours: 40, skills: ['Python', 'Spark', 'Data Engineering'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Orion', hoursPerWeek: 20, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' }],
    leave: [], actualBillableHours: 122, earliestReleaseDate: '2026-09-18', // 10 business-day contractual notice
  },
  {
    id: 'sneha-kulkarni', name: 'Sneha Kulkarni', initials: 'SK', role: 'UX Designer', unit: REAL_BUSINESS_UNITS[7], location: 'Pune',
    weeklyCapacityHours: 40, skills: ['UX', 'Figma'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Nova', hoursPerWeek: 28, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' }],
    leave: [], actualBillableHours: 126,
  },
  {
    // Part-time employee — demonstrates FTE ≠ own-capacity %.
    id: 'vikram-rao', name: 'Vikram Rao', initials: 'VR', role: 'DevOps Engineer', unit: REAL_BUSINESS_UNITS[0], location: 'Pune',
    weeklyCapacityHours: 20, skills: ['Kubernetes', 'Terraform', 'DevOps'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Horizon', hoursPerWeek: 9, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' }],
    leave: [], actualBillableHours: 58,
  },
  {
    id: 'neha-kapoor', name: 'Neha Kapoor', initials: 'NK', role: 'Business Analyst', unit: REAL_BUSINESS_UNITS[0], location: 'Pune',
    weeklyCapacityHours: 40, skills: ['BA', 'SQL'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Nexus', hoursPerWeek: 26, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' }],
    leave: [], actualBillableHours: 134,
  },
  {
    id: 'arjun-nair', name: 'Arjun Nair', initials: 'AN', role: 'Cloud Architect', unit: REAL_BUSINESS_UNITS[5], location: 'Bangalore',
    weeklyCapacityHours: 40, skills: ['AWS', 'Azure'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Titan', hoursPerWeek: 16, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' }],
    leave: [], actualBillableHours: 109,
  },
  {
    // Missing timesheet — actual utilization must show N/A, not 0%.
    id: 'rohan-shah', name: 'Rohan Shah', initials: 'RS', role: 'ML Engineer', unit: REAL_BUSINESS_UNITS[1], location: 'Hyderabad',
    weeklyCapacityHours: 40, skills: ['Python', 'TensorFlow'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Quantum', hoursPerWeek: 22, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' }],
    leave: [], actualBillableHours: null,
  },
  {
    // Two commitments (one project, one internal) — must sum once each,
    // never double-count the same hours.
    id: 'ankit-desai', name: 'Ankit Desai', initials: 'AD', role: 'Java Tech Lead', unit: REAL_BUSINESS_UNITS[3], location: 'Pune',
    weeklyCapacityHours: 40, skills: ['Java', 'Spring Boot'],
    commitments: [
      { id: 'c1', type: 'project', name: 'Project Atlas', hoursPerWeek: 16, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' },
      { id: 'c2', type: 'internal', name: 'Internal — Mentoring Program', hoursPerWeek: 8, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' },
    ],
    leave: [], actualBillableHours: 133,
  },
  {
    // Approved leave overlapping the actual-utilization period — work
    // capacity for that period must be reduced by the calendar, not
    // double-subtracted anywhere else.
    id: 'kavita-menon', name: 'Kavita Menon', initials: 'KM', role: 'QA Engineer', unit: REAL_BUSINESS_UNITS[2], location: 'Chennai',
    weeklyCapacityHours: 40, skills: ['Selenium', 'QA'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Velocity', hoursPerWeek: 20, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' }],
    leave: [{ start: '2026-08-17', end: '2026-08-21' }], actualBillableHours: 90,
  },
  {
    // Mid-period release — commitment ends 15 Sep; capacity must only
    // become available from that date, not the whole planning period.
    id: 'suresh-iyer', name: 'Suresh Iyer', initials: 'SI', role: 'Business Analyst', unit: REAL_BUSINESS_UNITS[1], location: 'Mumbai',
    weeklyCapacityHours: 40, skills: ['BA', 'SQL'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Atlas', hoursPerWeek: 30, startDate: '2026-07-01', endDate: '2026-09-15', status: 'confirmed' }],
    leave: [], actualBillableHours: 128,
  },
  {
    // Over-allocated — two confirmed commitments together exceed
    // capacity on overlapping days; must be flagged, not averaged away.
    id: 'meera-nath', name: 'Meera Nath', initials: 'MN', role: 'DevOps Engineer', unit: REAL_BUSINESS_UNITS[7], location: 'Pune',
    weeklyCapacityHours: 40, skills: ['DevOps', 'Kubernetes'],
    commitments: [
      { id: 'c1', type: 'project', name: 'Project Nexus', hoursPerWeek: 24, startDate: '2026-08-01', endDate: '2027-03-31', status: 'confirmed' },
      { id: 'c2', type: 'project', name: 'Project Titan', hoursPerWeek: 20, startDate: '2026-08-15', endDate: '2027-03-31', status: 'confirmed' },
    ],
    leave: [], actualBillableHours: 176,
  },
  {
    // Zero capacity for the whole period (long leave) — every
    // percentage must read N/A, never divide by zero.
    id: 'farhan-ali', name: 'Farhan Ali', initials: 'FA', role: 'Business Analyst', unit: REAL_BUSINESS_UNITS[4], location: 'Pune',
    weeklyCapacityHours: 40, skills: ['BA'],
    commitments: [], leave: [{ start: '2026-08-25', end: '2026-10-10' }], actualBillableHours: null,
  },
  {
    // A draft (not confirmed) allocation — must not count toward
    // "planned allocation" or reduce "available for staffing".
    id: 'aditi-rao', name: 'Aditi Rao', initials: 'AR', role: 'Business Analyst', unit: REAL_BUSINESS_UNITS[6], location: 'Bangalore',
    weeklyCapacityHours: 40, skills: ['BA', 'SQL'],
    commitments: [{ id: 'c1', type: 'project', name: 'Project Orion', hoursPerWeek: 16, startDate: '2026-09-05', endDate: '2027-03-31', status: 'draft' }],
    leave: [], actualBillableHours: 40,
  },
];

// ---------------------------------------------------------------------
// Day-level capacity/commitment engine
// ---------------------------------------------------------------------
function isOnLeave(employee, dateISO) {
  return employee.leave.some((l) => inRange(dateISO, l.start, l.end));
}

// Confirmed-only by default — draft allocations never reduce capacity
// or count as "planned", per spec ("keep draft allocations distinct
// from confirmed bookings").
function activeCommitments(employee, dateISO, { includeDraft = false } = {}) {
  return employee.commitments.filter(
    (c) => (includeDraft || c.status === 'confirmed') && inRange(dateISO, c.startDate, c.endDate)
  );
}

// Work capacity: hours from the calendar after holidays/leave. Weekends
// contribute 0 (not a holiday exclusion — just not working days), and
// leave days contribute 0 — each day's capacity is counted exactly once.
export function getWorkCapacityHours(employee, period) {
  return eachDay(period).reduce((sum, day) => {
    if (!isWorkingDay(day)) return sum;
    if (isOnLeave(employee, day)) return sum;
    return sum + employee.weeklyCapacityHours / 5;
  }, 0);
}

// Confirmed booked hours across all commitments (project + protected
// internal), summed once per commitment per day — never double-counted
// even when an employee holds two commitments at once (over-allocation
// is preserved and flagged, not clipped).
export function getConfirmedCommitmentHours(employee, period) {
  return eachDay(period).reduce((sum, day) => {
    if (!isWorkingDay(day)) return sum;
    const commitments = activeCommitments(employee, day);
    const dayHours = commitments.reduce((s, c) => s + c.hoursPerWeek / 5, 0);
    return sum + dayHours;
  }, 0);
}

// True if on any working day, confirmed committed hours exceed that
// day's own capacity — flagged at the date level so a period AVERAGE
// can't hide a real scheduling conflict.
export function isOverAllocatedAnyDay(employee, period) {
  return eachDay(period).some((day) => {
    if (!isWorkingDay(day)) return false;
    const dailyCapacity = isOnLeave(employee, day) ? 0 : employee.weeklyCapacityHours / 5;
    const dailyCommitted = activeCommitments(employee, day).reduce((s, c) => s + c.hoursPerWeek / 5, 0);
    return dailyCapacity > 0 && dailyCommitted > dailyCapacity;
  });
}

export function getPlannedAllocation(employee, period) {
  const workCapacityHours = getWorkCapacityHours(employee, period);
  const bookedHours = getConfirmedCommitmentHours(employee, period);
  const pct = workCapacityHours > 0 ? (bookedHours / workCapacityHours) * 100 : null;
  return { workCapacityHours, bookedHours, pct, overAllocated: isOverAllocatedAnyDay(employee, period) };
}

// Available capacity: remaining hours after existing (confirmed) commitments.
export function getAvailability(employee, period) {
  const { workCapacityHours, bookedHours } = getPlannedAllocation(employee, period);
  const availableHours = Math.max(0, workCapacityHours - bookedHours);
  const pct = workCapacityHours > 0 ? (availableHours / workCapacityHours) * 100 : null;
  const weeks = periodWeeks(period);
  const fte = weeks > 0 ? availableHours / (STANDARD_FTE_WEEKLY_HOURS * weeks) : 0;
  return { availableHours, pct, fte, workCapacityHours };
}

// Recoverable capacity: available hours eligible for reassignment —
// restricted to on/after the employee's earliest release date (a known
// staffing restriction, e.g. contractual notice), which available
// capacity itself doesn't apply.
export function getRecoverability(employee, period) {
  const effectiveStart = employee.earliestReleaseDate && toDate(employee.earliestReleaseDate) > toDate(period.start)
    ? employee.earliestReleaseDate
    : period.start;
  if (toDate(effectiveStart) > toDate(period.end)) {
    return { recoverableHours: 0, fte: 0, effectiveFrom: effectiveStart };
  }
  const restrictedPeriod = { start: effectiveStart, end: period.end };
  const { availableHours } = getAvailability(employee, restrictedPeriod);
  const weeks = periodWeeks(period); // denominator stays the full requested period, for a consistent basis across employees
  const fte = weeks > 0 ? availableHours / (STANDARD_FTE_WEEKLY_HOURS * weeks) : 0;
  return { recoverableHours: availableHours, fte, effectiveFrom: effectiveStart };
}

// The first date on/after the period start when the employee has any
// available hours — 'Immediate' if already true today.
export function getAvailableFromDate(employee, period) {
  for (const day of eachDay(period)) {
    if (!isWorkingDay(day)) continue;
    const dailyCapacity = isOnLeave(employee, day) ? 0 : employee.weeklyCapacityHours / 5;
    const dailyCommitted = activeCommitments(employee, day).reduce((s, c) => s + c.hoursPerWeek / 5, 0);
    if (dailyCapacity > dailyCommitted) return day === period.start ? 'Immediate' : day;
  }
  return null; // fully committed for the whole period
}

// Actual billable utilization — a fixed reading for the app's one
// default actual-period snapshot (no real time-series backend exists to
// recompute this for an arbitrary custom period). Distinguishes a
// missing timesheet (null) from a verified zero.
export function getActualUtilization(employee, actualPeriod) {
  const workCapacityHours = getWorkCapacityHours(employee, actualPeriod);
  if (workCapacityHours <= 0) return { pct: null, reason: 'zero-capacity', workCapacityHours, billableHours: employee.actualBillableHours };
  if (employee.actualBillableHours == null) return { pct: null, reason: 'missing-timesheet', workCapacityHours, billableHours: null };
  const pct = (employee.actualBillableHours / workCapacityHours) * 100;
  return { pct, reason: null, workCapacityHours, billableHours: employee.actualBillableHours, overAllocated: pct > 100 };
}

// ---------------------------------------------------------------------
// Cohort / summary-card calculations — every card below is derived from
// the SAME per-employee functions above, over the same filtered records.
// ---------------------------------------------------------------------
export function getPartiallyAllocatedCohort(employees, period) {
  return employees
    .map((e) => ({ employee: e, allocation: getPlannedAllocation(e, period) }))
    .filter(({ allocation }) => allocation.pct != null && allocation.pct > 0 && allocation.pct < 100);
}

// Capacity-weighted average: total booked hours ÷ total work capacity —
// NOT an average of each employee's own percentage.
export function getAverageAllocationPct(cohort) {
  const totalCapacity = cohort.reduce((s, c) => s + c.allocation.workCapacityHours, 0);
  const totalBooked = cohort.reduce((s, c) => s + c.allocation.bookedHours, 0);
  return totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : null;
}

export function getBelow50Cohort(cohort) {
  return cohort.filter(({ allocation }) => allocation.pct < 50);
}

export function getRecoverableCapacityFTE(employees, period) {
  return employees.reduce((sum, e) => sum + getRecoverability(e, period).fte, 0);
}

// Distinct employees whose recoverable capacity INCREASES within the
// window because one or more confirmed commitments end inside it — with
// the effective date and the additional hours/week unlocked, for
// drill-down. A commitment ending doesn't count if the employee is on
// leave through the rest of the period (no capacity to actually free).
export function getBecomingAvailable(employees, period, windowDays = 30) {
  const windowEnd = addDays(period.start, windowDays);
  const results = [];
  employees.forEach((e) => {
    const endingCommitments = e.commitments.filter(
      (c) => c.status === 'confirmed' && inRange(c.endDate, period.start, windowEnd)
    );
    if (endingCommitments.length === 0) return;
    const effectiveDate = addDays(endingCommitments.map((c) => c.endDate).sort()[0], 1);
    if (toDate(effectiveDate) > toDate(period.end)) return;
    if (isOnLeave(e, effectiveDate)) return;
    const additionalHoursPerWeek = endingCommitments.reduce((s, c) => s + c.hoursPerWeek, 0);
    results.push({ employee: e, effectiveDate, additionalHoursPerWeek });
  });
  return results;
}

// Potential billable utilization gain: additional expected billable
// hours from a FEASIBLE staffing scenario (capped by both recoverable
// supply here AND real open demand — Project Phoenix's own remaining
// requirement gaps, data/staffingModel.js) ÷ total capacity of this
// workforce and period. Returns null ("Not calculated") when there's no
// feasible scenario (no recoverable supply or no open demand) rather
// than inventing a number.
export function getPotentialUtilizationGainPP(employees, period) {
  const totalCapacity = employees.reduce((s, e) => s + getWorkCapacityHours(e, period), 0);
  const totalBooked = employees.reduce((s, e) => s + getConfirmedCommitmentHours(e, period), 0);
  if (totalCapacity <= 0) return null;

  // "Feasible" requires actual matched demand, not just raw hour totals
  // from an unrelated-scale project — only an employee whose skills
  // match a still-open Project Phoenix requirement contributes, and
  // only up to that specific requirement's own remaining gap (same
  // per-requirement capping staffingModel.js's getPotentialCapacity
  // uses). Without this, redeploying this cohort's recoverable hours
  // against a much larger, unrelated project's total gap produces an
  // unrealistically large swing that ignores whether anyone here can
  // actually do that work.
  const draftAllocations = useStaffingPlanStore.getState().draftAllocations;
  const weeks = periodWeeks(period);
  const remainingGapHours = {};
  REQUIREMENTS.forEach((r) => {
    remainingGapHours[r.id] = getRequirementCoverage(r, draftAllocations).remainingGap * STANDARD_FTE_WEEKLY_HOURS * weeks;
  });

  let feasibleAdditionalHours = 0;
  employees.forEach((e) => {
    const recoverableHours = getRecoverability(e, period).recoverableHours;
    if (recoverableHours <= 0) return;
    const matched = REQUIREMENTS.find((r) => remainingGapHours[r.id] > 0 && e.skills.includes(r.skill));
    if (!matched) return;
    const applied = Math.min(recoverableHours, remainingGapHours[matched.id]);
    feasibleAdditionalHours += applied;
    remainingGapHours[matched.id] -= applied;
  });
  if (feasibleAdditionalHours <= 0) return null;

  const currentPct = (totalBooked / totalCapacity) * 100;
  const projectedPct = ((totalBooked + feasibleAdditionalHours) / totalCapacity) * 100;
  return { currentPct, projectedPct, gainPP: projectedPct - currentPct, feasibleAdditionalHours };
}

// ---------------------------------------------------------------------
// Reconciliation note (spec section 6)
// ---------------------------------------------------------------------
// The screen previously showed "6,420 Partially Allocated", "62% Avg
// Allocation" and "3,180 FTE Recoverable" as three independently
// hardcoded numbers with no employee records behind them at all — so
// there was nothing to actually reconcile them against; they simply
// didn't correspond to any underlying data. Per the fixture arithmetic
// in the request (6,420 × (1 − 0.62) = 2,439.6 FTE unallocated at 1
// FTE/employee), that specific figure is a property of THAT invented
// example, not a value this screen can derive — this app has no live
// HRIS/timesheet integration to source a real 6,420-person cohort from
// (checked workforce-schema.sql; no leave/commitment/actuals tables
// exist). Rather than hardcode either the old numbers or the request's
// example arithmetic to make them "match", every card, chart and table
// row on this screen is now computed from the EMPLOYEES fixture above
// through the shared functions in this file — a small (13-person),
// hand-checkable cohort where every number is traceable and internally
// consistent, clearly labeled as a sample rather than an organization-
// wide rollup. Wiring a real ~6,420-person dataset in later only means
// swapping the EMPLOYEES fixture for an API response of the same shape
// — none of the math above changes.
