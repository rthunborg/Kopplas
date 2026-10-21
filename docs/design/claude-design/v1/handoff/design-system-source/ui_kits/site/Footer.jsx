const { Button, Input, Divider, Icon } = window.KopplaDesignSystem_4b46f2;

function SiteFooter() {
  return (
    <>
      <section data-theme="inverse" style={{ background: 'var(--bg-page)', padding: 'var(--space-13) var(--gutter-page)' }}>
        <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-11)', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'var(--size-4xl)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-display)', color: 'var(--text-primary)' }}>
              Se det på ditt eget projekt.
            </h2>
            <p style={{ fontSize: 'var(--size-md)', color: 'var(--text-secondary)', marginTop: 'var(--space-6)', maxWidth: 480, lineHeight: 'var(--lh-relaxed)' }}>
              30 minuter, en av dina egna entreprenader. Vi visar kedjan från platsbesök till faktura.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
            <Input size="lg" placeholder="Namn och företag" />
            <Input size="lg" placeholder="E-post" icon="mail" />
            <Button variant="primary" size="lg" fullWidth>Boka demo</Button>
            <span style={{ fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)' }}>Vi hör av oss inom en arbetsdag.</span>
          </div>
        </div>
      </section>

      <footer style={{ padding: 'var(--space-10) var(--gutter-page) var(--space-9)', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 'var(--space-9)' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span style={{ width: 8, height: 8, background: 'var(--signal-400)' }} />
                <span style={{ fontSize: 'var(--size-lg)', fontWeight: 'var(--weight-medium)', letterSpacing: '-0.03em' }}>Kopplas</span>
              </div>
              <p style={{ fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-5)', maxWidth: 260 }}>
                Verksamhetssystem för elektriker. Byggt i Sverige.
              </p>
            </div>
            {[['Produkt', ['Kedjan', 'Tidrapport', 'Egenkontroll', 'Tillgångar']], ['Företag', ['Om oss', 'Jobb', 'Kontakt']], ['Övrigt', ['Support', 'Driftstatus', 'Villkor']]].map(([t, items]) => (
              <div key={t}>
                <div style={{ fontSize: 'var(--size-3xs)', letterSpacing: 'var(--track-caps)', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{t}</div>
                <ul style={{ listStyle: 'none', margin: 'var(--space-6) 0 0', padding: 0, display: 'grid', gap: 'var(--space-4)' }}>
                  {items.map((x) => <li key={x}><a href="#" style={{ fontSize: 'var(--size-2xs)', color: 'var(--text-secondary)', border: 0 }}>{x}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <Divider style={{ margin: 'var(--space-9) 0 var(--space-6)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--size-3xs)', color: 'var(--text-tertiary)' }}>
            <span>© 2026 Kopplas AB</span>
            <span>Malmö · Stockholm</span>
          </div>
        </div>
      </footer>
    </>
  );
}

Object.assign(window, { SiteFooter });
