import React from 'react';
import { Icon } from './Icon.jsx';

const ibSizes = { sm: 28, md: 34, lg: 44 };

export function IconButton({ icon, label, size = 'md', variant = 'ghost', active = false, disabled = false, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const box = ibSizes[size];
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: box, height: box, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-control)', cursor: disabled ? 'not-allowed' : 'pointer',
        border: variant === 'outline' ? '1px solid var(--border-strong)' : '1px solid transparent',
        background: active ? 'var(--bg-active)' : hover && !disabled ? 'var(--bg-hover)' : 'transparent',
        color: disabled ? 'var(--text-disabled)' : active ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'var(--transition-control)',
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={size === 'lg' ? 20 : 16} />
    </button>
  );
}
