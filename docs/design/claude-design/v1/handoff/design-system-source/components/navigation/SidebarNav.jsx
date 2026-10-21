import React from 'react';
import { Icon } from '../core/Icon.jsx';

export function SidebarNav({ items = [], value, onSelect, brand = 'Kopplas', footer, style, ...rest }) {
  const [hover, setHover] = React.useState(null);
  return (
    <nav style={{
      width: 'var(--sidebar-w)', flex: '0 0 auto', height: '100%', boxSizing: 'border-box',
      background: 'var(--bg-sunken)', borderRight: '1px solid var(--border-default)',
      display: 'flex', flexDirection: 'column', ...style,
    }} {...rest}>
      <div style={{ height: 'var(--topbar-h)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: '0 var(--space-6)', flex: '0 0 auto' }}>
        <span style={{ width: 8, height: 8, background: 'var(--signal-400)' }} />
        <span style={{ fontSize: 'var(--size-lg)', fontWeight: 'var(--weight-medium)', letterSpacing: '-0.03em' }}>{brand}</span>
      </div>
      <div style={{ padding: 'var(--space-4)', display: 'grid', gap: 1, overflowY: 'auto' }}>
        {items.map((it) => {
          if (it.section) {
            return <div key={it.section} style={{ fontSize: 'var(--size-3xs)', letterSpacing: 'var(--track-caps)', textTransform: 'uppercase', color: 'var(--text-tertiary)', padding: 'var(--space-6) var(--space-5) var(--space-3)' }}>{it.section}</div>;
          }
          const on = it.key === value;
          return (
            <button key={it.key}
              onClick={() => onSelect && onSelect(it.key)}
              onMouseEnter={() => setHover(it.key)} onMouseLeave={() => setHover(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-5)', width: '100%',
                height: 34, padding: '0 var(--space-5)', border: 0, cursor: 'pointer',
                borderRadius: 'var(--radius-control)', textAlign: 'left',
                background: on ? 'var(--bg-page)' : hover === it.key ? 'var(--bg-hover)' : 'transparent',
                boxShadow: on ? 'inset 0 0 0 1px var(--border-default)' : 'none',
                color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 'var(--size-xs)', fontWeight: on ? 'var(--weight-medium)' : 'var(--weight-regular)',
                fontFamily: 'var(--font-core)', transition: 'var(--transition-control)',
              }}>
              <Icon name={it.icon} size={16} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
              {it.count != null ? <span style={{ fontSize: 'var(--size-3xs)', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{it.count}</span> : null}
            </button>
          );
        })}
      </div>
      {footer ? <div style={{ marginTop: 'auto', padding: 'var(--space-6)', borderTop: '1px solid var(--border-default)' }}>{footer}</div> : null}
    </nav>
  );
}
