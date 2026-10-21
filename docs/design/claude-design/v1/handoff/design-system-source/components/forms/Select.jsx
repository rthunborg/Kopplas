import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function Select({ options = [], placeholder, invalid = false, size = 'md', style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'lg' ? 'var(--control-h-lg)' : size === 'sm' ? 'var(--control-h-sm)' : 'var(--control-h-md)';
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', height: h,
      background: rest.disabled ? 'var(--bg-inset)' : 'var(--bg-page)',
      border: '1px solid ' + (invalid ? 'var(--risk-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
      boxShadow: focus ? '0 0 0 1px var(--border-focus)' : 'none',
      borderRadius: 'var(--radius-control)', transition: 'var(--transition-control)', ...style,
    }}>
      <select
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          appearance: 'none', WebkitAppearance: 'none', flex: 1, minWidth: 0, height: '100%',
          border: 0, outline: 'none', background: 'transparent', cursor: 'pointer',
          padding: '0 var(--space-9) 0 var(--space-5)',
          fontFamily: 'var(--font-core)', fontSize: size === 'lg' ? 'var(--size-md)' : 'var(--size-xs)',
          color: rest.disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
        }}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => {
          const value = typeof o === 'string' ? o : o.value;
          const label = typeof o === 'string' ? o : o.label;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
      <Icon name="chevron-down" size={14} style={{ position: 'absolute', right: 10, color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
    </div>
  );
}
