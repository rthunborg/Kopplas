import React from 'react';

export function Metric({ label, value, unit, delta, deltaTone = 'neutral', size = 'md', style, ...rest }) {
  const sizes = { sm: 'var(--size-2xl)', md: 'var(--size-3xl)', lg: 'var(--size-4xl)' };
  const tones = { up: 'var(--text-ok)', down: 'var(--text-risk)', neutral: 'var(--text-secondary)' };
  return (
    <div style={style} {...rest}>
      <div style={{ fontSize: 'var(--size-3xs)', letterSpacing: 'var(--track-caps)', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
        <span style={{ fontSize: sizes[size], fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        {unit ? <span style={{ fontSize: 'var(--size-sm)', color: 'var(--text-secondary)' }}>{unit}</span> : null}
        {delta ? <span style={{ fontSize: 'var(--size-2xs)', color: tones[deltaTone], fontVariantNumeric: 'tabular-nums' }}>{delta}</span> : null}
      </div>
    </div>
  );
}
