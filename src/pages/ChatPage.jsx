import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Chat from '../components/Chat/Chat';
import Composer from '../components/Composer/Composer';
import { getChats, saveChats, getMessages, saveMessages } from '../utils/storage';
import '../styles/app.css';

const MOCK_ASSISTANT_RESPONSE =
  'Thanks for your message! This is a mock assistant response. Your ChatGPT-like UI is working.';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getInitialChats() {
  const stored = getChats();
  if (stored.length > 0) {
    return stored.map((chat) => ({
      ...chat,
      pinned: chat.pinned ?? false,
      archived: chat.archived ?? false,
    }));
  }
  const defaultChats = [
    {
      id: generateId(),
      title: 'Welcome chat',
      createdAt: Date.now(),
      pinned: false,
      archived: false,
    },
    {
      id: generateId(),
      title: 'Getting started',
      createdAt: Date.now() - 86400000,
      pinned: false,
      archived: false,
    },
  ];
  saveChats(defaultChats);
  saveMessages(defaultChats[0].id, [
    { id: generateId(), role: 'user', content: 'Hello!' },
    { id: generateId(), role: 'assistant', content: MOCK_ASSISTANT_RESPONSE },
  ]);
  return defaultChats;
}

function ChatPage({ theme = 'dark', onToggleTheme }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [typingState, setTypingState] = useState({
    chatId: null,
    isTyping: false,
    isStreaming: false,
  });
  const [streamState, setStreamState] = useState({
    chatId: null,
    fullText: '',
    renderedText: '',
    isStreaming: false,
  });
  const streamTimeoutRef = useRef(null);
  const [chatSearch, setChatSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const initialChats = getInitialChats();
    setChats(initialChats);
    if (initialChats.length > 0 && !activeChatId) {
      setActiveChatId(initialChats[0].id);
    }
  }, []);

  const loadMessagesForChat = useCallback((chatId) => {
    setMessagesByChat((prev) => {
      if (prev[chatId]) return prev;
      return { ...prev, [chatId]: getMessages(chatId) };
    });
  }, []);

  useEffect(() => {
    if (activeChatId) loadMessagesForChat(activeChatId);
  }, [activeChatId, loadMessagesForChat]);

  const currentMessages = activeChatId ? (messagesByChat[activeChatId] ?? getMessages(activeChatId)) : [];

  const visibleChats = chats
    .map((chat) => ({
      ...chat,
      pinned: chat.pinned ?? false,
      archived: chat.archived ?? false,
    }))
    .filter((chat) => !chat.archived);

  const searchedChats = chatSearch
    ? visibleChats.filter((chat) => chat.title.toLowerCase().includes(chatSearch.toLowerCase()))
    : visibleChats;

  const filteredChats = [...searchedChats].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const handleNewChat = () => {
    const newChat = {
      id: generateId(),
      title: 'New chat',
      createdAt: Date.now(),
      pinned: false,
      archived: false,
    };
    const nextChats = [newChat, ...chats];
    setChats(nextChats);
    setActiveChatId(newChat.id);
    setIsSidebarOpen(false);
    setMessagesByChat((prev) => ({ ...prev, [newChat.id]: [] }));
    saveChats(nextChats);
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    loadMessagesForChat(chatId);
    setIsSidebarOpen(false);
  };

  const handleSend = (text) => {
    let targetChatId = activeChatId;
    if (!targetChatId) {
      const newChat = {
        id: generateId(),
        title: text.slice(0, 40) + (text.length > 40 ? '…' : ''),
        createdAt: Date.now(),
        pinned: false,
        archived: false,
      };
      const nextChats = [newChat, ...chats];
      setChats(nextChats);
      setActiveChatId(newChat.id);
      targetChatId = newChat.id;
      saveChats(nextChats);
    }
    appendUserMessage(targetChatId, text);
    scheduleAssistantResponse(targetChatId);
  };

  function appendUserMessage(chatId, userContent) {
    const userMsg = { id: generateId(), role: 'user', content: userContent, createdAt: Date.now() };

    setMessagesByChat((prev) => {
      const existing = prev[chatId] ?? getMessages(chatId);
      const updated = [...existing, userMsg];
      saveMessages(chatId, updated);
      return { ...prev, [chatId]: updated };
    });

    setChats((prev) => {
      const chat = prev.find((c) => c.id === chatId);
      if (!chat) return prev;

      const storedMessages = getMessages(chatId);
      const isFirst = storedMessages.length === 1;
      const title = isFirst
        ? storedMessages[0].content.slice(0, 40) + (storedMessages[0].content.length > 40 ? '…' : '')
        : chat.title;

      const updatedChats = prev.map((c) => (c.id === chatId ? { ...c, title } : c));
      saveChats(updatedChats);
      return updatedChats;
    });
  }

  function scheduleAssistantResponse(chatId) {
    stopStreaming();

    const fullText = MOCK_ASSISTANT_RESPONSE;

    setTypingState({
      chatId,
      isTyping: true,
      isStreaming: true,
    });
    setStreamState({
      chatId,
      fullText,
      renderedText: '',
      isStreaming: true,
    });

    const step = (index) => {
      setStreamState((prev) => {
        if (!prev.isStreaming || prev.chatId !== chatId) return prev;
        const nextRendered = prev.fullText.slice(0, index + 1);
        return { ...prev, renderedText: nextRendered };
      });

      const nextIndex = index + 1;
      if (nextIndex >= fullText.length) {
        const assistantMsg = {
          id: generateId(),
          role: 'assistant',
          content: fullText,
          createdAt: Date.now(),
        };

        setMessagesByChat((prev) => {
          const existing = prev[chatId] ?? getMessages(chatId);
          const updated = [...existing, assistantMsg];
          saveMessages(chatId, updated);
          return { ...prev, [chatId]: updated };
        });

        setTypingState((prev) =>
          prev.chatId === chatId
            ? {
                chatId: null,
                isTyping: false,
                isStreaming: false,
              }
            : prev,
        );
        setStreamState((prev) =>
          prev.chatId === chatId
            ? {
                chatId: null,
                fullText: '',
                renderedText: '',
                isStreaming: false,
              }
            : prev,
        );
        streamTimeoutRef.current = null;
        return;
      }

      streamTimeoutRef.current = setTimeout(() => step(nextIndex), 25);
    };

    streamTimeoutRef.current = setTimeout(() => step(0), 280);
  }

  function stopStreaming() {
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }
    setTypingState({
      chatId: null,
      isTyping: false,
      isStreaming: false,
    });
    setStreamState({
      chatId: null,
      fullText: '',
      renderedText: '',
      isStreaming: false,
    });
  }

  const handleSendPrompt = (prompt) => {
    handleSend(prompt);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((open) => !open);
  };

  const isActiveTyping = typingState.chatId === activeChatId && typingState.isTyping;
  const isActiveStreaming = typingState.chatId === activeChatId && typingState.isStreaming;
  const isStreamingAny = typingState.isStreaming;

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  const handleRenameChat = (chatId, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setChats((prev) => {
      const updated = prev.map((c) => (c.id === chatId ? { ...c, title: trimmed } : c));
      saveChats(updated);
      return updated;
    });
  };

  const handleDeleteChat = (chatId) => {
    setChats((prev) => {
      const updated = prev.filter((c) => c.id !== chatId);
      saveChats(updated);
      if (activeChatId === chatId) {
        setActiveChatId(updated[0]?.id ?? null);
      }
      return updated;
    });

    setMessagesByChat((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });

    // Clear persisted messages for this chat
    saveMessages(chatId, []);

    if (typingState.chatId === chatId || streamState.chatId === chatId) {
      stopStreaming();
    }
  };

  const handleTogglePinChat = (chatId) => {
    setChats((prev) => {
      const updated = prev.map((c) =>
        c.id === chatId ? { ...c, pinned: !c.pinned } : c,
      );
      saveChats(updated);
      return updated;
    });
  };

  const handleArchiveChat = (chatId) => {
    setChats((prev) => {
      const updated = prev.map((c) =>
        c.id === chatId ? { ...c, archived: true } : c,
      );
      saveChats(updated);

      if (activeChatId === chatId) {
        const nextActive = updated.find((c) => !c.archived && c.id !== chatId)?.id ?? null;
        setActiveChatId(nextActive);
      }

      return updated;
    });
  };

  const handleStopStreaming = () => {
    stopStreaming();
  };

  const handleRegenerate = () => {
    if (!activeChatId) return;
    const msgs = currentMessages;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    scheduleAssistantResponse(activeChatId);
  };

  const canRegenerate =
    !isStreamingAny && currentMessages && currentMessages.some((m) => m.role === 'assistant');

  return (
    <div className="app">
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar
          chats={filteredChats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          searchValue={chatSearch}
          onSearchChange={setChatSearch}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>
      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <main className="main">
        <Chat
          messages={currentMessages}
          isTyping={isActiveTyping}
          isStreaming={isActiveStreaming}
          streamText={streamState.chatId === activeChatId ? streamState.renderedText : ''}
          onSendPrompt={handleSendPrompt}
          onToggleSidebar={toggleSidebar}
          canRegenerate={canRegenerate}
          onRegenerate={handleRegenerate}
          onStopStreaming={handleStopStreaming}
          theme={theme}
          onToggleTheme={onToggleTheme}
          activeChatId={activeChatId}
          activeChat={activeChat}
          onTogglePinChat={handleTogglePinChat}
          onArchiveChat={handleArchiveChat}
          onDeleteChat={handleDeleteChat}
        />
        <Composer
          onSend={handleSend}
          disabled={false}
          isStreaming={isStreamingAny}
          onStop={handleStopStreaming}
        />
      </main>
    </div>
  );
}

export default ChatPage;
