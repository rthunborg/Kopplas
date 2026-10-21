import React from 'react';

export function Field({ label, hint, error, required = false, htmlFor, children, style, ...rest }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', ...style }} {...rest}>
      {label ? (
        <label htmlFor={htmlFor} style={{ fontSize: 'var(--size-xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-label)', color: 'var(--text-primary)' }}>
          {label}{required ? <span style={{ color: 'var(--text-tertiary)' }}> (obligatorisk)</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span style={{ fontSize: 'var(--size-2xs)', color: 'var(--text-risk)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)' }}>{hint}</span>
      ) : null}
    </div>
  );
}
