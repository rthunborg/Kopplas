import React from 'react';

export function Toolbar({ children, right, dense = false, style, ...rest }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
      minHeight: dense ? 'var(--control-h-sm)' : 'var(--control-h-md)',
      ...style,
    }} {...rest}>
      {children}
      {right ? <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>{right}</div> : null}
    </div>
  );
}
