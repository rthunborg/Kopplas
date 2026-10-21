import React from 'react';

export function Card({ children, title, action, padding = 'var(--space-8)', interactive = false, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <section
      onMouseEnter={interactive ? () => setHover(true) : undefined}
      onMouseLeave={interactive ? () => setHover(false) : undefined}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid ' + (interactive && hover ? 'var(--border-strong)' : 'var(--surface-card-border)'),
        borderRadius: 'var(--radius-card)',
        transition: 'var(--transition-control)',
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }}
      {...rest}
    >
      {title ? (
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-6)', padding: 'var(--space-6) ' + padding, borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: 'var(--size-sm)', fontWeight: 'var(--weight-medium)' }}>{title}</h3>
          {action}
        </header>
      ) : null}
      <div style={{ padding }}>{children}</div>
    </section>
  );
}
