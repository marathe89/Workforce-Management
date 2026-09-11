import { create } from 'zustand';
import navigation from '../config/navigation';

// Feature-access matrix: which of the 5 personas (profileStore.js) can
// reach which page. This is a real, working permission system — not
// decorative — enforced in two places: Sidebar.jsx grays out and
// disables nav items the active persona can't reach, and AccessGuard.jsx
// blocks direct navigation to a disallowed route (typed URL, header
// search result, a stale link) and redirects to /access-denied.
//
// This is intentionally a SEPARATE system from the backend's own `role`
// column (employee/manager/hr_admin/executive, enforced server-side on
// the handful of write endpoints via authorize()) — the 5 personas here
// are a cosmetic display-identity layer with no backend account behind
// them (see profileStore.js), so there is nothing on the server for
// this matrix to key off of. This governs what the FRONTEND shows for
// whichever persona is currently active; it does not and cannot replace
// real server-side authorization.
//
// Administration itself is deliberately NOT governed by this matrix —
// every persona can always reach it, otherwise a persona with
// Administration unchecked could permanently lock everyone out of the
// screen that turns access back on. Role Management enforces this by
// simply not rendering a toggle for it.
export const FEATURES = navigation.map((n) => ({ id: n.path, label: n.label }));

const ALL_FEATURE_IDS = FEATURES.map((f) => f.id);

const DEFAULT_MATRIX = {
  'anita-rao': ALL_FEATURE_IDS, // Business Unit Executive — full access
  'arjun-nair': ['/', '/workforce', '/projects', '/capacity-utilization', '/demand-forecast', '/workforce-planning', '/reports', '/ai-advisor'], // Portfolio Leader
  'rajiv-mehta': ['/', '/workforce', '/projects', '/capacity-utilization', '/bench-management', '/reports', '/ai-advisor'], // Delivery Leader
  'vikram-desai': ['/', '/talent-finder', '/skills-intelligence', '/bench-management', '/workforce-planning', '/reports', '/ai-advisor'], // Practice Lead
  'sneha-kulkarni': ['/', '/talent-finder', '/capacity-utilization', '/bench-management', '/data-entry', '/reports', '/ai-advisor'], // Resource Manager
};

const STORAGE_KEY = 'featureAccessMatrix';

// No longer keyed off a fixed persona list (roles are now add/edit/
// delete-able from Administration → Role Management, see
// profileStore.js) — just layers whatever's saved over the 5 original
// defaults. A role added later with no entry here yet simply has no
// access (hasAccess's Array.isArray check fails safe to false) until an
// admin grants some from the matrix — never a crash, never accidental
// full access.
function loadMatrix() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return stored ? { ...DEFAULT_MATRIX, ...stored } : DEFAULT_MATRIX;
  } catch {
    return DEFAULT_MATRIX;
  }
}

const useAccessStore = create((set, get) => ({
  matrix: loadMatrix(),

  hasAccess: (personaId, featureId) => {
    if (featureId === '/administration') return true; // never restrictable, see comment above
    const allowed = get().matrix[personaId];
    return Array.isArray(allowed) && allowed.includes(featureId);
  },

  toggleFeature: (personaId, featureId) =>
    set((s) => {
      const current = s.matrix[personaId] || [];
      const next = current.includes(featureId) ? current.filter((f) => f !== featureId) : [...current, featureId];
      const matrix = { ...s.matrix, [personaId]: next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
      return { matrix };
    }),

  resetToDefaults: () =>
    set(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MATRIX));
      return { matrix: DEFAULT_MATRIX };
    }),
}));

export default useAccessStore;
