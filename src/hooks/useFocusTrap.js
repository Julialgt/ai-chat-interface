import { useEffect, useRef } from 'react';

/**
 * Traps focus inside containerRef while active.
 * On cleanup, returns focus to returnFocusRef.current.
 */
export function useFocusTrap(containerRef, isActive, options = {}) {
  const { returnFocusRef, initialFocusRef } = options;
  const previousActiveRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef?.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(container.querySelectorAll(focusableSelector));

    previousActiveRef.current = document.activeElement;

    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else {
      const focusable = getFocusable();
      if (focusable.length) focusable[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (returnFocusRef?.current && typeof returnFocusRef.current.focus === 'function') {
        returnFocusRef.current.focus();
      } else if (previousActiveRef.current && typeof previousActiveRef.current.focus === 'function') {
        previousActiveRef.current.focus();
      }
    };
  }, [isActive, containerRef, returnFocusRef, initialFocusRef]);
}
