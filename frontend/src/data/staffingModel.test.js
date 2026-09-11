import { describe, it, expect } from 'vitest';
import {
  REQUIREMENTS,
  PROJECT,
  getProjectSummary,
  getRequirementCoverage,
  getPotentialCapacity,
  computeAllocationFTE,
  getCandidateTotalPercent,
  validateAllocation,
  runOptimizeHeuristic,
  CANDIDATES,
} from './staffingModel';

const req = (id) => REQUIREMENTS.find((r) => r.id === id);

describe('baseline reconciliation (no draft allocations)', () => {
  it('required FTE totals 42', () => {
    expect(getProjectSummary([]).requiredFTE).toBe(42);
  });

  it('confirmed FTE totals 34 and gap totals 8 (81% coverage)', () => {
    const s = getProjectSummary([]);
    expect(s.confirmedFTE).toBeCloseTo(34, 5);
    expect(s.remainingGap).toBeCloseTo(8, 5);
    expect(s.confirmedCoveragePercent).toBeCloseTo(80.95, 1);
  });
});

describe('the spec\'s worked "add 4 eligible FTE" example (pure arithmetic)', () => {
  it('34 confirmed + 4 added = 38 covered, 4 FTE gap, ~90.5% coverage', () => {
    const required = 42;
    const confirmed = 34;
    const added = 4;
    const covered = confirmed + added;
    const gap = required - covered;
    const coverage = (covered / required) * 100;
    expect(covered).toBe(38);
    expect(gap).toBe(4);
    expect(coverage).toBeCloseTo(90.5, 0);
  });
});

describe('Optimize Staffing heuristic', () => {
  it('never proposes more than a requirement still needs (no overstaffing one role)', () => {
    const result = runOptimizeHeuristic({});
    const draft = result.proposals.map((p, i) => ({ id: `p${i}`, ...p }));
    REQUIREMENTS.forEach((r) => {
      const c = getRequirementCoverage(r, draft);
      expect(c.confirmedFTE + c.proposedFTE).toBeLessThanOrEqual(c.requiredFTE + 0.01);
    });
  });

  it('reduces the project-wide remaining gap without ever exceeding total required FTE', () => {
    const result = runOptimizeHeuristic({});
    const draft = result.proposals.map((p, i) => ({ id: `p${i}`, ...p }));
    const before = getProjectSummary([]);
    const after = getProjectSummary(draft);
    expect(after.remainingGap).toBeLessThan(before.remainingGap);
    expect(after.confirmedFTE + after.proposedFTE).toBeLessThanOrEqual(after.requiredFTE + 0.01);
  });

  it('only proposes from the bench pool, never the AI Talent Matching review candidates', () => {
    const result = runOptimizeHeuristic({});
    const reviewIds = new Set(CANDIDATES.filter((c) => c.pool === 'review').map((c) => c.id));
    expect(result.proposals.some((p) => reviewIds.has(p.candidateId))).toBe(false);
  });

  it('is deterministic — running it twice with the same inputs gives the same proposals', () => {
    const a = runOptimizeHeuristic({});
    const b = runOptimizeHeuristic({});
    expect(a.proposals.map((p) => p.candidateId)).toEqual(b.proposals.map((p) => p.candidateId));
  });

  it('restricting to must-have requirements only proposes for those', () => {
    const result = runOptimizeHeuristic({ mustHaveRequirementIds: ['req-aws'] });
    expect(result.proposals.every((p) => p.requirementId === 'req-aws')).toBe(true);
  });

  it('describes itself as a deterministic heuristic, not a claim of AI or global optimality', () => {
    const result = runOptimizeHeuristic({});
    expect(result.method).toMatch(/deterministic/i);
    expect(result.method).toMatch(/not a machine-learning|not.*globally-optimal/i);
  });

  it('reports unfilled gaps it cannot cover', () => {
    // Project Management has no eligible bench candidate at all; forcing
    // a gap onto it should leave it unfilled rather than silently ignored.
    const bigGapReq = { ...req('req-pm'), bookedAllocations: [] };
    const result = runOptimizeHeuristic({}, [bigGapReq]);
    expect(result.unfilled.length).toBeGreaterThan(0);
    expect(result.unfilled[0].requirementId).toBe('req-pm');
  });
});

