import React from 'react';
import { Icon } from '../core/Icon.jsx';

const defaultPhases = [
  { key: 'prospekt', label: 'Prospektering' },
  { key: 'projektering', label: 'Projektering' },
  { key: 'genomforande', label: 'Genomförande' },
  { key: 'dokumentation', label: 'Dokumentering' },
  { key: 'fakturering', label: 'Fakturering' },
];

export function PhaseChain({ phases = defaultPhases, current = 0, onSelect, compact = false, style, ...rest }) {
  return (
    <ol style={{ display: 'flex', alignItems: 'stretch', listStyle: 'none', margin: 0, padding: 0, gap: 0, ...style }} {...rest}>
      {phases.map((p, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={p.key || i} style={{ flex: 1, minWidth: 0 }}>
            <button
              onClick={onSelect ? () => onSelect(i, p) : undefined}
              style={{
                width: '100%', textAlign: 'left', border: 0, background: 'transparent',
                cursor: onSelect ? 'pointer' : 'default', padding: 0,
              }}
            >
              <span style={{
                display: 'block', height: 3,
                background: active ? 'var(--signal-400)' : done ? 'var(--n-950)' : 'var(--n-150)',
              }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: compact ? 'var(--space-4) var(--space-4) 0 0' : 'var(--space-5) var(--space-6) 0 0' }}>
                {done ? <Icon name="check" size={13} style={{ color: 'var(--text-primary)' }} /> : null}
                <span style={{
                  fontSize: compact ? 'var(--size-2xs)' : 'var(--size-xs)',
                  fontWeight: active ? 'var(--weight-medium)' : 'var(--weight-regular)',
                  color: active || done ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{p.label}</span>
              </span>
              {p.meta && !compact ? (
                <span style={{ display: 'block', fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{p.meta}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
