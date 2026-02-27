import { useState, useRef, useEffect } from 'react';

function Composer({ onSend, disabled, isStreaming, onStop }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const canSend = value.trim().length > 0 && !disabled && !isStreaming;

  const send = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (isStreaming) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleButtonClick = () => {
    if (isStreaming) {
      if (onStop) onStop();
      return;
    }
    send();
  };

  return (
    <div className="composer-wrap">
      <div className="composer-inner">
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder="Message…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
        />
        <button
          type="button"
          className="composer-send"
          onClick={handleButtonClick}
          disabled={!canSend}
          title={isStreaming ? 'Stop generating' : 'Send'}
          aria-label={isStreaming ? 'Stop generating' : 'Send message'}
        >
          {isStreaming ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" rx="1.5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default Composer;
