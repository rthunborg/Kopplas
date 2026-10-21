import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Toast({ message, tone = 'neutral', action, onDismiss, style, ...rest }) {
  const icons = { neutral: null, ok: 'circle-check', risk: 'octagon-alert' };
  const icon = icons[tone];
  return (
    <div role="status" style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-5)',
      padding: 'var(--space-5) var(--space-6)', background: 'var(--n-950)', color: 'var(--n-000)',
      borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lg)', fontSize: 'var(--size-xs)', ...style,
    }} {...rest}>
      {icon ? <Icon name={icon} size={15} style={{ color: tone === 'ok' ? 'var(--signal-400)' : 'var(--n-000)' }} /> : null}
      <span>{message}</span>
      {action ? <span style={{ marginLeft: 'var(--space-3)' }}>{action}</span> : null}
      {onDismiss ? (
        <button onClick={onDismiss} aria-label="Stäng" style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--n-400)', padding: 0, display: 'inline-flex' }}>
          <Icon name="x" size={14} />
        </button>
      ) : null}
    </div>
  );
}
