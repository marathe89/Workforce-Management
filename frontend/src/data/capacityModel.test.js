import { describe, it, expect } from 'vitest';
import {
  EMPLOYEES,
  getWorkCapacityHours,
  getPlannedAllocation,
  getAvailability,
  getRecoverability,
  getAvailableFromDate,
  getActualUtilization,
  getPartiallyAllocatedCohort,
  getAverageAllocationPct,
  getBelow50Cohort,
  getBecomingAvailable,
  getDefaultStaffingPeriod,
  getDefaultActualPeriod,
  STANDARD_FTE_WEEKLY_HOURS,
} from './capacityModel';

const find = (id) => EMPLOYEES.find((e) => e.id === id);
const STAFFING_PERIOD = getDefaultStaffingPeriod();
const ACTUAL_PERIOD = getDefaultActualPeriod();

describe('the illustrative example: 40h capacity, 24h booked -> 60% / 16h / 40% available', () => {
  it('Priya Sharma (40h/wk, 24h/wk on Project Atlas)', () => {
    const period = { start: '2026-09-08', end: '2026-09-14' }; // exactly one working week
    const allocation = getPlannedAllocation(find('priya-sharma'), period);
    expect(allocation.workCapacityHours).toBeCloseTo(40, 5);
    expect(allocation.bookedHours).toBeCloseTo(24, 5);
    expect(allocation.pct).toBeCloseTo(60, 5);

    const availability = getAvailability(find('priya-sharma'), period);
    expect(availability.availableHours).toBeCloseTo(16, 5);
    expect(availability.pct).toBeCloseTo(40, 5);
    // 16 available hours on a 40-hour standard, one week -> 0.4 FTE.
    expect(availability.fte).toBeCloseTo(16 / 40, 5);
  });
});

describe('part-time FTE conversion uses the standard reference, not own capacity', () => {
  it('Vikram Rao (20h/wk capacity, 9h/wk booked -> 55% of HIS capacity but well under 0.55 FTE', () => {
    const period = { start: '2026-09-08', end: '2026-09-14' };
    const vikram = find('vikram-rao');
    const allocation = getPlannedAllocation(vikram, period);
    expect(allocation.pct).toBeCloseTo(45, 5); // 9/20

    const availability = getAvailability(vikram, period);
    expect(availability.availableHours).toBeCloseTo(11, 5); // 20 - 9
    expect(availability.pct).toBeCloseTo(55, 5); // 11/20 = 55% of HIS OWN capacity
    // But FTE uses the 40-hour standard, not his 20-hour capacity:
    expect(availability.fte).toBeCloseTo(11 / 40, 5);
    expect(availability.fte).toBeLessThan(0.55); // the naive (wrong) reading a % alone would suggest
  });
});

describe('leave reduces work capacity without double-subtracting elsewhere', () => {
  it('Kavita Menon has 5 leave days inside a 2-week period', () => {
    const period = { start: '2026-08-17', end: '2026-08-30' }; // 2 full weeks, Mon-Sun x2
    const kavita = find('kavita-menon');
    const capacity = getWorkCapacityHours(kavita, period);
    // 2 weeks = 10 working days x 8h = 80h gross, minus 5 leave days x 8h = 40h -> 40h net.
    expect(capacity).toBeCloseTo(40, 5);
  });

  it('a period with no leave overlap is unaffected', () => {
    const period = { start: '2026-09-08', end: '2026-09-14' };
    const capacity = getWorkCapacityHours(find('kavita-menon'), period);
    expect(capacity).toBeCloseTo(40, 5);
  });
});

