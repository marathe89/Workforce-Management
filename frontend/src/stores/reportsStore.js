import { create } from 'zustand';
import { REAL_BUSINESS_UNITS } from '../data/businessUnits';

// Reports page state — session-only (no report-generation backend exists
// for this screen, same convention as the rest of this app). Holds the
// report list itself (so "+ New Report" can genuinely add one) plus each
// report's schedule/share/last-run status, so the top stat cards
// (Total/Scheduled/Last Generated/Shared) are computed from this real
// state instead of four separately hardcoded numbers.
const INITIAL_REPORTS = [
  { title: 'Workforce Utilization Report', category: 'Operations', categoryColor: 'var(--w-accent-blue)', description: 'Billable vs non-billable utilization across BUs and practices', lastRun: '14 Aug 2026', scheduled: { frequency: 'Weekly', time: '08:00', recipients: ['jordan.blake@coforge.com'] } },
  { title: 'Bench Analysis', category: 'Operations', categoryColor: 'var(--w-accent-blue)', description: 'Bench aging, cost, skill breakdown and staffing opportunities', lastRun: '13 Aug 2026', scheduled: null },
  { title: 'Capacity Report', category: 'Capacity', categoryColor: 'var(--w-green)', description: 'Available capacity, partial allocation, and recoverable FTE', lastRun: '14 Aug 2026', scheduled: { frequency: 'Weekly', time: '07:30', recipients: ['ops-leads@coforge.com'] } },
  { title: 'Demand Forecast', category: 'Planning', categoryColor: 'var(--w-amber)', description: 'Rolling 6-month demand forecast with confidence bands', lastRun: '12 Aug 2026', scheduled: null },
  { title: 'Skills Gap Report', category: 'Talent', categoryColor: 'var(--w-violet)', description: 'Supply vs demand by skill, geography, and grade', lastRun: '10 Aug 2026', scheduled: null },
  { title: 'Staffing Effectiveness', category: 'Operations', categoryColor: 'var(--w-accent-blue)', description: 'Time-to-staff, redeployment rate, and match quality metrics', lastRun: '8 Aug 2026', scheduled: null },
  { title: 'Business Unit Workforce Report', category: 'Executive', categoryColor: 'var(--w-indigo)', description: 'Per-BU headcount, utilization, capacity, and attrition', lastRun: '14 Aug 2026', scheduled: { frequency: 'Monthly', time: '06:00', recipients: ['exec-team@coforge.com'] } },
  { title: 'Executive Workforce Summary', category: 'Executive', categoryColor: 'var(--w-indigo)', description: 'C-suite ready summary of all workforce intelligence', lastRun: '14 Aug 2026', scheduled: { frequency: 'Monthly', time: '06:00', recipients: ['exec-team@coforge.com'] } },
].map((r, i) => ({ id: `report-${i}`, shared: i === 6 || i === 7 || i === 2 ? { recipients: ['exec-team@coforge.com'], permission: 'View only', link: `https://workforce.internal/reports/${r.title.toLowerCase().replace(/\s+/g, '-')}` } : null, ...r }));

const CATEGORY_COLOR = {
  Operations: 'var(--w-accent-blue)', Capacity: 'var(--w-green)', Planning: 'var(--w-amber)',
  Talent: 'var(--w-violet)', Executive: 'var(--w-indigo)', Custom: 'var(--w-cyan)',
};
export const CATEGORIES = Object.keys(CATEGORY_COLOR);
export const BUSINESS_UNIT_OPTIONS = ['All Business Units', ...REAL_BUSINESS_UNITS];

let nextId = INITIAL_REPORTS.length;

const useReportsStore = create((set, get) => ({
  reports: INITIAL_REPORTS,

  addReport: ({ title, category, description, businessUnit, period, runNow, schedule }) => {
    const id = `report-${nextId++}`;
    const report = {
      id, title, category, categoryColor: CATEGORY_COLOR[category] || 'var(--w-text-secondary)',
      description, businessUnit, period,
      lastRun: runNow ? 'Today' : 'Not yet run',
      scheduled: schedule || null, shared: null,
    };
    set((s) => ({ reports: [report, ...s.reports] }));
    return report;
  },

  runReport: (id) => set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, lastRun: 'Today' } : r)) })),

  setSchedule: (id, schedule) => set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, scheduled: schedule } : r)) })),
  clearSchedule: (id) => set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, scheduled: null } : r)) })),

  setShare: (id, share) => set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, shared: share } : r)) })),
  clearShare: (id) => set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, shared: null } : r)) })),
}));

export default useReportsStore;
