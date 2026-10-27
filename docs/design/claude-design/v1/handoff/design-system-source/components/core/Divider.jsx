import React from 'react';

export function Divider({ vertical = false, label, style, ...rest }) {
  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', ...style }} {...rest}>
        <span style={{ fontSize: 'var(--size-3xs)', letterSpacing: 'var(--track-caps)', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{label}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
      </div>
    );
  }
  return <span style={{
    display: 'block', flex: '0 0 auto',
    width: vertical ? 1 : '100%', height: vertical ? '100%' : 1,
    background: 'var(--border-default)', ...style,
  }} {...rest} />;
}
