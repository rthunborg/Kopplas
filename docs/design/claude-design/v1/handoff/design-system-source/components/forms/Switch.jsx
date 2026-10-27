import React from 'react';

export function Switch({ checked = false, onChange, label, disabled = false, style, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-5)', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 'var(--size-xs)', color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)', ...style }}>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={onChange} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} {...rest} />
      <span style={{
        width: 34, height: 20, flex: '0 0 auto', borderRadius: 'var(--radius-pill)', padding: 2,
        background: disabled ? 'var(--n-200)' : checked ? 'var(--n-950)' : 'var(--n-200)',
        transition: 'background-color var(--dur-fast) var(--ease-standard)',
        display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start',
      }}>
        <span style={{ width: 16, height: 16, borderRadius: 'var(--radius-pill)', background: 'var(--n-000)', boxShadow: 'var(--shadow-sm)', transition: 'transform var(--dur-fast) var(--ease-standard)' }} />
      </span>
      {label}
    </label>
  );
}
