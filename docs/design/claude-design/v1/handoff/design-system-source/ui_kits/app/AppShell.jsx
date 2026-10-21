const { SidebarNav, TopBar, Button, IconButton, Toast } = window.KopplaDesignSystem_4b46f2;

const NAV = [
  { key: 'oversikt', label: 'Översikt', icon: 'layout-dashboard' },
  { key: 'anbud', label: 'Anbud', icon: 'file-text', count: 4 },
  { key: 'projekt', label: 'Projekt', icon: 'folder-open', count: 5 },
  { key: 'tid', label: 'Tid & attest', icon: 'clock', count: 2 },
  { section: 'Företaget' },
  { key: 'tillgangar', label: 'Tillgångar', icon: 'truck' },
  { key: 'fakturor', label: 'Fakturering', icon: 'receipt', count: 1 },
  { section: 'Övrigt' },
  { key: 'installningar', label: 'Inställningar', icon: 'settings' },
];

function AppShell({ view, onNavigate, title, subtitle, actions, toast, onToastClose, children, tabs }) {
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, background: 'var(--bg-page)' }}>
      <SidebarNav
        items={NAV}
        value={view}
        onSelect={onNavigate}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <span style={{ width: 26, height: 26, borderRadius: 'var(--radius-pill)', background: 'var(--n-200)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--size-3xs)', fontWeight: 'var(--weight-medium)' }}>MS</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 'var(--size-2xs)', fontWeight: 'var(--weight-medium)' }}>Maria Sandell</span>
              <span style={{ display: 'block', fontSize: 'var(--size-3xs)', color: 'var(--text-tertiary)' }}>Elpro Syd AB</span>
            </span>
            <IconButton icon="chevron-right" label="Konto" size="sm" style={{ marginLeft: 'auto' }} />
          </div>
        }
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar title={title} subtitle={subtitle} actions={actions} />
        {tabs ? <div style={{ padding: '0 var(--gutter-app)', borderBottom: '1px solid var(--border-default)' }}>{tabs}</div> : null}
        <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--space-8) var(--gutter-app) var(--space-12)' }}>{children}</main>
      </div>
      {toast ? (
        <div style={{ position: 'fixed', bottom: 'var(--space-9)', left: '50%', transform: 'translateX(-50%)', zIndex: 200 }}>
          <Toast tone="ok" message={toast} onDismiss={onToastClose} />
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, { AppShell, KOPPLA_NAV: NAV });