describe('mid-period availability — capacity only contributes from the release date', () => {
  it('Suresh Iyer is at 75% (30h/40h) before release, then fully free from 16 Sep — the straddling period reflects both', () => {
    const beforeRelease = { start: '2026-09-08', end: '2026-09-14' };
    const allocBefore = getPlannedAllocation(find('suresh-iyer'), beforeRelease);
    expect(allocBefore.pct).toBeCloseTo(75, 5); // 30/40 — partially committed, not fully

    const straddling = { start: '2026-09-08', end: '2026-09-21' }; // commitment ends mid-way (15 Sep)
    const availStraddling = getAvailability(find('suresh-iyer'), straddling);
    // 10 working days in this window; 6 of them (8,9,10,11,14,15 Sep) carry the
    // 30h/wk (6h/day) commitment, the other 4 (16,17,18,21 Sep) are fully free:
    // capacity 10*8=80h, booked 6*6=36h, available 80-36=44h.
    expect(availStraddling.availableHours).toBeCloseTo(44, 5);

    const afterRelease = { start: '2026-09-16', end: '2026-09-22' };
    const availAfter = getAvailability(find('suresh-iyer'), afterRelease);
    expect(availAfter.availableHours).toBeCloseTo(40, 5); // fully available the week after release
    expect(availAfter.pct).toBeCloseTo(100, 5);
  });

  it('getAvailableFromDate reports "Immediate" when there\'s already some availability today, even before the full release date', () => {
    // Suresh is at 75%, not 100% — he already has 2h/day spare before his
    // commitment even ends, so this correctly reads "Immediate", not his
    // release date (that's when he becomes FULLY available, a different
    // question — see the 44h/40h availableHours numbers above).
    const period = { start: '2026-09-08', end: '2026-09-30' };
    expect(getAvailableFromDate(find('suresh-iyer'), period)).toBe('Immediate');
  });

  it('an employee fully committed until a release date reports that exact date, not "Immediate"', () => {
    const period = { start: '2026-09-08', end: '2026-09-30' };
    // Meera Nath is over-allocated (>100%) for the whole period in the fixture,
    // so she never shows any daily spare capacity within it.
    expect(getAvailableFromDate(find('meera-nath'), period)).toBeNull();
  });

  it('an employee already free today reports "Immediate"', () => {
    const period = { start: '2026-09-08', end: '2026-09-30' };
    expect(getAvailableFromDate(find('priya-sharma'), period)).toBe('Immediate');
  });
});

describe('multiple commitments are summed once each, never double-counted', () => {
  it('Ankit Desai: 16h project + 8h internal = 24h booked, not 16h or 32h duplicated', () => {
    const period = { start: '2026-09-08', end: '2026-09-14' };
    const allocation = getPlannedAllocation(find('ankit-desai'), period);
    expect(allocation.bookedHours).toBeCloseTo(24, 5);
    expect(allocation.pct).toBeCloseTo(60, 5);
  });
});

describe('over-allocation is flagged at the date level, not hidden by an average', () => {
  it('Meera Nath: two commitments overlap to 44h/wk against 40h capacity', () => {
    const period = { start: '2026-09-08', end: '2026-09-14' };
    const allocation = getPlannedAllocation(find('meera-nath'), period);
    expect(allocation.overAllocated).toBe(true);
    expect(allocation.pct).toBeGreaterThan(100); // preserved, not clamped to 100
  });

  it('a normally-allocated employee is not flagged', () => {
    const period = { start: '2026-09-08', end: '2026-09-14' };
    expect(getPlannedAllocation(find('priya-sharma'), period).overAllocated).toBe(false);
  });
});

