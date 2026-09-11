import { expect } from 'storybook/test';
import { Banner } from './FormBits';

// FormBits.jsx exports several small primitives (Field, TextInput,
// SelectInput, Banner, plus shared style constants) — Banner is the only
// one that's a real standalone visual component; the others are thin
// wrappers meant to be composed inside a form (see DataEntry.jsx), not
// meaningful in isolation.
const meta = {
  component: Banner,
  tags: ['ai-generated'],
};

export default meta;

// DataEntry.jsx's real info banner text.
export const Info = {
  args: {
    tone: 'info',
    children: 'This page writes to the real backend (Express + Postgres).',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/writes to the real backend/i)).toBeVisible();
  },
};

// EmployeeFormPage.jsx's real success-state text.
export const Success = {
  args: {
    tone: 'success',
    children: '✓ Meera Iyer created (user #12) — profile and 2 skills saved.',
  },
};

// EmployeeFormPage.jsx's real error-state text.
export const Error = {
  args: {
    tone: 'error',
    children: 'Failed while creating the account: Email already exists',
  },
};
