import { useCallback, useRef, useState } from 'react';

const INITIAL_DELAY_MS = 260;
const STEP_DELAY_MS = 26;

export default function useStreamingText() {
  const [streamState, setStreamState] = useState({
    chatId: null,
    fullText: '',
    renderedText: '',
    isStreaming: false,
  });
  const timeoutRef = useRef(null);
  const completionRef = useRef(null);

  const stopStreaming = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    completionRef.current = null;
    setStreamState({
      chatId: null,
      fullText: '',
      renderedText: '',
      isStreaming: false,
    });
  }, []);

  const startStreaming = useCallback(
    (chatId, fullText, onComplete) => {
      stopStreaming();
      completionRef.current = onComplete || null;

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
          const finalText = fullText;
          setStreamState((prev) =>
            prev.chatId === chatId
              ? { ...prev, renderedText: finalText, isStreaming: false }
              : prev,
          );
          if (completionRef.current) {
            completionRef.current(finalText, chatId);
          }
          timeoutRef.current = null;
          completionRef.current = null;
          return;
        }

        timeoutRef.current = setTimeout(() => step(nextIndex), STEP_DELAY_MS);
      };

      timeoutRef.current = setTimeout(() => step(0), INITIAL_DELAY_MS);
    },
    [stopStreaming],
  );

  return {
    streamState,
    startStreaming,
    stopStreaming,
  };
}

