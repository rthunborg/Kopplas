const { Card, Metric, Table, StatusDot, PhaseChain, ProgressBar, Tabs, Breadcrumbs, Button, Badge, Tag, Checkbox, Divider, Timeline, Field, Input, EmptyState, Banner } = window.KopplaDesignSystem_4b46f2;

function ProjektDetalj({ projectId, onBack, onInvoice }) {
  const d = window.KopplasData;
  const p = d.projekt.find((x) => x.id === projectId) || d.projekt[0];
  const [tab, setTab] = React.useState('oversikt');
  const [checks, setChecks] = React.useState({ a: true, b: true, c: false, d: false });
  const toggle = (k) => setChecks((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', maxWidth: 1240 }}>
      <Breadcrumbs items={[{ label: 'Projekt', href: '#' }, { label: p.namn }]} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-8)' }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 'var(--size-2xl)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-heading)' }}>{p.namn}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)' }}>{p.id}</span>
            <StatusDot status={p.status} label={p.st} />
            <span style={{ fontSize: 'var(--size-2xs)', color: 'var(--text-secondary)' }}>{p.kund}</span>
            {p.status === 'deviation' ? <Badge tone="risk">Över budget</Badge> : null}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-4)' }}>
          <Button variant="ghost" icon="arrow-left" onClick={onBack}>Tillbaka</Button>
          <Button variant="secondary" icon="file-plus">ÄTA</Button>
          <Button variant="primary" icon="receipt" onClick={onInvoice}>Skapa faktura</Button>
        </div>
      </div>

      <Card padding="var(--space-8)">
        <PhaseChain current={p.fas} onSelect={() => {}} phases={[
          { label: 'Prospektering', meta: 'Klar 4 feb' },
          { label: 'Projektering', meta: 'Klar 26 feb' },
          { label: 'Genomförande', meta: p.pct + ' % rapporterat' },
          { label: 'Dokumentering', meta: '2 av 6 klara' },
          { label: 'Fakturering', meta: 'Ej påbörjad' },
        ]} />
      </Card>

      <Tabs value={tab} onChange={setTab} items={[
        { key: 'oversikt', label: 'Översikt' },
        { key: 'tid', label: 'Tid', count: 34 },
        { key: 'material', label: 'Material', count: 12 },
        { key: 'dok', label: 'Dokument', count: 8 },
        { key: 'ata', label: 'ÄTA', count: 2 },
      ]} />

      {tab === 'oversikt' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
          <Card title="Ekonomi">
            <div style={{ display: 'grid', gap: 'var(--space-7)' }}>
              <Metric size="sm" label="Kontrakt" value={p.belopp} />
              <Metric size="sm" label="Fakturerat" value="188 500 kr" delta="66 %" />
              <Divider />
              <ProgressBar label="Nedlagda timmar" valueLabel={p.timmar} value={p.pct} tone={p.pct > 100 ? 'risk' : 'ink'} />
            </div>
          </Card>
          <Card title="Egenkontroll" action={<Badge tone="warn">2 av 4</Badge>}>
            <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
              <Checkbox label="Isolationsmätning centraler" checked={checks.a} onChange={() => toggle('a')} />
              <Checkbox label="Jordfelsbrytare provade" checked={checks.b} onChange={() => toggle('b')} />
              <Checkbox label="Märkning schakt 3" checked={checks.c} onChange={() => toggle('c')} />
              <Checkbox label="Relationsritning uppdaterad" checked={checks.d} onChange={() => toggle('d')} />
            </div>
            <Divider style={{ margin: 'var(--space-7) 0 var(--space-6)' }} />
            <Button size="sm" fullWidth>Signera kontroll</Button>
          </Card>
          <Card title="Bemanning">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <Tag icon="user">Anders L.</Tag>
              <Tag icon="user">Johan R.</Tag>
              <Tag icon="user">Maria S. · PL</Tag>
              <Tag icon="user">Elin K.</Tag>
            </div>
            <Divider style={{ margin: 'var(--space-7) 0 var(--space-6)' }} />
            <Field label="Planerad slutdatum"><Input defaultValue={p.slut} icon="calendar" /></Field>
          </Card>
        </div>
      ) : null}

      {tab === 'tid' ? (
        <Card padding="0" title="Rapporterad tid" action={<Button size="sm" variant="primary">Attestera valda</Button>}>
          <Table columns={[
            { key: 'datum', header: 'Datum', width: 120 },
            { key: 'person', header: 'Person' },
            { key: 'typ', header: 'Arbetsmoment' },
            { key: 'status', header: 'Status', render: (r) => <StatusDot status={r.status} label={r.st} /> },
            { key: 'timmar', header: 'Tid', align: 'right' },
          ]} rows={d.tid} />
        </Card>
      ) : null}

      {tab === 'material' ? (
        <Card padding="0" title="Materiallista">
          <Table dense columns={[
            { key: 'art', header: 'Artikelnr', width: 140 },
            { key: 'namn', header: 'Benämning' },
            { key: 'antal', header: 'Antal', align: 'right' },
            { key: 'pris', header: 'Summa', align: 'right' },
          ]} rows={[
            { id: 1, art: 'E-2049112', namn: 'Kabel EQLQ 5G2,5', antal: '420 m', pris: '18 480 kr' },
            { id: 2, art: 'E-1188430', namn: 'Kabelstege 300 mm', antal: '64 m', pris: '22 100 kr' },
            { id: 3, art: 'E-3390021', namn: 'Jordfelsbrytare 4P 40A', antal: '12 st', pris: '9 360 kr' },
            { id: 4, art: 'E-7712004', namn: 'Apparatdosa infälld', antal: '86 st', pris: '3 010 kr' },
          ]} />
        </Card>
      ) : null}

      {tab === 'dok' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
          <Card padding="0" title="Dokument" action={<Button size="sm" icon="upload">Ladda upp</Button>}>
            <Table dense columns={[
              { key: 'namn', header: 'Fil' },
              { key: 'typ', header: 'Typ' },
              { key: 'av', header: 'Uppladdad av' },
              { key: 'datum', header: 'Datum', align: 'right' },
            ]} rows={[
              { id: 1, namn: 'Relationsritning A-2.pdf', typ: 'Ritning', av: 'Maria S.', datum: '2026-03-08' },
              { id: 2, namn: 'Egenkontroll centraler.pdf', typ: 'Protokoll', av: 'Anders L.', datum: '2026-03-06' },
              { id: 3, namn: 'Isolationsmätning schakt 1-2.csv', typ: 'Mätdata', av: 'Anders L.', datum: '2026-03-06' },
            ]} />
          </Card>
          <Card title="Historik"><Timeline items={[
            { time: '12 mars', title: 'Dokument tillagt', meta: 'Relationsritning A-2', tone: 'active' },
            { time: '6 mars', title: 'Protokoll signerat', meta: 'Anders L.' },
            { time: '26 feb', title: 'Projektering avslutad', meta: 'Maria S.' },
          ]} /></Card>
        </div>
      ) : null}

      {tab === 'ata' ? (
        <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
          <Banner tone="info" title="ÄTA måste godkännas av kund innan arbetet påbörjas" />
          <Card padding="0"><Table columns={[
            { key: 'id', header: 'ÄTA', width: 120 },
            { key: 'namn', header: 'Beskrivning' },
            { key: 'status', header: 'Status', render: (r) => <StatusDot status={r.status} label={r.st} /> },
            { key: 'belopp', header: 'Belopp', align: 'right' },
          ]} rows={[
            { id: 'ÄTA-04', namn: 'Extra uttag konferensrum', status: 'waiting', st: 'Väntar godkännande', belopp: '14 200 kr' },
            { id: 'ÄTA-03', namn: 'Flytt av central plan 2', status: 'done', st: 'Godkänd', belopp: '31 800 kr' },
          ]} /></Card>
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, { ProjektDetalj });
