import { expect } from 'storybook/test';
import ReportCard from './ReportCard';

// Real report objects copied from data seeded in stores/reportsStore.js.
const meta = {
  component: ReportCard,
  tags: ['ai-generated'],
};

export default meta;

export const Operations = {
  args: {
    report: {
      category: 'Operations',
      categoryColor: 'var(--w-accent-blue)',
      title: 'Workforce Utilization Report',
      description: 'Billable vs non-billable utilization across BUs and practices',
      lastRun: '14 Aug 2026',
      scheduled: null,
      shared: null,
    },
    onView: () => {},
    onExport: () => {},
    onSchedule: () => {},
    onShare: () => {},
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'View' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Export' })).toBeVisible();
  },
};

export const Capacity = {
  args: {
    report: {
      category: 'Capacity',
      categoryColor: 'var(--w-green)',
      title: 'Capacity Report',
      description: 'Available capacity, partial allocation, and recoverable FTE',
      lastRun: '14 Aug 2026',
      scheduled: null,
      shared: null,
    },
    onView: () => {},
    onExport: () => {},
    onSchedule: () => {},
    onShare: () => {},
  },
};

// Exercises the `scheduled`/`shared` badges — a real branch of the
// component, not just a color variant.
export const ScheduledAndShared = {
  args: {
    report: {
      category: 'Executive',
      categoryColor: 'var(--w-indigo)',
      title: 'Executive Workforce Summary',
      description: 'C-suite ready summary of all workforce intelligence',
      lastRun: '14 Aug 2026',
      scheduled: { frequency: 'Monthly', time: '06:00', recipients: ['exec-team@coforge.com'] },
      shared: { recipients: ['exec-team@coforge.com'], permission: 'View only', link: 'https://workforce.internal/reports/exec' },
    },
    onView: () => {},
    onExport: () => {},
    onSchedule: () => {},
    onShare: () => {},
  },
  play: async ({ canvas }) => {
    // These badges only render when the `scheduled`/`shared` props are
    // present — proves the conditional branches, not just static markup.
    await expect(canvas.getByText('⏱ Monthly')).toBeVisible();
    await expect(canvas.getByText('⇢ Shared')).toBeVisible();
  },
};
