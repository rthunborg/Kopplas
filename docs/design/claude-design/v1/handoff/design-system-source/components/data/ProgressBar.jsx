import React from 'react';

export function ProgressBar({ value = 0, label, valueLabel, tone = 'ink', height = 4, style, ...rest }) {
  const tones = { ink: 'var(--n-950)', signal: 'var(--signal-400)', ok: 'var(--ok-500)', risk: 'var(--risk-500)' };
  return (
    <div style={style} {...rest}>
      {label || valueLabel ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-5)', marginBottom: 'var(--space-3)', fontSize: 'var(--size-2xs)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{valueLabel}</span>
        </div>
      ) : null}
      <div role="progressbar" aria-valuenow={value} style={{ height, background: 'var(--n-150)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <div style={{ width: Math.max(0, Math.min(100, value)) + '%', height: '100%', background: tones[tone], transition: 'width var(--dur-base) var(--ease-standard)' }} />
      </div>
    </div>
  );
}
