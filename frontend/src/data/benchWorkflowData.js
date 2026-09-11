// Bench Management "Find Role" / "AI Match" workflow — shared demo data
// and matching engine, per bench-management-workflow.md (8 Sep 2026).
//
// Explicitly a prototype/demo per that spec: no live calendars, holidays,
// server concurrency, org permissions or notifications. A fixed 40-hour
// Mon–Fri work week is an explicit demo assumption, matching the
// standard used elsewhere in this app (data/capacityModel.js). All
// booking state lives client-side for this session — see
// stores/benchWorkflowStore.js.
export const AS_OF_DATE = '2026-09-08';
export const PLANNING_WINDOW = { start: '2026-09-15', end: '2026-10-31' };
export const STANDARD_WEEKLY_HOURS = 40;

// The two demonstration open roles. Role demand is shared across
// employees — every confirmed booking reduces what's left, for its own
// dates only.
export const ROLES = [
  {
    id: 'role-phoenix-java', project: 'Project Phoenix', role: 'Java Engineer',
    requiredSkills: ['Java', 'AWS'], preferredSkills: [],
    demandPercent: 100, startDate: '2026-09-15', endDate: '2026-12-31',
    partialFulfillment: true, minContributionPercent: 10,
  },
  {
    id: 'role-meridian-java', project: 'Project Meridian', role: 'Java Developer',
    requiredSkills: ['Java'], preferredSkills: ['AWS'],
    demandPercent: 40, startDate: '2026-09-08', endDate: '2026-10-31',
    partialFulfillment: true, minContributionPercent: 10,
  },
];

