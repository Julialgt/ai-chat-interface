import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareModal from '../components/Share/ShareModal';

afterEach(() => {
  cleanup();
});

describe('ShareModal', () => {
  it('renders when open is true', () => {
    render(<ShareModal open onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: /share chat/i })).toBeInTheDocument();
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShareModal open onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking on the backdrop', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ShareModal open onClose={onClose} />);

    const overlay = screen.getByRole('dialog', { name: /share chat/i }).parentElement;
    await user.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

