import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import '../src/index.css';

// Real root CSS (the --w-* theme tokens every component's inline styles
// read from) + a MemoryRouter, since most components in this app call
// useNavigate/Link directly (no router-agnostic layer) and would throw
// without a Router ancestor. No other providers exist in this app —
// shared state (auth/theme/filters/profile/access) is plain Zustand
// stores, not React context, so nothing else needs wrapping here.
/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default preview;