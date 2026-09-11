import { expect, fn } from 'storybook/test';
import NotificationsPanel, { INITIAL_NOTIFICATIONS } from './NotificationsPanel';

const meta = {
  component: NotificationsPanel,
  tags: ['ai-generated'],
};

export default meta;

export const Open = {
  args: {
    open: true,
    notifications: INITIAL_NOTIFICATIONS,
    onClose: fn(),
    onMarkTabRead: fn(),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Notifications')).toBeVisible();
    // Unread-count badge reflects the real notifications array length.
    await expect(canvas.getByText(String(INITIAL_NOTIFICATIONS.length))).toBeVisible();
  },
};

// Real interaction: switching tabs filters the visible list — the
// component's own `activeTab` state, not a prop.
export const FilterByTab = {
  args: {
    open: true,
    notifications: INITIAL_NOTIFICATIONS,
    onClose: fn(),
    onMarkTabRead: fn(),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Critical' }));
    const criticalCount = INITIAL_NOTIFICATIONS.filter((n) => n.severity === 'critical').length;
    await expect(canvas.getByText(`Mark Critical as Read`)).toBeVisible();
    await expect(canvas.getAllByText('Take Action →')).toHaveLength(criticalCount);
  },
};

// The real empty-state branch (`notifications.length === 0`).
export const Empty = {
  args: {
    open: true,
    notifications: [],
    onClose: fn(),
    onMarkTabRead: fn(),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("You're all caught up.")).toBeVisible();
  },
};
