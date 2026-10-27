const { Card, Table, StatusDot, Button, Toolbar, SegmentedControl, Input, Tag, Metric, Modal, Field, Select, Textarea, EmptyState } = window.KopplaDesignSystem_4b46f2;

function Anbud({ onCreated }) {
  const d = window.KopplasData;
  const [filter, setFilter] = React.useState('Alla');
  const [open, setOpen] = React.useState(false);
  const rows = filter === 'Alla' ? d.anbud : d.anbud.filter((r) => (filter === 'Utkast' ? r.status === 'draft' : r.status !== 'draft'));
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', maxWidth: 1240 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-8)' }}>
        <Card><Metric size="sm" label="Anbudsvärde ute" value="1 500 500 kr" delta="3 anbud" /></Card>
        <Card><Metric size="sm" label="Vinstgrad 12 mån" value="41 %" delta="↑ 6 %" deltaTone="up" /></Card>
        <Card><Metric size="sm" label="Snittid till svar" value="9 dagar" /></Card>
      </div>

      <Toolbar right={<Button variant="primary" icon="plus" onClick={() => setOpen(true)}>Nytt anbud</Button>}>
        <SegmentedControl size="sm" options={['Alla', 'Utkast', 'Skickade']} value={filter} onChange={setFilter} />
        <Input size="sm" icon="search" placeholder="Sök kund eller anbud" style={{ width: 240 }} />
        <Tag onRemove={() => {}}>2026</Tag>
      </Toolbar>

      <Card padding="0">
        {rows.length ? (
          <Table
            columns={[
              { key: 'id', header: 'Anbudsnr', width: 150, render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-2xs)' }}>{r.id}</span> },
              { key: 'namn', header: 'Anbud', render: (r) => (
                <span><span style={{ display: 'block' }}>{r.namn}</span><span style={{ display: 'block', fontSize: 'var(--size-3xs)', color: 'var(--text-tertiary)' }}>{r.kund}</span></span>
              ) },
              { key: 'status', header: 'Status', render: (r) => <StatusDot status={r.status} label={r.st} /> },
              { key: 'sannolikhet', header: 'Sannolikhet', align: 'right' },
              { key: 'sista', header: 'Sista svarsdag', align: 'right' },
              { key: 'belopp', header: 'Belopp', align: 'right' },
            ]}
            rows={rows}
          />
        ) : <EmptyState icon="file-text" title="Inga anbud i den här vyn." description="Byt filter eller skapa ett nytt anbud." action={<Button variant="primary" onClick={() => setOpen(true)}>Nytt anbud</Button>} />}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nytt anbud" description="Anbudet blir ett projekt när kunden accepterar."
        footer={<><Button onClick={() => setOpen(false)}>Avbryt</Button><Button variant="primary" onClick={() => { setOpen(false); onCreated('Anbud sparat som utkast'); }}>Spara utkast</Button></>}>
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <Field label="Benämning" required><Input placeholder="Ex. Solcellsanläggning Kv. Höjden" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <Field label="Kund"><Select options={['Höjden Bostad AB', 'Malmö Parkering', 'Vasastaden Fastigheter AB']} placeholder="Välj kund" /></Field>
            <Field label="Prismodell"><Select options={['Fast pris', 'Löpande räkning', 'ROT']} placeholder="Välj prismodell" /></Field>
          </div>
          <Field label="Kort beskrivning" hint="Följer med till projektet"><Textarea rows={3} placeholder="Vad ska utföras?" /></Field>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { Anbud });
