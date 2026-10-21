import React from 'react';

export function SegmentedControl({ options = [], value, onChange, size = 'md', style, ...rest }) {
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return (
    <div role="tablist" style={{
      display: 'inline-flex', height: h, padding: 2, gap: 2,
      background: 'var(--bg-sunken)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-control)', ...style,
    }} {...rest}>
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const on = val === value;
        return (
          <button key={val} role="tab" aria-selected={on} onClick={() => onChange && onChange(val)} style={{
            border: 0, cursor: 'pointer', padding: '0 var(--space-5)', borderRadius: 3,
            fontFamily: 'var(--font-core)', fontSize: size === 'lg' ? 'var(--size-sm)' : 'var(--size-2xs)',
            fontWeight: on ? 'var(--weight-medium)' : 'var(--weight-regular)',
            background: on ? 'var(--bg-page)' : 'transparent',
            color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: on ? 'var(--shadow-sm)' : 'none',
            transition: 'var(--transition-control)',
          }}>{label}</button>
        );
      })}
    </div>
  );
}