// ---------------------------------------------------------------------
// Date helpers — local-date formatting, not toISOString(). That was a
// real bug found and fixed in capacityModel.js: toISOString() converts
// to UTC first, which silently rolls the date backward in any timezone
// ahead of UTC (e.g. IST), turning every "+1 day" step into a no-op and
// hanging a day-by-day loop. Same fix applied here from the start.
// ---------------------------------------------------------------------
function toDate(d) {
  return d instanceof Date ? d : new Date(`${d}T00:00:00`);
}
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function addDays(dateISO, n) {
  const d = toDate(dateISO);
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}
export function isBefore(a, b) { return toDate(a) < toDate(b); }
export function isAfter(a, b) { return toDate(a) > toDate(b); }
function inRange(dateISO, startISO, endISO) {
  return toDate(dateISO) >= toDate(startISO) && toDate(dateISO) <= toDate(endISO);
}
function isWorkingDay(dateISO) {
  const day = toDate(dateISO).getDay();
  return day >= 1 && day <= 5;
}
function eachDay(startISO, endISO) {
  const days = [];
  let cur = startISO;
  while (!isAfter(cur, endISO)) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

// ---------------------------------------------------------------------
// Booking status — computed from dates relative to the as-of date, never
// stored, so it can't drift out of sync.
// ---------------------------------------------------------------------
export function getBookingStatus(booking, asOf = AS_OF_DATE) {
  if (isAfter(booking.startDate, asOf)) return 'Scheduled';
  if (isAfter(asOf, booking.endDate)) return 'Ended';
  return 'Active';
}

// A booking only actually occupies capacity / role demand while it's
// Scheduled or Active — an Ended booking releases its capacity.
function isOccupying(booking, asOf = AS_OF_DATE) {
  const status = getBookingStatus(booking, asOf);
  return status === 'Scheduled' || status === 'Active';
}

// ---------------------------------------------------------------------
// Per-employee capacity, combining existing (protected) commitments with
// confirmed bench-workflow bookings — summed once each, never
// double-counted, and never overwriting an existing commitment.
// ---------------------------------------------------------------------
export function getEmployeeCommittedPercentOnDate(employee, dateISO, bookings) {
  if (!isWorkingDay(dateISO)) return 0;
  const fromCommitments = (employee.commitments || [])
    .filter((c) => c.status === 'confirmed' && inRange(dateISO, c.startDate, c.endDate))
    .reduce((sum, c) => sum + (c.hoursPerWeek / STANDARD_WEEKLY_HOURS) * 100, 0);
  const fromBookings = bookings
    .filter((b) => b.employeeId === employee.id && isOccupying(b) && inRange(dateISO, b.startDate, b.endDate))
    .reduce((sum, b) => sum + b.percent, 0);
  return fromCommitments + fromBookings;
}

// First date on/after AS_OF_DATE when the employee has any spare
// capacity — 'Immediate' if already true today, null if fully committed
// through the whole planning window.
export function getEmployeeAvailableFrom(employee, bookings, horizonDays = 120) {
  for (let i = 0; i <= horizonDays; i += 1) {
    const day = addDays(AS_OF_DATE, i);
    if (!isWorkingDay(day)) continue;
    if (getEmployeeCommittedPercentOnDate(employee, day, bookings) < 100) {
      return i === 0 ? 'Immediate' : day;
    }
  }
  return null;
}

export function getEmployeeRemainingCapacityPercent(employee, dateISO, bookings) {
  return Math.max(0, 100 - getEmployeeCommittedPercentOnDate(employee, dateISO, bookings));
}

// ---------------------------------------------------------------------
// Role demand — how much of a role is still open, on a given date,
// across every employee already booked into it.
// ---------------------------------------------------------------------
export function getRoleBookedPercentOnDate(role, dateISO, bookings, excludeBookingId = null) {
  return bookings
    .filter((b) => b.roleId === role.id && b.id !== excludeBookingId && isOccupying(b) && inRange(dateISO, b.startDate, b.endDate))
    .reduce((sum, b) => sum + b.percent, 0);
}
export function getRoleRemainingDemand(role, bookings, dateISO = role.startDate) {
  return Math.max(0, role.demandPercent - getRoleBookedPercentOnDate(role, dateISO, bookings));
}

// ---------------------------------------------------------------------
// Matching — required skills must ALL be present (no silent relaxation);
// preferred skills only influence ranking. Explicit skill-overlap +
// date-compatibility rules — not a live AI model, and not a claim that
// these illustrative matches are verified staffing recommendations.
// ---------------------------------------------------------------------
export function matchRole(employee, role, bookings) {
  const missingRequiredSkills = role.requiredSkills.filter((s) => !employee.skills.includes(s));
  const matchedPreferredSkills = role.preferredSkills.filter((s) => employee.skills.includes(s));
  const availableFrom = getEmployeeAvailableFrom(employee, bookings);
  const dateCompatible = availableFrom != null && !isAfter(availableFrom === 'Immediate' ? AS_OF_DATE : availableFrom, role.endDate);
  const remainingDemand = getRoleRemainingDemand(role, bookings);
  const eligible = missingRequiredSkills.length === 0 && dateCompatible && remainingDemand > 0;
  return { eligible, missingRequiredSkills, matchedPreferredSkills, dateCompatible, availableFrom, remainingDemand };
}

export function getEligibleRoles(employee, bookings) {
  return ROLES
    .map((role) => ({ role, match: matchRole(employee, role, bookings) }))
    .filter((x) => x.match.eligible);
}

// Deterministic score: required-skill match is the qualifying gate
// (already filtered above), preferred-skill matches and role priority
// (implicit via demand size here — a bigger open demand ranks slightly
// higher) break ties. Explained per-recommendation, not a black box.
function scoreEligible({ role, match }) {
  let score = role.requiredSkills.length * 40;
  score += match.matchedPreferredSkills.length * 15;
  score += Math.round(role.demandPercent / 10);
  const reasons = [
    `Matches required skill${role.requiredSkills.length === 1 ? '' : 's'}: ${role.requiredSkills.join(', ')}`,
  ];
  if (match.matchedPreferredSkills.length > 0) reasons.push(`Also has preferred skill: ${match.matchedPreferredSkills.join(', ')}`);
  reasons.push(match.availableFrom === 'Immediate' ? 'Available immediately for this role\'s dates' : `Available from ${match.availableFrom}, within the role's window`);
  reasons.push(`${match.remainingDemand}% of this role is still open`);
  return { role, match, score, reasons };
}

export function getRankedRecommendations(employee, bookings, limit = 2) {
  return getEligibleRoles(employee, bookings)
    .map(scoreEligible)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// A sensible default allocation for a freshly-selected role: the
// smaller of the employee's own spare capacity and the role's own
// remaining demand (never propose more than either side can support).
export function getDefaultAllocation(employee, role, bookings) {
  const availableFrom = getEmployeeAvailableFrom(employee, bookings);
  const startDate = availableFrom === 'Immediate' || availableFrom == null
    ? role.startDate
    : (isAfter(availableFrom, role.startDate) ? availableFrom : role.startDate);
  const endDate = role.endDate;
  const employeeSpare = getEmployeeRemainingCapacityPercent(employee, startDate, bookings);
  const roleRemaining = getRoleRemainingDemand(role, bookings, startDate);
  const percent = Math.max(role.minContributionPercent, Math.min(employeeSpare, roleRemaining));
  return { startDate, endDate, percent: Math.min(100, Math.round(percent)) };
}

// ---------------------------------------------------------------------
// "Allocation by date" — breaks the planning horizon into intervals at
// every point something changes (an existing commitment or a proposed
// booking starting/ending), and reports existing / proposed / total /
// remaining capacity for each. This is what lets Priya's Atlas 60% keep
// showing correctly alongside a Phoenix booking that ends earlier.
// ---------------------------------------------------------------------
export function computeIntervals(employee, proposedRows, bookings) {
  const breakpoints = new Set();
  (employee.commitments || []).forEach((c) => { breakpoints.add(c.startDate); breakpoints.add(addDays(c.endDate, 1)); });
  bookings.filter((b) => b.employeeId === employee.id).forEach((b) => { breakpoints.add(b.startDate); breakpoints.add(addDays(b.endDate, 1)); });
  proposedRows.forEach((r) => { if (r.startDate) breakpoints.add(r.startDate); if (r.endDate) breakpoints.add(addDays(r.endDate, 1)); });

  const horizonStart = AS_OF_DATE;
  const horizonEnd = proposedRows.reduce((max, r) => (r.endDate && isAfter(r.endDate, max) ? r.endDate : max), PLANNING_WINDOW.end);
  breakpoints.add(horizonStart);
  breakpoints.add(addDays(horizonEnd, 1));

  const sorted = [...breakpoints].filter((d) => !isAfter(d, addDays(horizonEnd, 1)) && !isBefore(d, horizonStart)).sort();
  const intervals = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const start = sorted[i];
    const end = addDays(sorted[i + 1], -1);
    if (isAfter(start, end)) continue;
    const existingPct = (employee.commitments || [])
      .filter((c) => c.status === 'confirmed' && inRange(start, c.startDate, c.endDate))
      .reduce((s, c) => s + (c.hoursPerWeek / STANDARD_WEEKLY_HOURS) * 100, 0)
      + bookings.filter((b) => b.employeeId === employee.id && isOccupying(b) && inRange(start, b.startDate, b.endDate))
        .reduce((s, b) => s + b.percent, 0);
    const proposedPct = proposedRows
      .filter((r) => r.startDate && r.endDate && inRange(start, r.startDate, r.endDate))
      .reduce((s, r) => s + (Number(r.percent) || 0), 0);
    intervals.push({ start, end, existingPct, proposedPct, totalPct: existingPct + proposedPct, remainingPct: 100 - existingPct - proposedPct });
  }
  return intervals;
}

// Validates a set of proposed rows for one employee against existing
// commitments, other confirmed bookings, role windows and role demand.
// Returns a list of {type, message} — empty = valid.
export function validateProposal(employee, proposedRows, bookings) {
  const errors = [];

  proposedRows.forEach((row) => {
    const role = ROLES.find((r) => r.id === row.roleId);
    if (!role) return;
    if (!row.startDate || !row.endDate) {
      errors.push({ type: 'dates', message: `${role.role}: start and end dates are required.` });
      return;
    }
    if (isAfter(row.startDate, row.endDate)) {
      errors.push({ type: 'dates', message: `${role.role}: start date is after end date.` });
    }
    if (isBefore(row.startDate, role.startDate) || isAfter(row.endDate, role.endDate)) {
      errors.push({ type: 'window', message: `${role.role} only runs ${role.startDate} → ${role.endDate}. Adjust the proposed dates to fit that window.` });
    }
    const availableFrom = getEmployeeAvailableFrom(employee, bookings);
    if (availableFrom && availableFrom !== 'Immediate' && isBefore(row.startDate, availableFrom)) {
      errors.push({ type: 'availability', message: `${role.role}: not eligible to start before ${availableFrom}.` });
    }
    const remaining = getRoleRemainingDemand(role, bookings, row.startDate);
    if ((Number(row.percent) || 0) > remaining) {
      errors.push({ type: 'demand', message: `${role.role} only has ${remaining}% vacancy remaining from ${row.startDate} — reduce the allocation or choose another role.` });
    }
    if ((Number(row.percent) || 0) < role.minContributionPercent) {
      errors.push({ type: 'minimum', message: `${role.role}: minimum contribution for partial fulfillment is ${role.minContributionPercent}%.` });
    }
  });

  const intervals = computeIntervals(employee, proposedRows, bookings);
  intervals.forEach((iv) => {
    if (iv.totalPct > 100.001) {
      errors.push({ type: 'overallocation', message: `${iv.start} → ${iv.end}: total allocation would be ${Math.round(iv.totalPct)}% — reduce or reschedule a proposed role.` });
    }
  });

  return errors;
}
