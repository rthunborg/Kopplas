import React from 'react';

export function TopBar({ title, subtitle, children, actions, sticky = true, style, ...rest }) {
  return (
    <header style={{
      minHeight: 'var(--topbar-h)', boxSizing: 'border-box', display: 'flex', alignItems: 'center',
      gap: 'var(--space-6)', padding: '0 var(--gutter-app)',
      background: sticky ? 'var(--bg-glass)' : 'var(--bg-page)',
      backdropFilter: sticky ? 'var(--blur-glass)' : undefined,
      WebkitBackdropFilter: sticky ? 'var(--blur-glass)' : undefined,
      borderBottom: '1px solid var(--border-default)',
      position: sticky ? 'sticky' : 'static', top: 0, zIndex: 20, ...style,
    }} {...rest}>
      <div style={{ minWidth: 0 }}>
        {title ? <div style={{ fontSize: 'var(--size-md)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div> : null}
        {subtitle ? <div style={{ fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)' }}>{subtitle}</div> : null}
      </div>
      {children}
      {actions ? <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>{actions}</div> : null}
    </header>
  );
}
