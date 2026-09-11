import { expect } from 'storybook/test';
import AdvisorResultCard from './AdvisorResultCard';

// Real card shapes copied from data/aiAdvisorData.js's intent builders.
const meta = {
  component: AdvisorResultCard,
  tags: ['ai-generated'],
};

export default meta;

export const WithMetrics = {
  args: {
    card: {
      icon: '✦',
      title: 'Excess Capacity — All Business Units',
      subtitle: 'Recoverable capacity found across partially-allocated employees.',
      metrics: [
        { label: 'Recoverable FTE', value: '3,180' },
        { label: 'Employees Affected', value: '6,420' },
      ],
      cta: { label: 'View in Capacity & Utilization →', to: '/capacity-utilization' },
    },
  },
  play: async ({ canvas }) => {
    // `cta` presence should make the whole card an interactive control.
    await expect(canvas.getByRole('button')).toBeVisible();
    await expect(canvas.getByText('3,180')).toBeVisible();
  },
};

export const WithList = {
  args: {
    card: {
      icon: '◎',
      title: 'Which employees can staff Project Phoenix?',
      subtitle: 'Ranked by skill match and available capacity.',
      list: [
        { label: 'Sanjay Kumar', value: '92% match', extra: '60% available' },
        { label: 'Aarav Patil', value: '85% match', extra: '100% available' },
      ],
      cta: { label: 'Open Talent Finder →', to: '/talent-finder' },
    },
  },
};

// No `cta` — should render as plain, non-interactive content (the
// honest "fallback" answer shape from findBestIntent's FALLBACK case).
export const NoAction = {
  args: {
    card: {
      icon: '✦',
      title: "Not sure I caught that",
      subtitle: 'Try asking about capacity, skills, staffing, or a named business unit.',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};