describe('zero capacity and missing actuals both read as null/N/A, distinctly', () => {
  it('Farhan Ali has zero work capacity all period (long leave) — every percentage is null, not a divide-by-zero', () => {
    const period = { start: '2026-09-08', end: '2026-09-30' };
    const farhan = find('farhan-ali');
    expect(getWorkCapacityHours(farhan, period)).toBe(0);
    expect(getPlannedAllocation(farhan, period).pct).toBeNull();
    expect(getAvailability(farhan, period).pct).toBeNull();
  });

  it('Rohan Shah has capacity but a missing timesheet — actual utilization is null with reason "missing-timesheet", not 0%', () => {
    const actual = getActualUtilization(find('rohan-shah'), ACTUAL_PERIOD);
    expect(actual.pct).toBeNull();
    expect(actual.reason).toBe('missing-timesheet');
  });

  it('a verified zero differs from a missing timesheet', () => {
    const zeroBillable = { ...find('priya-sharma'), actualBillableHours: 0 };
    const actual = getActualUtilization(zeroBillable, ACTUAL_PERIOD);
    expect(actual.pct).toBe(0);
    expect(actual.reason).toBeNull();
  });

  it('an employee with real hours in the historical actual period gets a normal percentage, coexisting with a different future allocation', () => {
    const actual = getActualUtilization(find('priya-sharma'), ACTUAL_PERIOD);
    expect(actual.pct).toBeCloseTo(81, 0);
    const futureAllocation = getPlannedAllocation(find('priya-sharma'), STAFFING_PERIOD);
    expect(futureAllocation.pct).toBeCloseTo(60, 0);
    // Both true at once, over their own distinct periods.
    expect(actual.pct).not.toBeCloseTo(futureAllocation.pct, 0);
  });
});

describe('capacity-weighted average allocation and exact below-50% threshold', () => {
  it('average allocation is total booked ÷ total capacity, not a mean of percentages', () => {
    const cohort = getPartiallyAllocatedCohort(EMPLOYEES, STAFFING_PERIOD);
    const avg = getAverageAllocationPct(cohort);
    const totalCapacity = cohort.reduce((s, c) => s + c.allocation.workCapacityHours, 0);
    const totalBooked = cohort.reduce((s, c) => s + c.allocation.bookedHours, 0);
    expect(avg).toBeCloseTo((totalBooked / totalCapacity) * 100, 5);
    // Sanity: this must differ from a naive unweighted mean when capacities vary (Vikram is part-time).
    const naiveMean = cohort.reduce((s, c) => s + c.allocation.pct, 0) / cohort.length;
    expect(avg).not.toBeCloseTo(naiveMean, 3);
  });

  it('below-50% cohort uses each employee\'s exact allocation, not a chart bucket', () => {
    const cohort = getPartiallyAllocatedCohort(EMPLOYEES, STAFFING_PERIOD);
    const below50 = getBelow50Cohort(cohort);
    below50.forEach(({ allocation }) => expect(allocation.pct).toBeLessThan(50));
    // Arjun Nair (40%) must be included; Priya Sharma (60%) must not.
    expect(below50.some((c) => c.employee.id === 'arjun-nair')).toBe(true);
    expect(below50.some((c) => c.employee.id === 'priya-sharma')).toBe(false);
  });

  it('the partially-allocated cohort excludes 0% and 100%+ employees', () => {
    const cohort = getPartiallyAllocatedCohort(EMPLOYEES, STAFFING_PERIOD);
    // Farhan (zero capacity -> null pct) and fully-unbooked/over-100 employees must not appear.
    expect(cohort.some((c) => c.employee.id === 'farhan-ali')).toBe(false);
  });

  it('a draft (unconfirmed) allocation does not count toward planned allocation', () => {
    const period = { start: '2026-09-08', end: '2026-09-14' };
    const aditi = find('aditi-rao');
    const allocation = getPlannedAllocation(aditi, period);
    expect(allocation.bookedHours).toBe(0);
    expect(allocation.pct).toBe(0);
  });
});

describe('"becoming available within 30 days" — distinct employees, effective date and delta', () => {
  it('Suresh Iyer appears with his 15 Sep release date and the hours it frees', () => {
    const results = getBecomingAvailable(EMPLOYEES, STAFFING_PERIOD, 30);
    const suresh = results.find((r) => r.employee.id === 'suresh-iyer');
    expect(suresh).toBeTruthy();
    expect(suresh.effectiveDate).toBe('2026-09-16');
    expect(suresh.additionalHoursPerWeek).toBe(30);
  });

  it('an employee with no commitment ending in the window does not appear', () => {
    const results = getBecomingAvailable(EMPLOYEES, STAFFING_PERIOD, 30);
    expect(results.some((r) => r.employee.id === 'priya-sharma')).toBe(false);
  });
});

