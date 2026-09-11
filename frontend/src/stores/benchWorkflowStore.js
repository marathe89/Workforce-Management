import { create } from 'zustand';

// Confirmed bookings from the Bench Management "Find Role" / "AI Match"
// workflow — session-local state (this prototype doesn't implement a
// real booking service, server concurrency or notifications, per
// bench-management-workflow.md). Guarded against duplicate confirmation:
// `confirm` is the only way to add bookings, and it's a no-op while a
// confirmation is already in flight for that employee.
let nextId = 1;

const useBenchWorkflowStore = create((set, get) => ({
  bookings: [], // { id, employeeId, roleId, percent, startDate, endDate, source, createdAt }
  dismissed: {}, // employeeId -> Set<roleId>
  confirming: {}, // employeeId -> bool, guards double-submit

  bookingsForEmployee: (employeeId) => get().bookings.filter((b) => b.employeeId === employeeId),

  confirm: (employeeId, rows) => {
    if (get().confirming[employeeId]) return { ok: false, reason: 'already-confirming' };
    set((s) => ({ confirming: { ...s.confirming, [employeeId]: true } }));
    const createdAt = new Date().toISOString();
    const newBookings = rows.map((r) => ({ id: `bk-${nextId++}`, employeeId, createdAt, ...r }));
    set((s) => ({ bookings: [...s.bookings, ...newBookings], confirming: { ...s.confirming, [employeeId]: false } }));
    return { ok: true, bookings: newBookings };
  },

  removeBooking: (id) => set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) })),

  dismiss: (employeeId, roleId) => set((s) => {
    const next = { ...s.dismissed };
    next[employeeId] = new Set([...(next[employeeId] || []), roleId]);
    return { dismissed: next };
  }),
  undoDismiss: (employeeId, roleId) => set((s) => {
    const next = { ...s.dismissed };
    if (next[employeeId]) {
      const copy = new Set(next[employeeId]);
      copy.delete(roleId);
      next[employeeId] = copy;
    }
    return { dismissed: next };
  }),
  isDismissed: (employeeId, roleId) => Boolean(get().dismissed[employeeId]?.has(roleId)),
}));

export default useBenchWorkflowStore;
