import React from 'react';

export function Table({ columns = [], rows = [], onRowClick, selectedId, dense = false, style, ...rest }) {
  const [hoverId, setHoverId] = React.useState(null);
  const pad = dense ? 'var(--space-4) var(--space-5)' : 'var(--space-5) var(--space-6)';
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums', ...style }} {...rest}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={{
              textAlign: c.align || 'left', padding: pad, fontSize: 'var(--size-3xs)',
              letterSpacing: 'var(--track-caps)', textTransform: 'uppercase', fontWeight: 'var(--weight-medium)',
              color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-default)', whiteSpace: 'nowrap',
              width: c.width,
            }}>{c.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const id = r.id != null ? r.id : i;
          const selected = selectedId != null && selectedId === id;
          return (
            <tr key={id}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              onMouseEnter={() => setHoverId(id)}
              onMouseLeave={() => setHoverId(null)}
              style={{
                cursor: onRowClick ? 'pointer' : undefined,
                background: selected ? 'var(--bg-selected)' : hoverId === id ? 'var(--bg-hover)' : 'transparent',
                transition: 'background-color var(--dur-fast) var(--ease-standard)',
              }}>
              {columns.map((c, ci) => (
                <td key={c.key} style={{
                  padding: pad, textAlign: c.align || 'left', fontSize: 'var(--size-xs)',
                  color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: ci === 0 && selected ? 'var(--weight-medium)' : 'var(--weight-regular)',
                  borderBottom: '1px solid var(--border-subtle)', whiteSpace: c.wrap ? 'normal' : 'nowrap',
                }}>{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
