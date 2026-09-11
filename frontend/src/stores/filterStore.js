import { create } from 'zustand';

// Shared, global filter state — makes the Header's Business Unit
// dropdown and FilterBar's Practice/Geography/Allocation/Grade row
// actionable instead of decorative, and gives every page a single place
// to read "what's currently filtered" from.
//
// Two-tier state, matching the FilterBar's own Apply/Clear All UI:
// `draft` is what the dropdowns currently show (edits as you pick), and
// `applied` is what pages actually filter their data by — only updated
// when Apply is clicked. The Header's Business Unit selector is the one
// exception: it has no Apply button of its own, so picking a value there
// commits both draft and applied immediately (an org-wide context
// switcher, not a staged filter).
export const DEFAULTS = {
  businessUnit: 'All Business Units',
  practice: 'All Practices',
  geography: 'All Geographies',
  allocation: 'All Workforce',
  grade: 'All Bands',
};

const useFilterStore = create((set, get) => ({
  draft: { ...DEFAULTS },
  applied: { ...DEFAULTS },

  setDraft: (key, value) => set((s) => ({ draft: { ...s.draft, [key]: value } })),

  // Business Unit commits immediately (Header has no Apply button).
  setBusinessUnitNow: (value) =>
    set((s) => ({
      draft: { ...s.draft, businessUnit: value },
      applied: { ...s.applied, businessUnit: value },
    })),

  // Allocation commits immediately too — used by Workforce's stat cards
  // and Capacity Waterfall bars (clicking one is a quick-select shortcut
  // into the same Allocation dimension FilterBar exposes, not a separate
  // filter of its own), so it stays in sync with FilterBar's own
  // Allocation dropdown rather than drifting into a second source of
  // truth. Bypasses the draft/Apply staging other FilterBar fields use,
  // same reasoning as setBusinessUnitNow above.
  setAllocationNow: (value) =>
    set((s) => ({
      draft: { ...s.draft, allocation: value },
      applied: { ...s.applied, allocation: value },
    })),

  apply: () => set((s) => ({ applied: { ...s.draft } })),

  clearAll: () => set({ draft: { ...DEFAULTS }, applied: { ...DEFAULTS } }),

  // Remove a single applied filter (used by Overview's active-filter
  // chips) — resets just that one field back to its default, in both
  // draft and applied so the dropdown reflects it too.
  clearOne: (key) =>
    set((s) => ({
      draft: { ...s.draft, [key]: DEFAULTS[key] },
      applied: { ...s.applied, [key]: DEFAULTS[key] },
    })),

  hasActiveFilters: () => {
    const { applied } = get();
    return Object.keys(DEFAULTS).some((key) => applied[key] !== DEFAULTS[key]);
  },
}));

export default useFilterStore;
