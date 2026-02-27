const CHATS_KEY = 'chatgpt-clone-chats';
const MESSAGES_PREFIX = 'chatgpt-clone-messages-';

/**
 * Load all chats from localStorage.
 * @returns {Array<{ id: string, title: string, createdAt: number }>}
 */
export function getChats() {
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save all chats to localStorage.
 * @param {Array<{ id: string, title: string, createdAt: number }>} chats
 */
export function saveChats(chats) {
  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  } catch (e) {
    console.warn('Failed to save chats:', e);
  }
}

/**
 * Load messages for a chat from localStorage.
 * @param {string} chatId
 * @returns {Array<{ id: string, role: 'user'|'assistant', content: string }>}
 */
export function getMessages(chatId) {
  try {
    const raw = localStorage.getItem(MESSAGES_PREFIX + chatId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save messages for a chat to localStorage.
 * @param {string} chatId
 * @param {Array<{ id: string, role: 'user'|'assistant', content: string }>} messages
 */
export function saveMessages(chatId, messages) {
  try {
    localStorage.setItem(MESSAGES_PREFIX + chatId, JSON.stringify(messages));
  } catch (e) {
    console.warn('Failed to save messages:', e);
  }
}
