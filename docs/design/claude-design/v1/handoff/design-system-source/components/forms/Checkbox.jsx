import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Checkbox({ label, checked, indeterminate = false, disabled = false, onChange, style, ...rest }) {
  const on = checked || indeterminate;
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 'var(--size-xs)', color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)', ...style }}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={onChange} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} {...rest} />
      <span style={{
        width: 16, height: 16, flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-xs)', transition: 'var(--transition-control)',
        background: disabled ? 'var(--bg-inset)' : on ? 'var(--n-950)' : 'var(--bg-page)',
        border: '1px solid ' + (disabled ? 'var(--border-default)' : on ? 'var(--n-950)' : 'var(--border-strong)'),
        color: 'var(--n-000)',
      }}>
        {indeterminate ? <Icon name="minus" size={12} /> : checked ? <Icon name="check" size={12} /> : null}
      </span>
      {label}
    </label>
  );
}
