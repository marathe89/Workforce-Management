import { expect, within } from 'storybook/test';
import LightboxModal from './LightboxModal';

// Portals to document.body (see LightboxModal.jsx's own comment on why),
// so queries must go through canvasElement.ownerDocument.body, not the
// normal `canvas` — Storybook's default canvas only covers the story's
// own mount point, which a portal renders outside of.
const meta = {
  component: LightboxModal,
  tags: ['ai-generated'],
};

export default meta;

export const Default = {
  args: {
    titleId: 'story-modal-title',
    width: 480,
    onClose: () => {},
    children: (
      <>
        <h2 id="story-modal-title">Assign Workforce</h2>
        <p>Pick a role and confirm the allocation.</p>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    // The portal must land role="dialog" + aria-modal="true" on
    // document.body, not inside the story's own mount node.
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(body.getByText('Assign Workforce')).toBeVisible();
    await expect(body.getByLabelText('Close')).toBeVisible();
  },
};
