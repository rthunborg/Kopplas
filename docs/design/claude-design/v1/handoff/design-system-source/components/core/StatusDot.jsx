import React from 'react';

const dotColors = {
  draft: 'var(--n-400)',
  planned: 'var(--info-500)',
  active: 'var(--signal-500)',
  waiting: 'var(--warn-500)',
  done: 'var(--ok-500)',
  deviation: 'var(--risk-500)',
};

export function StatusDot({ status = 'draft', label, size = 6, style, ...rest }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--size-sm)', color: 'var(--text-primary)', ...style }} {...rest}>
      <span style={{ width: size, height: size, borderRadius: 'var(--radius-pill)', background: dotColors[status], flex: '0 0 auto' }} />
      {label}
    </span>
  );
}
