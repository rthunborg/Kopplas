const { Card, Field, Input, Select, Switch, Divider, Button, Radio, Toolbar, Badge } = window.KopplaDesignSystem_4b46f2;

function Installningar() {
  const [notis, setNotis] = React.useState(true);
  const [auto, setAuto] = React.useState(false);
  const [pris, setPris] = React.useState('lopande');
  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', maxWidth: 820 }}>
      <Card title="Företag">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <Field label="Företagsnamn"><Input defaultValue="Elpro Syd AB" /></Field>
            <Field label="Organisationsnummer"><Input defaultValue="556123-4567" /></Field>
          </div>
          <Field label="Fakturaadress" hint="Visas på alla utgående fakturor"><Input defaultValue="Bergsgatan 12, 214 22 Malmö" /></Field>
        </div>
      </Card>

      <Card title="Standardvärden">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <Field label="Betalningsvillkor"><Select options={['30 dagar', '15 dagar', '10 dagar']} /></Field>
            <Field label="Timpris installation"><Input defaultValue="795" suffix="kr" /></Field>
          </div>
          <Divider />
          <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
            <Radio name="pris" label="Löpande räkning" description="Faktureras per attesterad timme" checked={pris === 'lopande'} onChange={() => setPris('lopande')} />
            <Radio name="pris" label="Fast pris" description="Delfaktureras enligt betalplan" checked={pris === 'fast'} onChange={() => setPris('fast')} />
          </div>
        </div>
      </Card>

      <Card title="Notiser">
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <Switch checked={notis} onChange={() => setNotis(!notis)} label="Notis när tid väntar på attest" />
          <Switch checked={auto} onChange={() => setAuto(!auto)} label="Skicka betalningspåminnelse automatiskt" />
        </div>
        <Divider style={{ margin: 'var(--space-7) 0 var(--space-6)' }} />
        <Toolbar right={<Button variant="primary">Spara</Button>}><Badge tone="neutral">Ändringar sparas inte automatiskt</Badge></Toolbar>
      </Card>
    </div>
  );
}

Object.assign(window, { Installningar });
