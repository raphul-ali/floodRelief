import React from 'react';
import { useRipple } from '../../hooks/useRipple';

/**
 * RippleButton — Drop-in replacement for <button> with Material-style ripple.
 *
 * Props:
 *  variant  — 'sos' | 'relief' | 'primary' | 'emerald' | 'glass' | 'dark-ghost' | 'custom'
 *  darkRipple — boolean, use dark ripple wave (for light-surface buttons)
 *  className — additional Tailwind / CSS classes
 *  All other props forwarded to <button>
 */
export default function RippleButton({
  variant = 'primary',
  darkRipple = false,
  className = '',
  children,
  ...rest
}) {
  const { rippleProps } = useRipple();

  const variantClass = {
    sos:        'btn-base btn-sos',
    relief:     'btn-base btn-relief',
    primary:    'btn-base btn-indigo',
    emerald:    'btn-base btn-emerald',
    glass:      'btn-base btn-glass',
    'dark-ghost': 'btn-base btn-dark-ghost',
    custom:     '',           // caller provides full class
  }[variant] ?? 'btn-base btn-indigo';

  return (
    <button
      {...rest}
      {...rippleProps}
      onPointerDown={(e) => {
        rippleProps.onPointerDown(e);
        rest.onPointerDown?.(e);
      }}
      className={`ripple-btn ${darkRipple ? 'ripple-dark' : ''} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}
