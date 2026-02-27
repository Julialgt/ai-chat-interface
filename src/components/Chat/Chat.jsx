import { useEffect, useRef, useState } from 'react';
import ComingSoonModal from '../Sidebar/ComingSoonModal';
import AboutDrawer from '../Drawer/AboutDrawer';
import ShareModal from '../Share/ShareModal';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { parseMessageParts } from '../../utils/parseMessageParts';
import { copyToClipboard } from '../../utils/clipboard';
import { Share2 } from 'lucide-react';

const MODEL_OPTIONS = ['GPT-4o', 'GPT-4o mini', 'Local Mock Model'];

function IconInfo(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function IconSun(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconMoon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function Chat({
  messages,
  isTyping,
  isStreaming,
  streamText,
  onSendPrompt,
  onToggleSidebar,
  canRegenerate,
  onRegenerate,
  onStopStreaming,
  theme = 'dark',
  onToggleTheme,
  activeChatId,
  activeChat,
  onTogglePinChat,
  onArchiveChat,
  onDeleteChat,
}) {
  const scrollRef = useRef(null);
  const dropdownRef = useRef(null);
  const moreMenuRef = useRef(null);
  const moreButtonRef = useRef(null);
  const aboutButtonRef = useRef(null);
  const shareButtonRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const reportModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [comingSoon, setComingSoon] = useState({ open: false, title: '' });
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [aboutDrawerOpen, setAboutDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [toast, setToast] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);

  useFocusTrap(reportModalRef, reportOpen, { returnFocusRef: moreButtonRef });
  useFocusTrap(deleteModalRef, deleteConfirmOpen, { returnFocusRef: moreButtonRef });

  useEffect(() => {
    if (reportOpen || deleteConfirmOpen) {
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = prev;
      };
    }
  }, [reportOpen, deleteConfirmOpen]);

  useEffect(() => {
    if (!modelDropdownOpen) return;
    const list = dropdownRef.current?.querySelector('[role="listbox"]');
    const options = list ? Array.from(list.querySelectorAll('[role="option"] button')) : [];
    const selectedIdx = MODEL_OPTIONS.indexOf(selectedModel);
    if (options[selectedIdx]) {
      requestAnimationFrame(() => options[selectedIdx].focus());
    }

    const handleKey = (e) => {
      const current = document.activeElement;
      const idx = options.indexOf(current);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (idx < options.length - 1) options[idx + 1]?.focus();
        else options[0]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx > 0) options[idx - 1]?.focus();
        else options[options.length - 1]?.focus();
      } else if ((e.key === 'Enter' || e.key === ' ') && idx >= 0) {
        e.preventDefault();
        options[idx]?.click();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modelDropdownOpen, selectedModel]);

  useEffect(() => {
    if (!moreOpen) return;
    const menu = moreMenuRef.current?.querySelector('[role="menu"]');
    const items = menu ? Array.from(menu.querySelectorAll('[role="menuitem"]')) : [];
    if (items[0]) {
      requestAnimationFrame(() => items[0].focus());
    }

    const handleKey = (e) => {
      if (e.key === 'Escape') return;
      const focused = document.activeElement;
      const idx = items.indexOf(focused);
      if (e.key === 'ArrowDown' && idx < items.length - 1) {
        e.preventDefault();
        items[idx + 1]?.focus();
      } else if (e.key === 'ArrowUp' && idx > 0) {
        e.preventDefault();
        items[idx - 1]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [moreOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setModelDropdownOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setMoreOpen(false);
        if (moreButtonRef.current) {
          moreButtonRef.current.focus();
        }
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (reportOpen) {
          setReportOpen(false);
          if (moreButtonRef.current) moreButtonRef.current.focus();
        } else if (deleteConfirmOpen) {
          setDeleteConfirmOpen(false);
          if (moreButtonRef.current) moreButtonRef.current.focus();
        } else if (moreOpen) {
          setMoreOpen(false);
          if (moreButtonRef.current) moreButtonRef.current.focus();
        } else {
          setModelDropdownOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreOpen, reportOpen, deleteConfirmOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping, isStreaming]);

  useEffect(() => {
    const title = activeChat?.title
      ? `${activeChat.title} — AI Conversation`
      : 'AI Conversation';
    document.title = title;
    return () => {
      document.title = 'AI Conversation';
    };
  }, [activeChat?.title]);

  const hasMessages = messages && messages.length > 0;

  const showToast = (message) => {
    setToast(message);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 2000);
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    if (activeChatId) {
      url.searchParams.set('chat', activeChatId);
    }
    return url.toString();
  };

  const handleCopyShareLink = async () => {
    const shareUrl = getShareUrl();
    const ok = await copyToClipboard(shareUrl);
    showToast(ok ? 'Link copied' : 'Unable to copy link');
  };

  const handleStartGroupChat = () => {
    setMoreOpen(false);
    if (moreButtonRef.current) moreButtonRef.current.focus();
    openComingSoon('Start group chat');
  };

  const handlePinToggle = () => {
    if (!activeChatId || !onTogglePinChat) return;
    onTogglePinChat(activeChatId);
    setMoreOpen(false);
    if (moreButtonRef.current) moreButtonRef.current.focus();
    showToast(activeChat?.pinned ? 'Unpinned chat' : 'Pinned chat');
  };

  const handleArchive = () => {
    if (!activeChatId || !onArchiveChat) return;
    onArchiveChat(activeChatId);
    setMoreOpen(false);
    if (moreButtonRef.current) moreButtonRef.current.focus();
    showToast('Archived chat');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportOpen(false);
    setMoreOpen(false);
    setReportText('');
    showToast('Report submitted');
  };

  const handleDeleteRequest = () => {
    setDeleteConfirmOpen(true);
    setMoreOpen(false);
  };

  const handleConfirmDelete = () => {
    if (activeChatId && onDeleteChat) {
      onDeleteChat(activeChatId);
    }
    setDeleteConfirmOpen(false);
    showToast('Chat deleted');
  };

  const handleCopy = async (id, text) => {
    const ok = await copyToClipboard(text);
    if (!ok) return;
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1200);
  };

  const handleCodeCopy = async (id, code) => {
    await handleCopy(id, code);
  };

  const openComingSoon = (title) => {
    setComingSoon({ open: true, title });
  };

  const closeComingSoon = () => {
    setComingSoon({ open: false, title: '' });
  };

  return (
    <>
      <header className="chat-header">
        <div className="chat-header-left">
          <button
            type="button"
            className="header-menu-button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="chat-header-brand">
            <div className="chat-header-title-row">
              <h1 className="chat-header-title-main">AI Chat Interface — GPT-4o Inspired</h1>
              <div className="chat-header-model-wrap" ref={dropdownRef}>
                <button
                  type="button"
                  className="chat-header-model-trigger"
                  onClick={() => setModelDropdownOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={modelDropdownOpen}
                  aria-controls="chat-model-listbox"
                  aria-label="Select model"
                >
                  {selectedModel}
                  <span className="chat-header-model-chevron" aria-hidden="true">▾</span>
                </button>
                {modelDropdownOpen && (
                  <ul
                    id="chat-model-listbox"
                    className="chat-header-model-dropdown"
                    role="listbox"
                    aria-label="Model options"
                  >
                    {MODEL_OPTIONS.map((model) => (
                      <li key={model} role="option" aria-selected={selectedModel === model}>
                        <button
                          type="button"
                          className="chat-header-model-option"
                          onClick={() => {
                            setSelectedModel(model);
                            setModelDropdownOpen(false);
                          }}
                        >
                          {model}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <p className="chat-header-title-sub">React • Vite • Streaming UI • Context Architecture</p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            type="button"
            className="header-icon-button header-theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            type="button"
            className="header-icon-button"
            aria-label="About this project"
            title="About this project"
            onClick={() => setAboutDrawerOpen(true)}
            ref={aboutButtonRef}
          >
            <IconInfo aria-hidden="true" />
          </button>
          <button
            type="button"
            className="header-icon-button"
            aria-label="Share"
            title="Share"
            onClick={() => setShareOpen(true)}
            ref={shareButtonRef}
          >
            <Share2 size={18} aria-hidden="true" />
          </button>
          <div className="chat-header-more" ref={moreMenuRef}>
            <button
              type="button"
              className="header-icon-button header-icon-button-more"
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              aria-controls="chat-more-menu"
              title="More"
              onClick={() => {
                setMoreOpen((open) => !open);
              }}
              ref={moreButtonRef}
            >
              <span aria-hidden="true">⋯</span>
            </button>
            {moreOpen && (
              <div id="chat-more-menu" className="chat-more-menu" role="menu" aria-label="More chat actions">
                <button
                  type="button"
                  className="chat-more-item"
                  role="menuitem"
                  onClick={handleStartGroupChat}
                >
                  <span className="chat-more-item-icon" aria-hidden="true">
                    👥
                  </span>
                  <span className="chat-more-item-label">Start group chat</span>
                </button>
                <button
                  type="button"
                  className="chat-more-item"
                  role="menuitem"
                  onClick={handlePinToggle}
                >
                  <span className="chat-more-item-icon" aria-hidden="true">
                    📌
                  </span>
                  <span className="chat-more-item-label">
                    {activeChat?.pinned ? 'Unpin chat' : 'Pin chat'}
                  </span>
                </button>
                <button
                  type="button"
                  className="chat-more-item"
                  role="menuitem"
                  onClick={handleArchive}
                >
                  <span className="chat-more-item-icon" aria-hidden="true">
                    📂
                  </span>
                  <span className="chat-more-item-label">Archive</span>
                </button>
                <button
                  type="button"
                  className="chat-more-item"
                  role="menuitem"
                  onClick={() => {
                    setReportOpen(true);
                  }}
                >
                  <span className="chat-more-item-icon" aria-hidden="true">
                    ⚑
                  </span>
                  <span className="chat-more-item-label">Report</span>
                </button>
                <div className="chat-more-divider" role="separator" />
                <button
                  type="button"
                  className="chat-more-item chat-more-item-danger"
                  role="menuitem"
                  onClick={handleDeleteRequest}
                >
                  <span className="chat-more-item-icon" aria-hidden="true">
                    🗑
                  </span>
                  <span className="chat-more-item-label">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AboutDrawer
        open={aboutDrawerOpen}
        onClose={() => setAboutDrawerOpen(false)}
        returnFocusRef={aboutButtonRef}
      />

      <div ref={scrollRef} className="chat-scroll">
        <div className="chat-scroll-inner">
          {!hasMessages && !isStreaming && (
            <div className="chat-empty">
              <div className="chat-empty-title">AI Conversation Interface</div>
              <div className="chat-empty-subtitle">
                Start a conversation or explore one of these example prompts.
              </div>
              <div className="chat-empty-grid">
                <button
                  type="button"
                  className="chat-empty-card"
                  onClick={() => onSendPrompt('Explain React hooks in simple terms.')}
                >
                  Explain React hooks in simple terms.
                </button>
                <button
                  type="button"
                  className="chat-empty-card"
                  onClick={() => onSendPrompt('Give me ideas for a weekend side project.')}
                >
                  Give me ideas for a weekend side project.
                </button>
                <button
                  type="button"
                  className="chat-empty-card"
                  onClick={() => onSendPrompt('Help me write a professional email.')}
                >
                  Help me write a professional email.
                </button>
                <button
                  type="button"
                  className="chat-empty-card"
                  onClick={() => onSendPrompt('Summarize the latest JavaScript features.')}
                >
                  Summarize the latest JavaScript features.
                </button>
              </div>
            </div>
          )}

          {hasMessages &&
            messages.map((msg) => {
              const timeLabel = formatTime(msg.createdAt);
              const isAssistant = msg.role === 'assistant';
              const parts = parseMessageParts(msg.content);
              const isCopied = copiedId === msg.id;
              return (
                <div
                  key={msg.id}
                  className={`message message-${msg.role}`}
                >
                  <div
                    className={`message-avatar ${
                      msg.role === 'user' ? 'message-avatar-user' : 'message-avatar-assistant'
                    }`}
                  >
                    {msg.role === 'user' ? 'U' : 'G'}
                  </div>
                  <div className="message-content">
                    <div className="message-role-label">
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    <div className="message-bubble">
                      {parts.length === 0
                        ? msg.content
                        : parts.map((part, idx) =>
                            part.type === 'code' ? (
                              <div key={`${msg.id}-code-${idx}`} className="message-code-block">
                                <pre>
                                  <code>{part.content}</code>
                                </pre>
                                <button
                                  type="button"
                                  className="message-code-copy"
                                  onClick={() => handleCodeCopy(`${msg.id}-code-${idx}`, part.content)}
                                >
                                  {copiedId === `${msg.id}-code-${idx}` ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            ) : (
                              <p key={`${msg.id}-text-${idx}`} className="message-text">
                                {part.content}
                              </p>
                            ),
                          )}
                    </div>
                    <div className="message-meta-row">
                      <span className="message-timestamp">{timeLabel}</span>
                      {isAssistant && (
                        <div className="message-actions">
                          <button
                            type="button"
                            className="message-action"
                            onClick={() => handleCopy(msg.id, msg.content)}
                          >
                            {isCopied ? 'Copied' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            className="message-action"
                            onClick={() => openComingSoon('Regenerate')}
                          >
                            Regenerate
                          </button>
                          <button
                            type="button"
                            className="message-action"
                            onClick={() => openComingSoon('Edit')}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {isStreaming && (
            <div className="message message-assistant message-streaming">
              <div className="message-avatar message-avatar-assistant">G</div>
              <div className="message-content">
                <div className="message-role-label">Assistant</div>
                <div className="message-bubble">
                  {streamText || ''}
                </div>
                <div className="chat-stream-actions">
                  <button
                    type="button"
                    className="chat-stream-stop"
                    onClick={onStopStreaming}
                  >
                    Stop generating
                  </button>
                </div>
              </div>
            </div>
          )}

          {isTyping && !isStreaming && (
            <div className="typing-indicator-row">
              <div className="typing-indicator-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          {canRegenerate && (
            <div className="chat-regenerate-row">
              <button
                type="button"
                className="chat-regenerate-button"
                onClick={onRegenerate}
              >
                Regenerate response
              </button>
            </div>
          )}
        </div>
      </div>
      <ComingSoonModal
        open={comingSoon.open}
        title={comingSoon.title}
        onClose={closeComingSoon}
      />
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={getShareUrl()}
        shareTitle={activeChat?.title || 'AI Conversation Interface'}
        onCopyLink={handleCopyShareLink}
        returnFocusRef={shareButtonRef}
      />
      {reportOpen && (
        <div
          className="cs-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setReportOpen(false)}
        >
          <div
            ref={reportModalRef}
            className="cs-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-chat-title"
          >
            <header className="cs-modal-header">
              <h2 id="report-chat-title" className="cs-modal-title">
                Report chat
              </h2>
              <button
                type="button"
                className="cs-modal-close"
                onClick={() => setReportOpen(false)}
                aria-label="Close report dialog"
              >
                ×
              </button>
            </header>
            <div className="cs-modal-body">
              <form onSubmit={handleReportSubmit}>
                <p className="cs-modal-main">Briefly describe what you want to report.</p>
                <textarea
                  className="report-textarea"
                  rows={3}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                />
                <div className="confirm-modal-actions">
                  <button
                    type="button"
                    className="confirm-btn"
                    onClick={() => setReportOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="confirm-btn confirm-btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {deleteConfirmOpen && (
        <div
          className="cs-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setDeleteConfirmOpen(false)}
        >
          <div
            ref={deleteModalRef}
            className="cs-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-chat-title"
          >
            <header className="cs-modal-header">
              <h2 id="delete-chat-title" className="cs-modal-title">
                Delete chat?
              </h2>
            </header>
            <div className="cs-modal-body">
              <p className="cs-modal-main">This can’t be undone.</p>
              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="confirm-btn"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-btn confirm-btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="chat-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}

export default Chat;
