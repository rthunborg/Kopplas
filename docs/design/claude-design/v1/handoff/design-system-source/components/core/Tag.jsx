import React from 'react';
import { Icon } from './Icon.jsx';

export function Tag({ children, onRemove, icon, style, ...rest }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)',
      fontSize: 'var(--size-2xs)', color: 'var(--text-primary)',
      padding: '4px var(--space-4)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xs)', background: 'var(--bg-page)', ...style,
    }} {...rest}>
      {icon ? <Icon name={icon} size={12} style={{ color: 'var(--text-tertiary)' }} /> : null}
      {children}
      {onRemove ? (
        <button onClick={onRemove} aria-label="Ta bort" style={{ display: 'inline-flex', border: 0, background: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-tertiary)' }}>
          <Icon name="x" size={12} />
        </button>
      ) : null}
    </span>
  );
}
