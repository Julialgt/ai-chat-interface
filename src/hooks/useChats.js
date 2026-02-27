import { useContext } from 'react';
import { ChatContext } from '../context/chat/ChatProvider';

export default function useChats() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChats must be used within a ChatProvider');
  }
  return ctx;
}

