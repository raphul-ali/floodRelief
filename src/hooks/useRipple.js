import { useCallback } from 'react';

/**
 * useRipple — Material-style ripple effect hook.
 * Spreads `rippleProps` onto any button/interactive element.
 *
 * Usage:
 *   const { rippleProps } = useRipple();
 *   <button {...rippleProps} className="ripple-btn ...">Click me</button>
 *
 * The hook injects a short-lived <span class="ripple-wave"> at the exact
 * pointer position on each click and removes it after the animation ends.
 */
export function useRipple() {
  const createRipple = useCallback((event) => {
    const button = event.currentTarget;
    if (!button) return;

    const existing = button.querySelector('.ripple-wave');
    if (existing) existing.remove();

    const rect   = button.getBoundingClientRect();
    const span   = document.createElement('span');
    span.className = 'ripple-wave';

    // Position relative to click inside the button
    const clientX = event.clientX ?? rect.left + rect.width / 2;
    const clientY = event.clientY ?? rect.top  + rect.height / 2;
    span.style.top  = `${clientY - rect.top}px`;
    span.style.left = `${clientX - rect.left}px`;

    button.appendChild(span);

    // Remove after animation (550ms matches CSS keyframe)
    const cleanup = () => { if (span.parentNode) span.parentNode.removeChild(span); };
    span.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 600); // safety fallback
  }, []);

  return {
    rippleProps: {
      onPointerDown: createRipple,
    },
  };
}
