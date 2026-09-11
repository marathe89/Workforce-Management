import { create } from 'zustand';

// The persona roles shown throughout the app (sidebar footer, header
// avatar/menu, Administration → Role Management) — replaces the single
// real backend identity ("Jordan Blake / Manager", from the actual
// /api/auth/login response) that used to be the only name ever shown.
// Login itself still goes through the real backend (authStore.js/
// apiClient) — this layer sits on top of it purely for WHICH persona's
// name/role/initials the UI displays, lets you switch between them, and
// (on request) add/rename/remove roles — since no backend user table has
// these people in it, there's nothing on the server for this to write
// to; it's a frontend-only roster, persisted to localStorage.
const DEFAULT_ROLES = [
  { id: 'anita-rao', name: 'Anita Rao', role: 'Business Unit Executive' },
  { id: 'arjun-nair', name: 'Arjun Nair', role: 'Portfolio Leader' },
  { id: 'rajiv-mehta', name: 'Rajiv Mehta', role: 'Delivery Leader' },
  { id: 'vikram-desai', name: 'Vikram Desai', role: 'Practice Lead' },
  { id: 'sneha-kulkarni', name: 'Sneha Kulkarni', role: 'Resource Manager' },
];

function initials(name) {
  const src = (name || '').trim();
  if (!src) return '?';
  return src
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'role';
}

const ROLES_KEY = 'personaRoles';
const ACTIVE_KEY = 'activeProfileId';

function loadRoles() {
  try {
    const stored = JSON.parse(localStorage.getItem(ROLES_KEY) || 'null');
    if (Array.isArray(stored) && stored.length > 0) return stored;
  } catch {
    // fall through to defaults
  }
  return DEFAULT_ROLES;
}

function saveRoles(roles) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

const initialRoles = loadRoles();
const storedActiveId = localStorage.getItem(ACTIVE_KEY);
const initialActiveId = initialRoles.some((r) => r.id === storedActiveId) ? storedActiveId : initialRoles[0].id;

const useProfileStore = create((set, get) => ({
  roles: initialRoles,
  activeId: initialActiveId,

  switchProfile: (id) => {
    if (!get().roles.some((r) => r.id === id)) return;
    localStorage.setItem(ACTIVE_KEY, id);
    set({ activeId: id });
  },

  // `name` is optional — a role added here doesn't need a named person
  // behind it (per request, the Feature Access matrix shows role titles
  // only, not names). Returns the new role's id, or null if the title
  // was blank.
  addRole: ({ name, role }) => {
    const roleTitle = (role || '').trim();
    if (!roleTitle) return null;
    const existingIds = new Set(get().roles.map((r) => r.id));
    let id = slugify(roleTitle);
    if (existingIds.has(id)) {
      let n = 2;
      while (existingIds.has(`${id}-${n}`)) n += 1;
      id = `${id}-${n}`;
    }
    const newRole = { id, name: (name || '').trim(), role: roleTitle };
    set((s) => {
      const roles = [...s.roles, newRole];
      saveRoles(roles);
      return { roles };
    });
    return id;
  },

  editRole: (id, { name, role }) =>
    set((s) => {
      const roles = s.roles.map((r) => {
        if (r.id !== id) return r;
        const nextRole = role !== undefined && role.trim() ? role.trim() : r.role;
        const nextName = name !== undefined ? name.trim() : r.name;
        return { ...r, name: nextName, role: nextRole };
      });
      saveRoles(roles);
      return { roles };
    }),

  // Never deletes the last remaining role (there must always be
  // something to switch to / for the matrix to show). If the deleted
  // role was the active one, falls back to whatever's now first.
  deleteRole: (id) =>
    set((s) => {
      if (s.roles.length <= 1) return s;
      const roles = s.roles.filter((r) => r.id !== id);
      saveRoles(roles);
      const activeId = s.activeId === id ? roles[0].id : s.activeId;
      if (activeId !== s.activeId) localStorage.setItem(ACTIVE_KEY, activeId);
      return { roles, activeId };
    }),
}));

// Convenience selector hook — the active persona plus its initials, so
// callers don't each re-derive initials() themselves.
export function useActiveProfile() {
  const roles = useProfileStore((s) => s.roles);
  const activeId = useProfileStore((s) => s.activeId);
  const profile = roles.find((r) => r.id === activeId) || roles[0];
  return { ...profile, initials: initials(profile.name || profile.role) };
}

export default useProfileStore;
