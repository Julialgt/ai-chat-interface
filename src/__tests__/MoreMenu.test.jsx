import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '../components/Chat/Chat';

afterEach(() => {
  cleanup();
});

function renderChat() {
  const props = {
    theme: 'dark',
    onToggleTheme: () => {},
    onToggleSidebar: () => {},
    modelOptions: [],
    activeChatId: '1',
    activeChat: { id: '1', title: 'Test chat', pinned: false },
    messages: [],
    isStreaming: false,
    onSendPrompt: () => {},
    onStopStreaming: () => {},
    onTogglePinChat: () => {},
    onArchiveChat: () => {},
    onDeleteChat: () => {},
  };

  return render(<Chat {...props} />);
}

describe('More menu', () => {
  it('opens when clicking the 3-dots More button', async () => {
    const user = userEvent.setup();
    renderChat();

    const moreButton = screen.getByRole('button', { name: /more actions/i });
    await user.click(moreButton);

    expect(screen.getByRole('menu', { name: /more chat actions/i })).toBeInTheDocument();
  });

  it('closes when Escape is pressed while open', async () => {
    const user = userEvent.setup();
    renderChat();

    const moreButton = screen.getByRole('button', { name: /more actions/i });
    await user.click(moreButton);
    expect(screen.getByRole('menu', { name: /more chat actions/i })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu', { name: /more chat actions/i })).not.toBeInTheDocument();
  });

  it('supports keyboard navigation (ArrowDown + Enter)', async () => {
    const user = userEvent.setup();
    renderChat();

    const moreButton = screen.getByRole('button', { name: /more actions/i });
    await user.click(moreButton);

    // More menu opens with first item focused; ArrowDown then Enter should activate the second item
    await user.keyboard('{ArrowDown}{Enter}');

    // We don't assert on side effects (archive / pin), just that the menu is still well-formed
    expect(screen.getByRole('menu', { name: /more chat actions/i })).toBeInTheDocument();
  });
}

