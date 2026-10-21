const { Card, Metric, Banner, Button, Table, StatusDot, PhaseChain, ProgressBar, Timeline, Divider, SegmentedControl } = window.KopplaDesignSystem_4b46f2;

function Oversikt({ onOpenProject, onGoto }) {
  const [range, setRange] = React.useState('Månad');
  const d = window.KopplasData;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', maxWidth: 1240 }}>
      <Banner tone="warn" title="2 tidrapporter väntar på attest" action={<Button size="sm" onClick={() => onGoto('tid')}>Granska</Button>}>
        Attestera före fredag så kommer de med på marsfakturan.
      </Banner>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-6)' }}>
        <span style={{ fontSize: 'var(--size-3xs)', letterSpacing: 'var(--track-caps)', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Nyckeltal</span>
        <SegmentedControl options={['Vecka', 'Månad', 'År']} value={range} onChange={setRange} size="sm" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        {[
          { label: 'Fakturerat i mars', value: '284 500 kr', delta: '↑ 4 %', tone: 'up' },
          { label: 'Ej fakturerat', value: '61 200 kr', delta: '3 underlag', tone: 'neutral' },
          { label: 'Debiteringsgrad', value: '84 %', delta: '↓ 2 %', tone: 'down' },
          { label: 'Aktiva projekt', value: '5', delta: '2 i slutfas', tone: 'neutral' },
        ].map((m, i) => (
          <div key={m.label} style={{ padding: 'var(--space-8)', borderLeft: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <Metric label={m.label} value={m.value} delta={m.delta} deltaTone={m.tone} size="sm" />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        <Card title="Projekt i drift" action={<Button size="sm" variant="ghost" onClick={() => onGoto('projekt')}>Visa alla</Button>} padding="0">
          <Table
            onRowClick={(r) => onOpenProject(r.id)}
            columns={[
              { key: 'namn', header: 'Projekt', render: (r) => (
                <span>
                  <span style={{ display: 'block' }}>{r.namn}</span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--size-3xs)', color: 'var(--text-tertiary)' }}>{r.id}</span>
                </span>
              ) },
              { key: 'status', header: 'Status', render: (r) => <StatusDot status={r.status} label={r.st} /> },
              { key: 'timmar', header: 'Timmar', align: 'right' },
              { key: 'belopp', header: 'Kontrakt', align: 'right' },
            ]}
            rows={d.projekt.slice(0, 4)}
          />
        </Card>

        <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
          <Card title="Kv. Vasa 4 · nästa steg">
            <PhaseChain compact current={2} phases={[{ label: 'Prospekt' }, { label: 'Projektering' }, { label: 'Genomförande' }, { label: 'Dokument' }, { label: 'Faktura' }]} />
            <Divider style={{ margin: 'var(--space-7) 0 var(--space-6)' }} />
            <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
              <ProgressBar label="Nedlagda timmar" valueLabel="184 / 300 h" value={61} />
              <ProgressBar label="Materialbudget" valueLabel="72 %" value={72} />
            </div>
          </Card>
          <Card title="Senaste händelser">
            <Timeline items={[
              { time: '12 mars 07:12', title: 'Tid rapporterad · 8 h', meta: 'Anders L. · Kv. Vasa 4', tone: 'active' },
              { time: '11 mars 16:40', title: 'Egenkontroll signerad', meta: 'Maria S. · Hyllie P2' },
              { time: '11 mars 09:03', title: 'Avvikelse rapporterad', meta: 'Anders L. · Hyllie P2' },
              { time: '10 mars 14:22', title: 'Anbud skickat · 1 240 000 kr', meta: 'Höjden Bostad AB' },
            ]} />
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Oversikt });
