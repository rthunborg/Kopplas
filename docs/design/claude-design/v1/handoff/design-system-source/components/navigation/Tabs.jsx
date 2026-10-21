import React from 'react';

export function Tabs({ items = [], value, onChange, style, ...rest }) {
  return (
    <div role="tablist" style={{ display: 'flex', gap: 'var(--space-8)', borderBottom: '1px solid var(--border-default)', ...style }} {...rest}>
      {items.map((it) => {
        const key = typeof it === 'string' ? it : it.key;
        const label = typeof it === 'string' ? it : it.label;
        const count = typeof it === 'string' ? undefined : it.count;
        const on = key === value;
        return (
          <button key={key} role="tab" aria-selected={on} onClick={() => onChange && onChange(key)} style={{
            border: 0, background: 'none', cursor: 'pointer', padding: 'var(--space-5) 0',
            marginBottom: -1, borderBottom: '2px solid ' + (on ? 'var(--n-950)' : 'transparent'),
            fontFamily: 'var(--font-core)', fontSize: 'var(--size-xs)',
            fontWeight: on ? 'var(--weight-medium)' : 'var(--weight-regular)',
            color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)',
            transition: 'var(--transition-control)',
          }}>
            {label}
            {count != null ? <span style={{ fontSize: 'var(--size-3xs)', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
