import React from 'react';
import { Icon } from '../core/Icon.jsx';

const bannerTones = {
  neutral: { bg: 'var(--bg-sunken)', fg: 'var(--text-primary)', icon: 'info', border: 'var(--border-default)' },
  ok: { bg: 'var(--ok-050)', fg: 'var(--ok-700)', icon: 'circle-check', border: 'var(--ok-050)' },
  warn: { bg: 'var(--warn-050)', fg: 'var(--warn-700)', icon: 'triangle-alert', border: 'var(--warn-050)' },
  risk: { bg: 'var(--risk-050)', fg: 'var(--risk-700)', icon: 'octagon-alert', border: 'var(--risk-050)' },
  info: { bg: 'var(--info-050)', fg: 'var(--info-700)', icon: 'info', border: 'var(--info-050)' },
};

export function Banner({ tone = 'neutral', title, children, action, onDismiss, style, ...rest }) {
  const t = bannerTones[tone];
  return (
    <div role="status" style={{
      display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start',
      padding: 'var(--space-5) var(--space-6)', background: t.bg,
      border: '1px solid ' + t.border, borderRadius: 'var(--radius-card)', ...style,
    }} {...rest}>
      <Icon name={t.icon} size={16} style={{ color: t.fg, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title ? <div style={{ fontSize: 'var(--size-xs)', fontWeight: 'var(--weight-medium)', color: t.fg }}>{title}</div> : null}
        {children ? <div style={{ fontSize: 'var(--size-xs)', color: 'var(--text-secondary)', marginTop: title ? 2 : 0 }}>{children}</div> : null}
      </div>
      {action}
      {onDismiss ? (
        <button onClick={onDismiss} aria-label="Stäng" style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0, display: 'inline-flex' }}>
          <Icon name="x" size={14} />
        </button>
      ) : null}
    </div>
  );
}
