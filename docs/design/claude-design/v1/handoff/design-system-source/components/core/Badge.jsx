import React from 'react';

const badgeTones = {
  neutral: { background: 'var(--bg-sunken)', color: 'var(--text-secondary)' },
  ink: { background: 'var(--n-950)', color: 'var(--n-000)' },
  ok: { background: 'var(--ok-050)', color: 'var(--ok-700)' },
  warn: { background: 'var(--warn-050)', color: 'var(--warn-700)' },
  risk: { background: 'var(--risk-050)', color: 'var(--risk-700)' },
  info: { background: 'var(--info-050)', color: 'var(--info-700)' },
  signal: { background: 'var(--signal-200)', color: 'var(--signal-700)' },
};

export function Badge({ children, tone = 'neutral', style, ...rest }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
      fontSize: 'var(--size-3xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-label)',
      padding: '3px var(--space-4)', borderRadius: 'var(--radius-xs)', whiteSpace: 'nowrap',
      ...badgeTones[tone], ...style,
    }} {...rest}>{children}</span>
  );
}
