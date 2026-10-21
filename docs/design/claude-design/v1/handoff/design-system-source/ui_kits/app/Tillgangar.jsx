const { Card, Table, StatusDot, Button, Toolbar, SegmentedControl, Input, Banner, Metric, Timeline, Divider, Switch } = window.KopplaDesignSystem_4b46f2;

function Tillgangar() {
  const d = window.KopplasData;
  const [typ, setTyp] = React.useState('Alla');
  const [auto, setAuto] = React.useState(true);
  const rows = typ === 'Alla' ? d.tillgangar : d.tillgangar.filter((r) => r.typ === typ);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', maxWidth: 1240 }}>
      <Banner tone="risk" title="Kalibrering förfallen · Isolationsprovare Megger (INS-207)" action={<Button size="sm">Boka kalibrering</Button>}>
        Instrumentet får inte användas för protokollförda mätningar förrän det är kalibrerat.
      </Banner>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <Toolbar right={<Button variant="primary" icon="plus">Ny tillgång</Button>}>
            <SegmentedControl size="sm" options={['Alla', 'Fordon', 'Instrument', 'Verktyg']} value={typ} onChange={setTyp} />
            <Input size="sm" icon="search" placeholder="Sök tillgång" style={{ width: 220 }} />
          </Toolbar>
          <Card padding="0">
            <Table columns={[
              { key: 'namn', header: 'Tillgång', render: (r) => (
                <span><span style={{ display: 'block' }}>{r.namn}</span><span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--size-3xs)', color: 'var(--text-tertiary)' }}>{r.id} · {r.reg}</span></span>
              ) },
              { key: 'typ', header: 'Typ', width: 110 },
              { key: 'status', header: 'Status', render: (r) => <StatusDot status={r.status} label={r.st} /> },
              { key: 'ansvarig', header: 'Hos', width: 120 },
              { key: 'nasta', header: 'Nästa åtgärd', align: 'right' },
            ]} rows={rows} />
          </Card>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
          <Card title="Underhåll">
            <div style={{ display: 'grid', gap: 'var(--space-7)' }}>
              <Metric size="sm" label="Åtgärder inom 30 dagar" value="4" />
              <Metric size="sm" label="Förfallna" value="1" deltaTone="down" delta="INS-207" />
              <Divider />
              <Switch checked={auto} onChange={() => setAuto(!auto)} label="Påminn ansvarig 14 dagar innan" />
            </div>
          </Card>
          <Card title="Planerat underhåll">
            <Timeline items={[
              { time: '19 mars', title: 'Ford Transit åter från verkstad', meta: 'DEF 45Y', tone: 'active' },
              { time: '21 mars', title: 'Kärnborrmaskin åter', meta: 'Hyllie P2' },
              { time: '2 april', title: 'Service VW Crafter', meta: 'ABC 12X' },
              { time: '14 sep', title: 'Kalibrering installationstestare', meta: 'INS-211' },
            ]} />
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Tillgangar });
