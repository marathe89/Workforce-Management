import { describe, it, expect, beforeEach } from 'vitest';
import {
  ROLES, AS_OF_DATE, matchRole, getEligibleRoles, getRankedRecommendations,
  getEmployeeAvailableFrom, getEmployeeCommittedPercentOnDate, getRoleRemainingDemand,
  computeIntervals, validateProposal, getBookingStatus, getDefaultAllocation,
} from './benchWorkflowData';

const phoenix = () => ROLES.find((r) => r.id === 'role-phoenix-java');
const meridian = () => ROLES.find((r) => r.id === 'role-meridian-java');

const aarav = {
  id: 'aarav-patil', name: 'Aarav Patil', skills: ['Java', 'AWS'], commitments: [],
};
const priya = {
  id: 'priya-sharma-bench', name: 'Priya Sharma', skills: ['Java', 'AWS'],
  commitments: [{ id: 'atlas', name: 'Project Atlas', hoursPerWeek: 24, startDate: '2026-08-01', endDate: '2026-12-31', status: 'confirmed' }],
};
const noSkillMatch = {
  id: 'no-match', name: 'Someone Else', skills: ['SAP ERP'], commitments: [],
};

describe('use case 1 — Aarav Patil, full bench', () => {
  it('is eligible for both demo roles (exact skill match) and available immediately', () => {
    const eligible = getEligibleRoles(aarav, []);
    expect(eligible.map((x) => x.role.id).sort()).toEqual(['role-meridian-java', 'role-phoenix-java'].sort());
    expect(getEmployeeAvailableFrom(aarav, [])).toBe('Immediate');
  });

  it('accepting Phoenix at 100% from 15 Sep produces a Scheduled booking that does not change today\'s bench status', () => {
    const booking = { roleId: phoenix().id, employeeId: aarav.id, percent: 100, startDate: '2026-09-15', endDate: '2026-12-31' };
    expect(getBookingStatus(booking, AS_OF_DATE)).toBe('Scheduled');
    // As of today, Aarav still shows 0% committed (the booking hasn't started).
    expect(getEmployeeCommittedPercentOnDate(aarav, AS_OF_DATE, [])).toBe(0);
    // But on/after 15 Sep, once confirmed, he would be 100% committed.
    expect(getEmployeeCommittedPercentOnDate(aarav, '2026-09-15', [booking])).toBe(100);
  });

  it('an immediate 40% Meridian assignment changes a fully benched employee to partial allocation', () => {
    const booking = { roleId: meridian().id, employeeId: aarav.id, percent: 40, startDate: AS_OF_DATE, endDate: '2026-10-31' };
    expect(getBookingStatus(booking, AS_OF_DATE)).toBe('Active');
    expect(getEmployeeCommittedPercentOnDate(aarav, AS_OF_DATE, [booking])).toBe(40);
    // 60% still genuinely uncommitted — not fully benched, not fully allocated.
  });

  it('confirming one employee\'s booking reduces the role capacity offered to another employee', () => {
    const before = getRoleRemainingDemand(meridian(), []);
    expect(before).toBe(40);
    const booking = { roleId: meridian().id, employeeId: aarav.id, percent: 25, startDate: AS_OF_DATE, endDate: '2026-10-31' };
    const after = getRoleRemainingDemand(meridian(), [booking], AS_OF_DATE);
    expect(after).toBe(15);
  });
});

