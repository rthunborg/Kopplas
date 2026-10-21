import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Input({ icon, suffix, invalid = false, size = 'md', style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'lg' ? 'var(--control-h-lg)' : size === 'sm' ? 'var(--control-h-sm)' : 'var(--control-h-md)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-4)', height: h,
      padding: '0 var(--space-5)', background: rest.disabled ? 'var(--bg-inset)' : 'var(--bg-page)',
      border: '1px solid ' + (invalid ? 'var(--risk-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
      boxShadow: focus ? '0 0 0 1px var(--border-focus)' : 'none',
      borderRadius: 'var(--radius-control)', transition: 'var(--transition-control)', ...style,
    }}>
      {icon ? <Icon name={icon} size={14} style={{ color: 'var(--text-tertiary)' }} /> : null}
      <input
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent',
          fontFamily: 'var(--font-core)', fontSize: size === 'lg' ? 'var(--size-md)' : 'var(--size-xs)',
          color: rest.disabled ? 'var(--text-disabled)' : 'var(--text-primary)', letterSpacing: 'var(--track-body)',
        }}
        {...rest}
      />
      {suffix ? <span style={{ fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{suffix}</span> : null}
    </div>
  );
}
