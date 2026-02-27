import { createContext, useEffect, useMemo, useReducer } from 'react';
import { chatReducer, initialChatState, CHAT_ACTIONS } from './chatReducer';
import { getChats, getMessages, saveChats, saveMessages } from '../../utils/storage';

export const ChatContext = createContext(null);

const MOCK_ASSISTANT_RESPONSE =
  'Thanks for your message! This is a mock assistant response. Your ChatGPT-like UI is working.';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function bootstrapFromStorage() {
  const storedChats = getChats();
  if (storedChats.length > 0) {
    const messagesByChat = storedChats.reduce((acc, chat) => {
      acc[chat.id] = getMessages(chat.id);
      return acc;
    }, {});
    return { chats: storedChats, messagesByChat };
  }

  // Seed with a simple default conversation when nothing is stored yet.
  const firstChatId = generateId();
  const secondChatId = generateId();

  const chats = [
    { id: firstChatId, title: 'Welcome chat', createdAt: Date.now() },
    { id: secondChatId, title: 'Getting started', createdAt: Date.now() - 86400000 },
  ];

  const messagesByChat = {
    [firstChatId]: [
      { id: generateId(), role: 'user', content: 'Hello!', createdAt: Date.now() },
      {
        id: generateId(),
        role: 'assistant',
        content: MOCK_ASSISTANT_RESPONSE,
        createdAt: Date.now(),
      },
    ],
  };

  saveChats(chats);
  Object.entries(messagesByChat).forEach(([chatId, messages]) => {
    saveMessages(chatId, messages);
  });

  return { chats, messagesByChat };
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  // Initial load from localStorage (or bootstrap defaults).
  useEffect(() => {
    const { chats, messagesByChat } = bootstrapFromStorage();
    dispatch({
      type: CHAT_ACTIONS.LOAD_FROM_STORAGE,
      payload: { chats, messagesByChat },
    });
  }, []);

  // Persist chats and messages to localStorage whenever they change.
  useEffect(() => {
    if (!state.chats || state.chats.length === 0) return;
    saveChats(state.chats);
    Object.entries(state.messagesByChat || {}).forEach(([chatId, messages]) => {
      saveMessages(chatId, messages);
    });
  }, [state.chats, state.messagesByChat]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state, dispatch],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

