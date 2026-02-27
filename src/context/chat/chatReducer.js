export const CHAT_ACTIONS = {
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
  SAVE_TO_STORAGE: 'SAVE_TO_STORAGE',
  NEW_CHAT: 'NEW_CHAT',
  SELECT_CHAT: 'SELECT_CHAT',
  SEND_USER_MESSAGE: 'SEND_USER_MESSAGE',
  START_ASSISTANT_STREAM: 'START_ASSISTANT_STREAM',
  APPEND_ASSISTANT_STREAM: 'APPEND_ASSISTANT_STREAM',
  FINISH_ASSISTANT_STREAM: 'FINISH_ASSISTANT_STREAM',
  STOP_STREAM: 'STOP_STREAM',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  RENAME_CHAT: 'RENAME_CHAT',
  DELETE_CHAT: 'DELETE_CHAT',
};

export const initialChatState = {
  chats: [],
  activeChatId: null,
  messagesByChat: {},
  isSidebarOpen: false,
  searchQuery: '',
  // streaming metadata (UI only, optional)
  streamingChatId: null,
  streamText: '',
  isStreaming: false,
};

export function chatReducer(state, action) {
  switch (action.type) {
    case CHAT_ACTIONS.LOAD_FROM_STORAGE: {
      const { chats, messagesByChat, activeChatId } = action.payload;
      const nextActive =
        activeChatId ?? (chats && chats.length > 0 ? chats[0].id : null);
      return {
        ...state,
        chats,
        messagesByChat: messagesByChat || {},
        activeChatId: nextActive,
      };
    }

    case CHAT_ACTIONS.NEW_CHAT: {
      const { id, title, createdAt } = action.payload;
      const chat = {
        id,
        title: title || 'New chat',
        createdAt: createdAt || Date.now(),
      };
      return {
        ...state,
        chats: [chat, ...state.chats],
        activeChatId: chat.id,
        messagesByChat: {
          ...state.messagesByChat,
          [chat.id]: state.messagesByChat[chat.id] || [],
        },
      };
    }

    case CHAT_ACTIONS.SELECT_CHAT: {
      return { ...state, activeChatId: action.payload.chatId };
    }

    case CHAT_ACTIONS.SEND_USER_MESSAGE: {
      const { chatId, content, createdAt } = action.payload;
      const existing = state.messagesByChat[chatId] || [];
      const userMsg = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        role: 'user',
        content,
        createdAt: createdAt || Date.now(),
      };
      const updatedMessages = [...existing, userMsg];

      const isFirst = existing.length === 0;
      const truncated =
        content.length > 40 ? `${content.slice(0, 40)}…` : content;

      const updatedChats = state.chats.map((chat) =>
        chat.id === chatId && isFirst ? { ...chat, title: truncated } : chat,
      );

      return {
        ...state,
        chats: updatedChats,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: updatedMessages,
        },
      };
    }

    case CHAT_ACTIONS.RENAME_CHAT: {
      const { chatId, title } = action.payload;
      const trimmed = title.trim();
      if (!trimmed) return state;
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === chatId ? { ...c, title: trimmed } : c,
        ),
      };
    }

    case CHAT_ACTIONS.DELETE_CHAT: {
      const { chatId } = action.payload;
      const chats = state.chats.filter((c) => c.id !== chatId);
      const { [chatId]: _removed, ...restMessages } = state.messagesByChat;
      const nextActive =
        state.activeChatId === chatId
          ? chats[0]?.id ?? null
          : state.activeChatId;

      return {
        ...state,
        chats,
        messagesByChat: restMessages,
        activeChatId: nextActive,
      };
    }

    case CHAT_ACTIONS.SET_SIDEBAR_OPEN: {
      return { ...state, isSidebarOpen: action.payload.isOpen };
    }

    case CHAT_ACTIONS.SET_SEARCH_QUERY: {
      return { ...state, searchQuery: action.payload.query };
    }

    case CHAT_ACTIONS.START_ASSISTANT_STREAM: {
      const { chatId } = action.payload;
      return {
        ...state,
        streamingChatId: chatId,
        streamText: '',
        isStreaming: true,
      };
    }

    case CHAT_ACTIONS.APPEND_ASSISTANT_STREAM: {
      return {
        ...state,
        streamText: action.payload.text,
      };
    }

    case CHAT_ACTIONS.FINISH_ASSISTANT_STREAM: {
      const { chatId, message } = action.payload;
      const existing = state.messagesByChat[chatId] || [];
      const updatedMessages = [...existing, message];
      return {
        ...state,
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: updatedMessages,
        },
        streamingChatId: null,
        streamText: '',
        isStreaming: false,
      };
    }

    case CHAT_ACTIONS.STOP_STREAM: {
      return {
        ...state,
        streamingChatId: null,
        streamText: '',
        isStreaming: false,
      };
    }

    case CHAT_ACTIONS.SAVE_TO_STORAGE: {
      // Side effects are handled in the provider; reducer remains pure.
      return state;
    }

    default:
      return state;
  }
}

