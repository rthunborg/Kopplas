import React from 'react';

export function Timeline({ items = [], style, ...rest }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, ...style }} {...rest}>
      {items.map((it, i) => (
        <li key={i} style={{ display: 'grid', gridTemplateColumns: '92px 16px 1fr', gap: 'var(--space-5)', paddingBottom: i === items.length - 1 ? 0 : 'var(--space-7)' }}>
          <span style={{ fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', paddingTop: 2 }}>{it.time}</span>
          <span style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <span style={{ width: 7, height: 7, borderRadius: 'var(--radius-pill)', background: it.tone === 'active' ? 'var(--signal-500)' : 'var(--n-300)', marginTop: 6 }} />
            {i === items.length - 1 ? null : <span style={{ position: 'absolute', top: 17, bottom: -22, width: 1, background: 'var(--border-default)' }} />}
          </span>
          <span>
            <span style={{ display: 'block', fontSize: 'var(--size-xs)', color: 'var(--text-primary)' }}>{it.title}</span>
            {it.meta ? <span style={{ display: 'block', fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{it.meta}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
