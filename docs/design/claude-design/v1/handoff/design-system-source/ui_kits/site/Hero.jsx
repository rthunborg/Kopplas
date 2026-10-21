const { Button, Icon, Metric } = window.KopplaDesignSystem_4b46f2;

function Hero({ onNav }) {
  return (
    <section style={{ padding: 'var(--space-14) var(--gutter-page) var(--space-12)', maxWidth: 'var(--page-max)', margin: '0 auto' }}>
      <div style={{ fontSize: 'var(--size-3xs)', letterSpacing: 'var(--track-caps)', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
        Verksamhetssystem för elektriker
      </div>
      <h1 style={{
        fontSize: 'clamp(52px, 7.4vw, 104px)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-display)',
        lineHeight: 'var(--lh-tight)', marginTop: 'var(--space-7)', maxWidth: 900, textWrap: 'pretty',
      }}>
        Hela kedjan.<br />Ett system.
      </h1>
      <p style={{ fontSize: 'var(--size-lg)', lineHeight: 'var(--lh-relaxed)', color: 'var(--text-secondary)', maxWidth: 'var(--prose-max)', marginTop: 'var(--space-8)' }}>
        Från första platsbesöket till sista fakturan. Prospektering, projektering, genomförande, dokumentation och fakturering — samma uppgifter, en gång inmatade.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-5)', marginTop: 'var(--space-9)' }}>
        <Button variant="primary" size="lg" onClick={() => onNav('demo')}>Boka demo</Button>
        <Button variant="secondary" size="lg" iconAfter="arrow-right" onClick={() => onNav('kedjan')}>Se kedjan</Button>
      </div>

      <div style={{
        marginTop: 'var(--space-13)', height: 420, borderRadius: 'var(--radius-sheet)', overflow: 'hidden',
        background: 'linear-gradient(to top, rgb(13 13 15 / .55), rgb(13 13 15 / 0) 60%), var(--n-200)',
        display: 'flex', alignItems: 'flex-end', padding: 'var(--space-9)',
      }}>
        <div>
          <div style={{ fontSize: 'var(--size-2xl)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-heading)', color: 'var(--n-000)' }}>
            Elpro Syd AB, 34 montörer
          </div>
          <div style={{ fontSize: 'var(--size-xs)', color: 'var(--n-150)', marginTop: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>
            [ bildplats: ställverk i arbetsljus, kall och dokumentär ]
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-9)', marginTop: 'var(--space-11)', borderTop: '1px solid var(--border-default)', paddingTop: 'var(--space-9)' }}>
        <Metric label="Mindre tid på administration" value="6 h" unit="/ vecka" />
        <Metric label="Snabbare fakturering" value="9 dagar" />
        <Metric label="Fullständig egenkontroll" value="100 %" />
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
