import { useEffect, useRef } from 'react';
import { X, Link2, Linkedin, MessageCircle } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

function ShareModal({ open, onClose, shareUrl, shareTitle, onCopyLink, returnFocusRef }) {
  const closeButtonRef = useRef(null);
  const panelRef = useRef(null);

  useFocusTrap(panelRef, open, { returnFocusRef, initialFocusRef: closeButtonRef });

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = previousOverflow;
      };
    }
  }, [open]);

  if (!open) return null;

  const url = shareUrl || window.location.href;
  const title = shareTitle || 'AI Conversation Interface';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const openShareWindow = (href) => {
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="cs-modal-overlay share-modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={panelRef}
        className="cs-modal share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <header className="share-modal-header">
          <h2 id="share-modal-title" className="share-modal-title">
            Share chat
          </h2>
          <button
            type="button"
            className="cs-modal-close"
            onClick={onClose}
            aria-label="Close share dialog"
            ref={closeButtonRef}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="share-modal-body">
          <div className="share-options-row">
            <button
              type="button"
              className="share-option"
              onClick={onCopyLink}
              aria-label="Copy link"
            >
              <span className="share-option-circle" aria-hidden="true">
                <Link2 size={18} />
              </span>
              <span className="share-option-label">Copy link</span>
            </button>
            <button
              type="button"
              className="share-option"
              aria-label="Share on X"
              onClick={() =>
                openShareWindow(
                  `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
                )
              }
            >
              <span className="share-option-circle" aria-hidden="true">
                <span className="share-option-glyph">X</span>
              </span>
              <span className="share-option-label">X</span>
            </button>
            <button
              type="button"
              className="share-option"
              aria-label="Share on LinkedIn"
              onClick={() =>
                openShareWindow(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
                )
              }
            >
              <span className="share-option-circle" aria-hidden="true">
                <Linkedin size={18} />
              </span>
              <span className="share-option-label">LinkedIn</span>
            </button>
            <button
              type="button"
              className="share-option"
              aria-label="Share on Reddit"
              onClick={() =>
                openShareWindow(
                  `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
                )
              }
            >
              <span className="share-option-circle" aria-hidden="true">
                <MessageCircle size={18} />
              </span>
              <span className="share-option-label">Reddit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;

