const { Button, Icon } = window.KopplaDesignSystem_4b46f2;

function SiteHeader({ onNav, active }) {
  const links = [['produkt', 'Produkt'], ['kedjan', 'Kedjan'], ['priser', 'Priser'], ['kunder', 'Kunder']];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30, height: 64, display: 'flex', alignItems: 'center',
      gap: 'var(--space-9)', padding: '0 var(--gutter-page)',
      background: 'var(--bg-glass)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)',
      borderBottom: '1px solid var(--border-default)',
    }}>
      <a href="#" onClick={(e) => { e.preventDefault(); onNav('produkt'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)', border: 0 }}>
        <span style={{ width: 8, height: 8, background: 'var(--signal-400)' }} />
        <span style={{ fontSize: 'var(--size-lg)', fontWeight: 'var(--weight-medium)', letterSpacing: '-0.03em' }}>Kopplas</span>
      </a>
      <nav style={{ display: 'flex', gap: 'var(--space-8)', marginLeft: 'var(--space-8)' }}>
        {links.map(([k, l]) => (
          <a key={k} href={'#' + k} onClick={(e) => { e.preventDefault(); onNav(k); }} style={{
            fontSize: 'var(--size-xs)', border: 0,
            color: active === k ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}>{l}</a>
        ))}
      </nav>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
        <a href="#" style={{ fontSize: 'var(--size-xs)', color: 'var(--text-secondary)', border: 0 }}>Logga in</a>
        <Button variant="signal" size="md" onClick={() => onNav('demo')}>Boka demo</Button>
      </div>
    </header>
  );
}

Object.assign(window, { SiteHeader });
