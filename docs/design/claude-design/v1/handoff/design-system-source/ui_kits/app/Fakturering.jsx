const { Card, Table, StatusDot, Button, Toolbar, Input, Metric, Modal, Field, Select, Checkbox, Divider, Badge, Banner, Tabs } = window.KopplaDesignSystem_4b46f2;

function Fakturering({ onSent, openDraft }) {
  const d = window.KopplasData;
  const [open, setOpen] = React.useState(!!openDraft);
  React.useEffect(() => { if (openDraft) setOpen(true); }, [openDraft]);
  const [rot, setRot] = React.useState(false);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', maxWidth: 1240 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        {[['Fakturerat i mars', '284 500 kr'], ['Utestående', '228 900 kr'], ['Förfallet', '18 900 kr'], ['Underlag att fakturera', '3']].map(([l, v], i) => (
          <div key={l} style={{ padding: 'var(--space-8)', borderLeft: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <Metric size="sm" label={l} value={v} />
          </div>
        ))}
      </div>

      <Banner tone="warn" title="En faktura är förfallen sedan 26 februari" action={<Button size="sm">Skicka påminnelse</Button>} />

      <Toolbar right={<Button variant="primary" icon="plus" onClick={() => setOpen(true)}>Ny faktura</Button>}>
        <Input size="sm" icon="search" placeholder="Sök faktura eller kund" style={{ width: 260 }} />
        <Badge tone="neutral">4 fakturor</Badge>
      </Toolbar>

      <Card padding="0">
        <Table columns={[
          { key: 'id', header: 'Fakturanr', width: 140, render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-2xs)' }}>{r.id}</span> },
          { key: 'kund', header: 'Kund' },
          { key: 'projekt', header: 'Projekt', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-2xs)' }}>{r.projekt}</span> },
          { key: 'status', header: 'Status', render: (r) => <StatusDot status={r.status} label={r.st} /> },
          { key: 'forfall', header: 'Förfaller', align: 'right' },
          { key: 'belopp', header: 'Belopp', align: 'right' },
        ]} rows={d.fakturor} />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} width={560}
        title="Faktura · Ombyggnad Kv. Vasa 4"
        description="Underlaget är hämtat från attesterad tid och material fram till 12 mars."
        footer={<><Button onClick={() => setOpen(false)}>Avbryt</Button><Button variant="primary" onClick={() => { setOpen(false); onSent('Fakturan skickad · 96 000 kr'); }}>Skicka faktura</Button></>}>
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <Field label="Kund"><Select options={['Vasastaden Fastigheter AB']} /></Field>
            <Field label="Betalningsvillkor"><Select options={['30 dagar', '15 dagar', '10 dagar']} /></Field>
          </div>
          <Divider />
          <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
            {[['Arbetad tid · 184 h', '64 400 kr'], ['Material', '28 600 kr'], ['ÄTA-03 Flytt av central', '3 000 kr']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--size-xs)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span>
              </div>
            ))}
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--size-md)', fontWeight: 'var(--weight-medium)' }}>
              <span>Att betala</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>96 000 kr</span>
            </div>
          </div>
          <Checkbox label="ROT-avdrag på arbetskostnad" checked={rot} onChange={() => setRot(!rot)} />
        </div>
      </Modal>
    </div>
  );
}

function TidAttest({ onAttested }) {
  const d = window.KopplasData;
  const [sel, setSel] = React.useState({ 1: true, 2: true });
  const count = Object.values(sel).filter(Boolean).length;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', maxWidth: 1240 }}>
      <Toolbar right={<Button variant="primary" disabled={!count} onClick={() => onAttested(count + ' tidrapporter attesterade')}>Attestera {count || ''}</Button>}>
        <Input size="sm" icon="search" placeholder="Sök person eller projekt" style={{ width: 240 }} />
      </Toolbar>
      <Card padding="0">
        <Table columns={[
          { key: 'valj', header: '', width: 44, render: (r) => <Checkbox checked={!!sel[r.id]} onChange={() => setSel((s) => ({ ...s, [r.id]: !s[r.id] }))} /> },
          { key: 'datum', header: 'Datum', width: 120 },
          { key: 'person', header: 'Person' },
          { key: 'projekt', header: 'Projekt' },
          { key: 'typ', header: 'Arbetsmoment' },
          { key: 'status', header: 'Status', render: (r) => <StatusDot status={r.status} label={r.st} /> },
          { key: 'timmar', header: 'Tid', align: 'right' },
        ]} rows={d.tid} />
      </Card>
    </div>
  );
}

Object.assign(window, { Fakturering, TidAttest });