describe('candidate allocation FTE — full vs partial period overlap', () => {
  it('Priya 40% + Rahul 30% + Sneha 20% over a full period sum to 0.9 FTE, giving ~83.1% coverage and a 7.1 FTE gap on the 42/34 baseline', () => {
    // Spec's illustrative case: candidate percentages summed directly
    // ("when they overlap for a full period", no proration) against the
    // real 42-required / 34-confirmed baseline this model reproduces.
    const baseline = getProjectSummary([]);
    expect(baseline.requiredFTE).toBe(42);
    expect(baseline.confirmedFTE).toBeCloseTo(34, 5);

    const combinedCandidateFTE = 0.4 + 0.3 + 0.2;
    expect(combinedCandidateFTE).toBeCloseTo(0.9, 5);

    const coverage = ((baseline.confirmedFTE + combinedCandidateFTE) / baseline.requiredFTE) * 100;
    const gap = baseline.requiredFTE - baseline.confirmedFTE - combinedCandidateFTE;
    expect(coverage).toBeCloseTo(83.1, 0.5);
    expect(gap).toBeCloseTo(7.1, 5);
  });

  it('prorates a partial-period allocation to less than the full-period figure', () => {
    // Same 40% allocation, but starting halfway through the requirement
    // period instead of at day 1 — must contribute less than 0.4 FTE.
    const javaReq = { ...req('req-java'), headcountFTE: 1, bookedAllocations: [], startDate: '2026-09-01', endDate: '2027-02-28' };
    const fullPeriod = computeAllocationFTE({ percent: 40, startDate: '2026-09-01', endDate: '2027-02-28' }, javaReq);
    const halfPeriod = computeAllocationFTE({ percent: 40, startDate: '2026-12-01', endDate: '2027-02-28' }, javaReq);
    expect(halfPeriod).toBeLessThan(fullPeriod);
    expect(halfPeriod).toBeGreaterThan(0);
  });

  it('an allocation entirely outside the requirement period contributes 0 FTE', () => {
    const javaReq = req('req-java');
    const fte = computeAllocationFTE({ percent: 50, startDate: '2025-01-01', endDate: '2025-06-30' }, javaReq);
    expect(fte).toBe(0);
  });
});

describe('over-allocation and shared capacity across skills', () => {
  it('flags a candidate proposed beyond their remaining spare capacity', () => {
    const priya = CANDIDATES.find((c) => c.id === 'priya-sharma');
    // Priya already commits 60% to Project Atlas; proposing another 50%
    // here would push her to 110%.
    const allocation = { id: 'new', percent: 50, startDate: '2026-09-15', endDate: '2027-03-31' };
    const conflicts = validateAllocation(priya, allocation, [], req('req-java'));
    expect(conflicts.some((c) => /over-allocated/i.test(c))).toBe(true);
  });

  it('does not double-count the same committed hours across two draft allocations for different skills', () => {
    const rahul = CANDIDATES.find((c) => c.id === 'rahul-mehta');
    // Rahul is proposed on two different requirements in the same draft;
    // total committed capacity must be the SUM, not counted once.
    const draft = [
      { id: 'a1', candidateId: 'rahul-mehta', requirementId: 'req-data', percent: 30, startDate: '2026-09-01', endDate: '2027-03-31' },
      { id: 'a2', candidateId: 'rahul-mehta', requirementId: 'req-aws', percent: 30, startDate: '2026-09-01', endDate: '2027-03-31' },
    ];
    const { proposed } = getCandidateTotalPercent(rahul, draft);
    expect(proposed).toBe(60);
  });

  it('allows a valid, in-capacity allocation with no conflicts', () => {
    const vikram = CANDIDATES.find((c) => c.id === 'vikram-rao');
    const allocation = { id: 'new', percent: 20, startDate: '2026-10-01', endDate: '2027-03-31' };
    const conflicts = validateAllocation(vikram, allocation, [], req('req-devops'));
    expect(conflicts).toEqual([]);
  });

  it('flags dates proposed before the candidate is available', () => {
    const sneha = CANDIDATES.find((c) => c.id === 'sneha-kulkarni');
    const allocation = { id: 'new', percent: 20, startDate: '2026-09-01', endDate: '2027-03-31' };
    const conflicts = validateAllocation(sneha, allocation, [], req('req-ux'));
    expect(conflicts.some((c) => /not available until/i.test(c))).toBe(true);
  });
});

describe('excess coverage in one role does not hide another role\'s gap', () => {
  it('over-covering one requirement leaves other requirements\' gaps intact in the project total', () => {
    const draft = [
      // Massively over-cover Java (already at 9/12 confirmed) with 5 more
      // FTE-equivalent of proposed capacity...
      { id: 'a1', candidateId: 'ankit-desai', requirementId: 'req-java', percent: 100, startDate: '2026-09-30', endDate: '2027-03-31' },
    ];
    const before = getProjectSummary([]);
    const after = getProjectSummary(draft);
    // Java's own gap should hit 0, but every other requirement's gap is
    // untouched, so the project-wide gap only drops by Java's own gap
    // amount (3), never by more, even though Java's surplus vastly
    // exceeds 3.
    const javaGapBefore = getRequirementCoverage(req('req-java'), []).remainingGap;
    expect(after.remainingGap).toBeCloseTo(before.remainingGap - javaGapBefore, 1);
    const devopsGapUnchanged = getRequirementCoverage(req('req-devops'), draft).remainingGap;
    expect(devopsGapUnchanged).toBeCloseTo(getRequirementCoverage(req('req-devops'), []).remainingGap, 5);
  });
});

describe('potential capacity is derived from eligible people, not a constant', () => {
  it('drops to 0 once every eligible candidate is already assigned', () => {
    const allCandidateIds = CANDIDATES.map((c) => c.id);
    const potential = getPotentialCapacity(REQUIREMENTS, [], allCandidateIds);
    expect(potential).toBe(0);
  });

  it('is positive when eligible candidates and open gaps both exist', () => {
    expect(getPotentialCapacity(REQUIREMENTS, [])).toBeGreaterThan(0);
  });
});
