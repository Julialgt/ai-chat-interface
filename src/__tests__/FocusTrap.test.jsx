import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareModal from '../components/Share/ShareModal';

afterEach(() => {
  cleanup();
});

describe('Focus trap in ShareModal', () => {
  it('moves initial focus inside the modal when opened', () => {
    render(<ShareModal open onClose={() => {}} />);

    const closeButton = screen.getByRole('button', { name: /close share dialog/i });
    expect(document.activeElement).toBe(closeButton);
  });

  it('keeps Tab focus cycling within the modal', async () => {
    const user = userEvent.setup();
    render(<ShareModal open onClose={() => {}} />);

    const dialog = screen.getByRole('dialog', { name: /share chat/i });
    const buttons = dialog.querySelectorAll('button');

    // Tab through all buttons plus one extra to verify we wrap
    for (let i = 0; i < buttons.length; i += 1) {
      await user.tab();
    }

    // After cycling past the last focusable, focus should wrap back to the first
    expect(document.activeElement).toBe(buttons[0]);
  });
});

