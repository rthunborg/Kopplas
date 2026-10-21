const { Card, PhaseChain, Icon, Button, StatusDot } = window.KopplaDesignSystem_4b46f2;

const STEG = [
  { icon: 'search', titel: 'Prospektering', text: 'Leads, platsbesök och anbud i samma flöde. Anbudet blir projekt med ett klick.' },
  { icon: 'ruler', titel: 'Projektering', text: 'Materiallista, tidsbudget och bemanning läggs upp mot kontraktet — inte i ett kalkylblad.' },
  { icon: 'hard-hat', titel: 'Genomförande', text: 'Montören rapporterar tid och avvikelser i mobilen. Projektledaren attesterar en gång i veckan.' },
  { icon: 'clipboard-check', titel: 'Dokumentering', text: 'Egenkontroll, mätprotokoll och relationsritningar samlas per projekt. Överlämning som PDF.' },
  { icon: 'receipt', titel: 'Fakturering', text: 'Attesterad tid och material blir fakturaunderlag. Fast pris, löpande räkning eller ROT.' },
];

function Chain() {
  const [i, setI] = React.useState(2);
  return (
    <section style={{ padding: 'var(--space-13) var(--gutter-page)', maxWidth: 'var(--page-max)', margin: '0 auto', borderTop: '1px solid var(--border-default)' }}>
      <h2 style={{ fontSize: 'var(--size-4xl)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-display)', maxWidth: 700 }}>
        Fem faser. Ingen dubbelregistrering.
      </h2>
      <p style={{ fontSize: 'var(--size-lg)', color: 'var(--text-secondary)', maxWidth: 'var(--prose-max)', marginTop: 'var(--space-6)', lineHeight: 'var(--lh-relaxed)' }}>
        Uppgiften följer projektet hela vägen. Det som mätts på plats är samma data som hamnar på fakturan.
      </p>

      <div style={{ marginTop: 'var(--space-10)' }}>
        <PhaseChain current={i} onSelect={(n) => setI(n)} phases={STEG.map((s) => ({ label: s.titel }))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-9)', marginTop: 'var(--space-10)', alignItems: 'start' }}>
        <div>
          <Icon name={STEG[i].icon} size={24} />
          <h3 style={{ fontSize: 'var(--size-2xl)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--track-heading)', marginTop: 'var(--space-6)' }}>{STEG[i].titel}</h3>
          <p style={{ fontSize: 'var(--size-md)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-relaxed)', marginTop: 'var(--space-5)', maxWidth: 460 }}>{STEG[i].text}</p>
          <div style={{ marginTop: 'var(--space-8)' }}><Button variant="ghost" iconAfter="arrow-right">Läs mer om {STEG[i].titel.toLowerCase()}</Button></div>
        </div>
        <div style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sheet)', height: 320, display: 'flex', alignItems: 'flex-end', padding: 'var(--space-8)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-2xs)', color: 'var(--text-tertiary)' }}>[ bildplats: skärmbild av {STEG[i].titel.toLowerCase()} ]</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', marginTop: 'var(--space-12)' }}>
        {[
          ['truck', 'Tillgångar och underhåll', 'Fordon, instrument och verktyg med kalibreringsdatum och planerat underhåll.'],
          ['smartphone', 'Byggd för fältet', '44 px träffytor, offlinetålig tidrapport och kamera för avvikelser.'],
          ['plug', 'Kopplat till din ekonomi', 'Export till Fortnox och Visma. Ingen manuell överföring av underlag.'],
        ].map(([ic, t, txt]) => (
          <Card key={t}>
            <Icon name={ic} size={20} />
            <h4 style={{ fontSize: 'var(--size-lg)', fontWeight: 'var(--weight-medium)', marginTop: 'var(--space-6)' }}>{t}</h4>
            <p style={{ fontSize: 'var(--size-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-normal)', marginTop: 'var(--space-4)' }}>{txt}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { Chain });
