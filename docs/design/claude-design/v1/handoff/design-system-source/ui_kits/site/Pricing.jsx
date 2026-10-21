const { Card, Button, Badge, Icon, Divider, SegmentedControl } = window.KopplaDesignSystem_4b46f2;

const PLANER = [
  { namn: 'Verkstad', pris: '390', beskrivning: 'För firmor upp till 10 montörer.', punkter: ['Anbud och projekt', 'Tidrapport i mobil', 'Egenkontroll', 'Fakturaunderlag'] },
  { namn: 'Entreprenad', pris: '590', beskrivning: 'För firmor med flera projektledare.', punkter: ['Allt i Verkstad', 'ÄTA och betalplaner', 'Tillgångar och underhåll', 'Ekonomiintegration', 'Attestflöden'], vald: true },
  { namn: 'Koncern', pris: 'Offert', beskrivning: 'Flera bolag, egna processer.', punkter: ['Allt i Entreprenad', 'Flera bolag', 'SSO och behörighetsstyrning', 'Egen införandeledare'] },
];

function Pricing() {
  const [period, setPeriod] = React.useState('Per månad');
  return (
    <section style={{ padding: 'var(--space-13) var(--gutter-page)', maxWidth: 'var(--page-max)', margin: '0 auto', borderTop: '1px solid var(--border-default)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-9)', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 'var(--size-4xl)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-display)' }}>Pris per användare</h2>
          <p style={{ fontSize: 'var(--size-md)', color: 'var(--text-secondary)', marginTop: 'var(--space-5)' }}>Inga startavgifter. Ingen bindningstid utöver perioden.</p>
        </div>
        <SegmentedControl options={['Per månad', 'Per år']} value={period} onChange={setPeriod} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', marginTop: 'var(--space-10)', alignItems: 'stretch' }}>
        {PLANER.map((p) => (
          <div key={p.namn} style={{
            background: p.vald ? 'var(--n-950)' : 'var(--surface-card)',
            border: '1px solid ' + (p.vald ? 'var(--n-950)' : 'var(--surface-card-border)'),
            borderRadius: 'var(--radius-card)', padding: 'var(--space-9)', display: 'flex', flexDirection: 'column',
          }} data-theme={p.vald ? 'inverse' : undefined}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
              <span style={{ fontSize: 'var(--size-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>{p.namn}</span>
              {p.vald ? <Badge tone="signal">Vanligast</Badge> : null}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)', marginTop: 'var(--space-7)' }}>
              <span style={{ fontSize: 'var(--size-4xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>{p.pris}</span>
              {p.pris === 'Offert' ? null : <span style={{ fontSize: 'var(--size-sm)', color: 'var(--text-secondary)' }}>kr / användare / mån</span>}
            </div>
            <p style={{ fontSize: 'var(--size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-5)' }}>{p.beskrivning}</p>
            <Divider style={{ margin: 'var(--space-8) 0' }} />
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-5)' }}>
              {p.punkter.map((x) => (
                <li key={x} style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--size-xs)', color: 'var(--text-primary)' }}>
                  <Icon name="check" size={14} style={{ color: 'var(--text-tertiary)', marginTop: 2 }} />{x}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-9)' }}>
              <Button fullWidth variant={p.vald ? 'primary' : 'secondary'}>{p.pris === 'Offert' ? 'Kontakta oss' : 'Boka demo'}</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { Pricing });
