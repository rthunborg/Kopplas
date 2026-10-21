import React from 'react';

export function Radio({ label, checked, disabled = false, description, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: description ? 'flex-start' : 'center', gap: 'var(--space-4)', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 'var(--size-xs)', color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)', ...style }}>
      <input type="radio" checked={!!checked} disabled={disabled} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} {...rest} />
      <span style={{
        width: 16, height: 16, flex: '0 0 auto', marginTop: description ? 2 : 0, borderRadius: 'var(--radius-pill)',
        border: '1px solid ' + (checked ? 'var(--n-950)' : 'var(--border-strong)'),
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition-control)',
        background: 'var(--bg-page)',
      }}>
        {checked ? <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--n-950)' }} /> : null}
      </span>
      <span>
        {label}
        {description ? <span style={{ display: 'block', fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{description}</span> : null}
      </span>
    </label>
  );
}
