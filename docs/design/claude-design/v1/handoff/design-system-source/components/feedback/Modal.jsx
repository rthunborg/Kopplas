import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Modal({ open = true, title, description, children, footer, onClose, width = 520, style, ...rest }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', padding: 'var(--space-8)' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--bg-scrim)' }} />
      <div role="dialog" aria-modal="true" style={{
        position: 'relative', width: '100%', maxWidth: width, background: 'var(--surface-card)',
        borderRadius: 'var(--radius-sheet)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        animation: 'none', ...style,
      }} {...rest}>
        <header style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', padding: 'var(--space-8) var(--space-8) var(--space-6)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 'var(--size-lg)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-heading)' }}>{title}</h2>
            {description ? <p style={{ fontSize: 'var(--size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-3)' }}>{description}</p> : null}
          </div>
          {onClose ? (
            <button onClick={onClose} aria-label="Stäng" style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0, display: 'inline-flex' }}>
              <Icon name="x" size={16} />
            </button>
          ) : null}
        </header>
        {children ? <div style={{ padding: '0 var(--space-8) var(--space-8)' }}>{children}</div> : null}
        {footer ? (
          <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', padding: 'var(--space-6) var(--space-8)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}
