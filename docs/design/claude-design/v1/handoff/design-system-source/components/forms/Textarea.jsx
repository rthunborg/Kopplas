import React from 'react';

export function Textarea({ rows = 4, invalid = false, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <textarea
      rows={rows}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: '100%', padding: 'var(--space-5)', resize: 'vertical',
        fontFamily: 'var(--font-core)', fontSize: 'var(--size-xs)', lineHeight: 'var(--lh-normal)',
        color: 'var(--text-primary)', background: 'var(--bg-page)',
        border: '1px solid ' + (invalid ? 'var(--risk-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
        boxShadow: focus ? '0 0 0 1px var(--border-focus)' : 'none',
        borderRadius: 'var(--radius-control)', outline: 'none', transition: 'var(--transition-control)', ...style,
      }}
      {...rest}
    />
  );
}
