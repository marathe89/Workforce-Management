import { expect } from 'storybook/test';
import FilterBar from './FilterBar';
import useFilterStore from '../stores/filterStore';

// FilterBar reads/writes the real useFilterStore (Zustand, not props) —
// no args to pass. Each play resets the store first so story order
// doesn't leak state between runs.
const meta = {
  component: FilterBar,
  tags: ['ai-generated'],
};

export default meta;

export const Default = {
  play: async () => {
    useFilterStore.getState().clearAll();
  },
};

// Real interaction: picking a value stages it in `draft` (not yet
// `applied`), which enables the Apply button — a genuine state
// transition, not just a rendered variant.
export const ApplyEnablesOnChange = {
  play: async ({ canvas, userEvent }) => {
    useFilterStore.getState().clearAll();
    const applyBtn = canvas.getByRole('button', { name: 'Apply' });
    await expect(applyBtn).toBeDisabled();

    const allocationSelect = canvas.getByDisplayValue('All Workforce');
    await userEvent.selectOptions(allocationSelect, 'Bench');

    await expect(applyBtn).toBeEnabled();
    await userEvent.click(applyBtn);
    await expect(useFilterStore.getState().applied.allocation).toBe('Bench');
  },
};
