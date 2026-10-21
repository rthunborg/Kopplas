import React from 'react';

export function Breadcrumbs({ items = [], style, ...rest }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)', ...style }} {...rest}>
      {items.map((it, i) => {
        const label = typeof it === 'string' ? it : it.label;
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {last
              ? <span style={{ color: 'var(--text-primary)' }}>{label}</span>
              : <a href={(typeof it === 'object' && it.href) || '#'} style={{ color: 'var(--text-secondary)', textDecoration: 'none', borderBottom: 0 }}>{label}</a>}
            {last ? null : <span aria-hidden style={{ color: 'var(--text-tertiary)' }}>/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