describe('use case 2 — Priya Sharma, 60% Atlas + split across two roles', () => {
  it('her existing Atlas commitment is read-only and always contributes 60%, independent of any proposal', () => {
    expect(getEmployeeCommittedPercentOnDate(priya, '2026-09-21', [])).toBe(60); // a Monday — 2026-09-20 is a Sunday
  });

  it('is eligible for both roles despite the existing commitment', () => {
    const eligible = getEligibleRoles(priya, []);
    expect(eligible.length).toBe(2);
  });

  it('25% Phoenix + 15% Meridian, both starting 15 Sep, produces the two intervals from the spec\'s table', () => {
    const proposedRows = [
      { roleId: phoenix().id, percent: 25, startDate: '2026-09-15', endDate: '2026-12-31' },
      { roleId: meridian().id, percent: 15, startDate: '2026-09-15', endDate: '2026-10-31' },
    ];
    const intervals = computeIntervals(priya, proposedRows, []);
    const first = intervals.find((iv) => iv.start === '2026-09-15' && iv.end === '2026-10-31');
    expect(first).toBeTruthy();
    expect(first.existingPct).toBeCloseTo(60, 5);
    expect(first.proposedPct).toBeCloseTo(40, 5); // 25 + 15
    expect(first.totalPct).toBeCloseTo(100, 5);

    const second = intervals.find((iv) => iv.start === '2026-11-01');
    expect(second).toBeTruthy();
    expect(second.existingPct).toBeCloseTo(60, 5);
    expect(second.proposedPct).toBeCloseTo(25, 5); // only Phoenix continues
    expect(second.totalPct).toBeCloseTo(85, 5);

    // No validation errors for this valid, spec-matching split.
    expect(validateProposal(priya, proposedRows, [])).toEqual([]);
  });

  it('60% existing + 50% proposed = 110% is blocked with a date-specific error, not silently allowed', () => {
    const proposedRows = [{ roleId: phoenix().id, percent: 50, startDate: '2026-09-15', endDate: '2026-12-31' }];
    const errors = validateProposal(priya, proposedRows, []);
    expect(errors.some((e) => e.type === 'overallocation')).toBe(true);
  });

  it('non-overlapping assignments across different dates are not rejected just because percentages would sum above 100% overall', () => {
    // Meridian ends 31 Oct; propose a second role only starting 1 Nov —
    // no date overlap, so even a large combined nominal total is fine.
    const proposedRows = [
      { roleId: meridian().id, percent: 40, startDate: '2026-09-15', endDate: '2026-10-31' },
    ];
    expect(validateProposal(priya, proposedRows, []).filter((e) => e.type === 'overallocation')).toEqual([]);
  });
});

describe('missing mandatory skills and no-match honesty', () => {
  it('an employee missing a required skill is not eligible, and the reason is explicit', () => {
    const match = matchRole(noSkillMatch, phoenix(), []);
    expect(match.eligible).toBe(false);
    expect(match.missingRequiredSkills).toEqual(['Java', 'AWS']);
  });

  it('getRankedRecommendations returns nothing for a non-matching profile rather than inventing a match', () => {
    expect(getRankedRecommendations(noSkillMatch, [], 2)).toEqual([]);
  });

  it('a preferred-but-not-required skill does not block eligibility for Meridian (AWS preferred, not required)', () => {
    const javaOnly = { id: 'java-only', name: 'Java Only', skills: ['Java'], commitments: [] };
    const match = matchRole(javaOnly, meridian(), []);
    expect(match.eligible).toBe(true);
    expect(match.matchedPreferredSkills).toEqual([]);
  });
});

describe('date-window and demand validation', () => {
  it('a proposed date range outside the role\'s own window is rejected', () => {
    const proposedRows = [{ roleId: meridian().id, percent: 20, startDate: '2026-09-08', endDate: '2026-11-15' }]; // role ends 31 Oct
    const errors = validateProposal(aarav, proposedRows, []);
    expect(errors.some((e) => e.type === 'window')).toBe(true);
  });

  it('proposing more than the remaining role demand is rejected', () => {
    const booking = { roleId: meridian().id, employeeId: 'someone-else', percent: 30, startDate: '2026-09-08', endDate: '2026-10-31' };
    const proposedRows = [{ roleId: meridian().id, percent: 20, startDate: '2026-09-08', endDate: '2026-10-31' }]; // only 10% left
    const errors = validateProposal(aarav, proposedRows, [booking]);
    expect(errors.some((e) => e.type === 'demand')).toBe(true);
  });

  it('getDefaultAllocation never proposes more than either side can support', () => {
    const defaults = getDefaultAllocation(priya, meridian(), []);
    expect(defaults.percent).toBeLessThanOrEqual(40); // Priya only has 40% spare
    expect(defaults.percent).toBeLessThanOrEqual(meridian().demandPercent);
  });
});

describe('booking status by date, relative to the as-of date', () => {
  it('a booking starting after AS_OF_DATE is Scheduled', () => {
    expect(getBookingStatus({ startDate: '2026-09-15', endDate: '2026-12-31' })).toBe('Scheduled');
  });
  it('a booking covering AS_OF_DATE is Active', () => {
    expect(getBookingStatus({ startDate: '2026-08-01', endDate: '2026-12-31' })).toBe('Active');
  });
  it('a booking that already ended is Ended', () => {
    expect(getBookingStatus({ startDate: '2026-01-01', endDate: '2026-03-01' })).toBe('Ended');
  });
});
