import { expect } from 'storybook/test';
import StatCard from './StatCard';

const meta = {
  component: StatCard,
  tags: ['ai-generated'],
};

export default meta;

// Overview's "Total Workforce" card — clickable via `linkTo`, so it
// renders role="button". Real content copied from pages/Overview.jsx.
export const Clickable = {
  args: {
    label: 'Total Workforce',
    value: '48,620',
    subtitle: 'FTE across all business units',
    trend: { direction: 'up', label: '+4.8% YoY' },
    linkTo: '/workforce',
  },
  play: async ({ canvas }) => {
    // `linkTo` should make the card an interactive control, not just text.
    await expect(canvas.getByRole('button')).toBeVisible();
    await expect(canvas.getByText('48,620')).toBeVisible();
  },
};

// Workforce.jsx's "Partially Allocated" card — no `trend`, uses the
// amber `highlight` line instead (a real, distinct rendering branch).
export const WithHighlight = {
  args: {
    label: 'Partially Allocated',
    value: '6,420',
    subtitle: '13.2% of workforce',
    highlight: 'Recoverable: 3,180 FTE',
  },
};

// Most callers (Workforce, Bench Management, Demand Forecast) pass
// neither `linkTo` nor `onClick` — plain, non-interactive card.
export const Static = {
  args: {
    label: 'On Bench',
    value: '1,126',
    subtitle: '2.3% of workforce',
  },
  play: async ({ canvas }) => {
    // Without linkTo/onClick the card must NOT expose a button role —
    // this is the actual behavior branch (`clickable` in StatCard.jsx),
    // not just static text.
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

// The only story in the whole project asserting a real computed style —
// proves the shared preview's index.css import actually resolved the
// --w-accent-blue token, not just that JSX rendered.
export const CssCheck = {
  args: {
    label: 'Billable Utilization',
    value: '82.6%',
    subtitle: 'Target 85.0%',
    linkTo: '/workforce',
    active: true,
  },
  play: async ({ canvas }) => {
    const card = canvas.getByRole('button');
    // StatCard's `active` prop sets borderTop to var(--w-accent-blue),
    // which index.css defines as #4784f9 — fails if global CSS didn't load.
    await expect(getComputedStyle(card).borderTopColor).toBe('rgb(71, 132, 249)');
  },
};
