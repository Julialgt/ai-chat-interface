import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

function ComingSoonModal({ open, title, onClose, returnFocusTo }) {
  const closeButtonRef = useRef(null);
  const lastTriggerRef = useRef(returnFocusTo || null);

  useEffect(() => {
    lastTriggerRef.current = returnFocusTo || null;
  }, [returnFocusTo]);

  useEffect(() => {
    if (!open) return;

    const close = () => {
      if (onClose) onClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (lastTriggerRef.current && typeof lastTriggerRef.current.focus === 'function') {
        lastTriggerRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && onClose) {
      onClose();
    }
  };

  const dialogTitleId = 'coming-soon-title';

  return (
    <div
      className="cs-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="cs-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
      >
        <header className="cs-modal-header">
          <h2 id={dialogTitleId} className="cs-modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="cs-modal-close"
            onClick={onClose}
            ref={closeButtonRef}
            aria-label="Close dialog"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className="cs-modal-body">
          <p className="cs-modal-main">Coming soon</p>
          <p className="cs-modal-sub">This section isn’t available yet.</p>
        </div>
      </div>
    </div>
  );
}

export default ComingSoonModal;

