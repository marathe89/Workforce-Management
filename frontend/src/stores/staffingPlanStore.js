import { create } from 'zustand';
import { validateAllocation, CANDIDATES, REQUIREMENTS } from '../data/staffingModel';

// Draft staffing-plan state for the Project Staffing screen — the single
// place every widget (requirement list, candidate panel, timeline,
// review panel, submission) reads and writes selections from, so adding,
// editing or removing an allocation is immediately reflected everywhere
// instead of each widget keeping its own local copy.
//
// No booking/approval backend exists for this screen (Project Phoenix
// has no backing project_id — see staffingModel.js), so `submit()` is a
// clearly-labeled local draft flow: it does not call an API, book
// anyone, or notify a manager. It's guarded against double-submission
// and revalidates every allocation first.
let nextId = 1;

function newId() {
  return `alloc-${nextId++}`;
}

const useStaffingPlanStore = create((set, get) => ({
  draftAllocations: [],
  history: [], // snapshots for undo
  selectedRequirementId: null,
  selectedPeriodMonth: null, // e.g. '2026-09' — narrows requirement/candidate views to that month
  submission: { status: 'draft', submittedAt: null }, // 'draft' | 'submitting' | 'submitted'

  selectRequirement: (id) => set((s) => ({ selectedRequirementId: s.selectedRequirementId === id ? null : id })),
  selectPeriod: (month) => set((s) => ({ selectedPeriodMonth: s.selectedPeriodMonth === month ? null : month })),

  _snapshot: () => set((s) => ({ history: [...s.history, s.draftAllocations] })),

  addAllocation: (allocation) => {
    get()._snapshot();
    const id = newId();
    set((s) => ({ draftAllocations: [...s.draftAllocations, { id, status: 'draft', ...allocation }] }));
    return id;
  },

  editAllocation: (id, patch) => {
    get()._snapshot();
    set((s) => ({ draftAllocations: s.draftAllocations.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
  },

  removeAllocation: (id) => {
    get()._snapshot();
    set((s) => ({ draftAllocations: s.draftAllocations.filter((a) => a.id !== id) }));
  },

  // Merges Optimize Staffing's proposals into the draft in one step
  // (still undoable as a single action).
  applyProposals: (proposals) => {
    get()._snapshot();
    const added = proposals.map((p) => ({
      id: newId(),
      status: 'draft',
      source: 'optimize',
      candidateId: p.candidateId,
      requirementId: p.requirementId,
      percent: p.percent,
      startDate: p.startDate,
      endDate: p.endDate,
    }));
    set((s) => ({ draftAllocations: [...s.draftAllocations, ...added] }));
  },

  undo: () =>
    set((s) => {
      if (s.history.length === 0) return s;
      const prev = s.history[s.history.length - 1];
      return { draftAllocations: prev, history: s.history.slice(0, -1) };
    }),

  discardAll: () => set((s) => ({ history: [...s.history, s.draftAllocations], draftAllocations: [] })),

  canUndo: () => get().history.length > 0,

  // Every conflict across the whole draft — over-allocation, bad dates,
  // availability, out-of-period — surfaced together in the review panel.
  getAllConflicts: () => {
    const { draftAllocations } = get();
    const conflicts = [];
    draftAllocations.forEach((a) => {
      const candidate = CANDIDATES.find((c) => c.id === a.candidateId);
      const requirement = REQUIREMENTS.find((r) => r.id === a.requirementId);
      if (!candidate || !requirement) return;
      const issues = validateAllocation(candidate, a, draftAllocations, requirement);
      issues.forEach((issue) => conflicts.push({ allocationId: a.id, candidateName: candidate.name, requirementRole: requirement.role, issue }));
    });
    return conflicts;
  },

  // Guarded submission — a no-op if already submitting/submitted, and
  // revalidates every allocation before "confirming" the draft. Local
  // only: no backend call, no booking, no notification is sent.
  submit: () => {
    const { submission, getAllConflicts, draftAllocations } = get();
    if (submission.status !== 'draft') return { ok: false, reason: 'already-submitted' };
    if (draftAllocations.length === 0) return { ok: false, reason: 'empty' };
    if (getAllConflicts().length > 0) return { ok: false, reason: 'conflicts' };
    set({ submission: { status: 'submitting', submittedAt: null } });
    const submittedAt = new Date().toISOString();
    set({ submission: { status: 'submitted', submittedAt } });
    return { ok: true };
  },

  reset: () =>
    set({
      draftAllocations: [],
      history: [],
      selectedRequirementId: null,
      selectedPeriodMonth: null,
      submission: { status: 'draft', submittedAt: null },
    }),
}));

export default useStaffingPlanStore;