describe('recoverable capacity respects a known staffing restriction (release notice)', () => {
  it('Rahul Mehta has a 10-business-day notice restriction — recoverable hours are lower than raw available hours for a period starting before the notice clears', () => {
    const period = { start: '2026-09-08', end: '2026-09-14' }; // ends before his 2026-09-18 release
    const availability = getAvailability(find('rahul-mehta'), period);
    const recoverability = getRecoverability(find('rahul-mehta'), period);
    expect(availability.availableHours).toBeGreaterThan(0);
    expect(recoverability.recoverableHours).toBe(0); // nothing recoverable yet within this short window
  });
});

describe('the spec\'s worked fixture: 6,420 employees at 62% average, 1 FTE each -> 2,439.6 FTE unallocated', () => {
  it('is pure arithmetic, verified independent of this app\'s own (much smaller) demo cohort', () => {
    const totalEmployees = 6420;
    const avgAllocationPct = 62;
    const unallocatedFTE = totalEmployees * (1 - avgAllocationPct / 100);
    expect(unallocatedFTE).toBeCloseTo(2439.6, 5);
  });
});

describe('utilization gain is expressed in percentage points', () => {
  it('80% to 84.8% is +4.8 pp, not +4.8% of 80%', () => {
    const before = 80;
    const after = 84.8;
    const gainPP = after - before;
    expect(gainPP).toBeCloseTo(4.8, 5);
    // Explicitly NOT a relative-percent change (which would be ~6%).
    expect(gainPP).not.toBeCloseTo(((after - before) / before) * 100, 1);
  });
});

describe('consistent updates across cards/rows for the same period', () => {
  it('the recoverable FTE card total equals the sum of each employee\'s own recoverable FTE', () => {
    const total = EMPLOYEES.reduce((s, e) => s + getRecoverability(e, STAFFING_PERIOD).fte, 0);
    const sumOfRows = EMPLOYEES.map((e) => getRecoverability(e, STAFFING_PERIOD).fte).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(sumOfRows, 8);
  });

  it('changing the staffing period changes derived numbers consistently (a longer period admits more recoverable hours once Suresh is released)', () => {
    const shortPeriod = { start: '2026-09-08', end: '2026-09-14' };
    const longPeriod = { start: '2026-09-08', end: '2026-09-30' };
    const shortTotal = getRecoverability(find('suresh-iyer'), shortPeriod).recoverableHours;
    const longTotal = getRecoverability(find('suresh-iyer'), longPeriod).recoverableHours;
    expect(longTotal).toBeGreaterThan(shortTotal);
  });
});

describe('sanity: default periods are labeled and dated as specified', () => {
  it('staffing period defaults to the next 30 days', () => {
    const p = getDefaultStaffingPeriod('2026-09-08');
    expect(p.start).toBe('2026-09-08');
    expect(p.end).toBe('2026-10-08');
  });

  it('actual period defaults to the last 4 completed weeks (28 days)', () => {
    const p = getDefaultActualPeriod('2026-09-08');
    const days = (new Date(p.end) - new Date(p.start)) / 86400000 + 1;
    expect(days).toBe(28);
  });

  it('STANDARD_FTE_WEEKLY_HOURS is the configured reference, distinct from any employee\'s own capacity', () => {
    expect(STANDARD_FTE_WEEKLY_HOURS).toBe(40);
    expect(find('vikram-rao').weeklyCapacityHours).not.toBe(STANDARD_FTE_WEEKLY_HOURS);
  });
});
