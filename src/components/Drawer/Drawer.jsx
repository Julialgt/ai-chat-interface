import { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export default function Drawer({ open, title, onClose, children, returnFocusRef }) {
  const panelRef = useRef(null);

  useFocusTrap(panelRef, open, { returnFocusRef });

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="drawer-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <aside
        ref={panelRef}
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="drawer-header">
          <h2 className="drawer-title">{title}</h2>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}
