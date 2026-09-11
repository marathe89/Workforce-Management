import { expect } from 'storybook/test';
import ActiveFilterChips from './ActiveFilterChips';
import useFilterStore from '../stores/filterStore';

// Reads the real useFilterStore directly (no props) — renders nothing
// when every filter is at its default. Each play sets the store state
// it needs first, since there's no other way to drive this component.
const meta = {
  component: ActiveFilterChips,
  tags: ['ai-generated'],
};

export default meta;

// The component's actual "nothing to show" branch — real behavior, not
// an empty story for its own sake.
export const NoActiveFilters = {
  play: async ({ canvas }) => {
    useFilterStore.getState().clearAll();
    await expect(canvas.queryByText('Filtered by:')).toBeNull();
  },
};

export const OneActiveFilter = {
  play: async ({ canvas, userEvent }) => {
    useFilterStore.getState().clearAll();
    useFilterStore.getState().setDraft('allocation', 'Bench');
    useFilterStore.getState().apply();

    await expect(await canvas.findByText('Filtered by:')).toBeVisible();
    await expect(canvas.getByText('Bench')).toBeVisible();

    // Clearing the one chip should return the store to its default.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Allocation filter' }));
    await expect(useFilterStore.getState().applied.allocation).toBe('All Workforce');
  },
};
