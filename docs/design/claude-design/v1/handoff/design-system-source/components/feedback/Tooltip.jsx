import React from 'react';

export function Tooltip({ label, children, placement = 'top', style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const pos = placement === 'bottom'
    ? { top: '100%', marginTop: 6 }
    : { bottom: '100%', marginBottom: 6 };
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} {...rest}>
      {children}
      <span role="tooltip" style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)', ...pos,
        padding: '5px var(--space-5)', background: 'var(--n-950)', color: 'var(--n-000)',
        fontSize: 'var(--size-3xs)', whiteSpace: 'nowrap', borderRadius: 'var(--radius-xs)',
        pointerEvents: 'none', opacity: open ? 1 : 0,
        transition: 'opacity var(--dur-fast) var(--ease-standard)', zIndex: 50, ...style,
      }}>{label}</span>
    </span>
  );
}
