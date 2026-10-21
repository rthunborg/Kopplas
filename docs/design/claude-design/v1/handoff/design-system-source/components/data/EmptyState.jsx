import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function EmptyState({ icon = 'inbox', title, description, action, style, ...rest }) {
  return (
    <div style={{ display: 'grid', justifyItems: 'center', textAlign: 'center', padding: 'var(--space-12) var(--space-8)', gap: 'var(--space-4)', ...style }} {...rest}>
      <Icon name={icon} size={28} style={{ color: 'var(--text-tertiary)' }} />
      <div style={{ fontSize: 'var(--size-lg)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-heading)', marginTop: 'var(--space-3)' }}>{title}</div>
      {description ? <div style={{ fontSize: 'var(--size-xs)', color: 'var(--text-secondary)', maxWidth: 320 }}>{description}</div> : null}
      {action ? <div style={{ marginTop: 'var(--space-5)' }}>{action}</div> : null}
    </div>
  );
}
