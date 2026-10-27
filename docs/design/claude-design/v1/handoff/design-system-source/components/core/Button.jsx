import React from 'react';
import { Icon } from './Icon.jsx';

const btnBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
  fontFamily: 'var(--font-core)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-label)',
  borderRadius: 'var(--radius-control)', border: '1px solid transparent', cursor: 'pointer',
  whiteSpace: 'nowrap', textDecoration: 'none',
  transition: 'var(--transition-control)',
};
const btnSizes = {
  sm: { height: 'var(--control-h-sm)', padding: '0 var(--space-5)', fontSize: 'var(--size-2xs)' },
  md: { height: 'var(--control-h-md)', padding: '0 var(--space-6)', fontSize: 'var(--size-xs)' },
  lg: { height: 'var(--control-h-lg)', padding: '0 var(--space-7)', fontSize: 'var(--size-md)' },
};
const btnVariants = {
  primary: { background: 'var(--action-primary-bg)', color: 'var(--action-primary-fg)' },
  secondary: { background: 'var(--action-secondary-bg)', color: 'var(--action-secondary-fg)', borderColor: 'var(--border-strong)' },
  ghost: { background: 'transparent', color: 'var(--text-primary)' },
  signal: { background: 'var(--action-signal-bg)', color: 'var(--action-signal-fg)' },
  danger: { background: 'transparent', color: 'var(--action-risk-fg)', borderColor: 'var(--border-default)' },
};
const btnHover = {
  primary: { background: 'var(--action-primary-bg-hover)' },
  secondary: { background: 'var(--bg-hover)' },
  ghost: { background: 'var(--bg-hover)' },
  signal: { background: 'var(--action-signal-bg-hover)' },
  danger: { background: 'var(--risk-050)' },
};

export function Button({
  children, variant = 'secondary', size = 'md', icon, iconAfter,
  disabled = false, loading = false, fullWidth = false, as = 'button', style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = as;
  const iconSize = size === 'lg' ? 18 : 16;
  return (
    <Tag
      disabled={Tag === 'button' ? disabled || loading : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...btnBase, ...btnSizes[size], ...btnVariants[variant],
        ...(hover && !disabled && !loading ? btnHover[variant] : null),
        ...(fullWidth ? { width: '100%' } : null),
        ...(disabled ? { background: 'var(--bg-inset)', color: 'var(--text-disabled)', borderColor: 'var(--border-subtle)', cursor: 'not-allowed' } : null),
        ...(loading ? { opacity: 0.6, cursor: 'progress' } : null),
        ...style,
      }}
      {...rest}
    >
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
      {iconAfter ? <Icon name={iconAfter} size={iconSize} /> : null}
    </Tag>
  );
}
