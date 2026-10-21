window.KopplasData = {
  projekt: [
    { id: 'PRJ-2026-0184', namn: 'Ombyggnad Kv. Vasa 4', kund: 'Vasastaden Fastigheter AB', status: 'active', st: 'Pågår', fas: 2, timmar: '184 / 300 h', pct: 61, belopp: '284 500 kr', pl: 'Maria S.', slut: '2026-04-18' },
    { id: 'PRJ-2026-0179', namn: 'Serviceavtal Bergsgatan 12', kund: 'Bergsgatan Samfällighet', status: 'waiting', st: 'Väntar attest', fas: 3, timmar: '38 / 40 h', pct: 95, belopp: '42 100 kr', pl: 'Anders L.', slut: '2026-03-29' },
    { id: 'PRJ-2026-0171', namn: 'Laddstolpar Hyllie P2', kund: 'Malmö Parkering', status: 'deviation', st: 'Avvikelse', fas: 2, timmar: '412 / 380 h', pct: 108, belopp: '611 000 kr', pl: 'Maria S.', slut: '2026-05-02' },
    { id: 'PRJ-2026-0166', namn: 'Ny elcentral Lundby skola', kund: 'Göteborgs Stad', status: 'planned', st: 'Planerad', fas: 1, timmar: '0 / 210 h', pct: 0, belopp: '318 000 kr', pl: 'Johan R.', slut: '2026-06-11' },
    { id: 'PRJ-2026-0158', namn: 'Belysning lager Arlöv', kund: 'Nordlog AB', status: 'done', st: 'Klart', fas: 4, timmar: '96 / 100 h', pct: 96, belopp: '129 400 kr', pl: 'Anders L.', slut: '2026-02-27' },
  ],
  anbud: [
    { id: 'ANB-2026-0042', namn: 'Solcellsanläggning Kv. Höjden', kund: 'Höjden Bostad AB', status: 'waiting', st: 'Skickat', belopp: '1 240 000 kr', sista: '2026-03-20', sannolikhet: '60 %' },
    { id: 'ANB-2026-0041', namn: 'Ombyggnad kontor Norra Vallgatan', kund: 'Vallgatan Förvaltning', status: 'draft', st: 'Utkast', belopp: '186 000 kr', sista: '2026-03-24', sannolikhet: '—' },
    { id: 'ANB-2026-0039', namn: 'Service brandlarm Hyllie', kund: 'Malmö Parkering', status: 'active', st: 'Platsbesök bokat', belopp: '74 500 kr', sista: '2026-03-18', sannolikhet: '80 %' },
    { id: 'ANB-2026-0036', namn: 'Utbyte elcentraler etapp 2', kund: 'Vasastaden Fastigheter AB', status: 'done', st: 'Vunnet', belopp: '452 000 kr', sista: '2026-03-02', sannolikhet: '100 %' },
  ],
  tillgangar: [
    { id: 'FRD-114', namn: 'Servicebil VW Crafter', typ: 'Fordon', reg: 'ABC 12X', status: 'active', st: 'I drift', ansvarig: 'Anders L.', nasta: 'Service 2026-04-02' },
    { id: 'FRD-118', namn: 'Servicebil Ford Transit', typ: 'Fordon', reg: 'DEF 45Y', status: 'waiting', st: 'På verkstad', ansvarig: 'Johan R.', nasta: 'Åter 2026-03-19' },
    { id: 'INS-207', namn: 'Isolationsprovare Megger', typ: 'Instrument', reg: 'S/N 88412', status: 'deviation', st: 'Kalibrering förfallen', ansvarig: 'Maria S.', nasta: 'Kalibrering 2026-03-01' },
    { id: 'INS-211', namn: 'Installationstestare', typ: 'Instrument', reg: 'S/N 90233', status: 'active', st: 'I drift', ansvarig: 'Anders L.', nasta: 'Kalibrering 2026-09-14' },
    { id: 'VRK-052', namn: 'Kärnborrmaskin', typ: 'Verktyg', reg: 'INV 052', status: 'planned', st: 'Utlånad', ansvarig: 'Hyllie P2', nasta: 'Åter 2026-03-21' },
  ],
  fakturor: [
    { id: 'F-2026-0311', kund: 'Vasastaden Fastigheter AB', projekt: 'PRJ-2026-0184', status: 'draft', st: 'Utkast', belopp: '96 000 kr', forfall: '—' },
    { id: 'F-2026-0308', kund: 'Malmö Parkering', projekt: 'PRJ-2026-0171', status: 'waiting', st: 'Skickad', belopp: '210 000 kr', forfall: '2026-03-28' },
    { id: 'F-2026-0302', kund: 'Nordlog AB', projekt: 'PRJ-2026-0158', status: 'done', st: 'Betald', belopp: '129 400 kr', forfall: '2026-03-04' },
    { id: 'F-2026-0299', kund: 'Bergsgatan Samfällighet', projekt: 'PRJ-2026-0179', status: 'deviation', st: 'Förfallen', belopp: '18 900 kr', forfall: '2026-02-26' },
  ],
  tid: [
    { id: 1, datum: '2026-03-12', person: 'Anders L.', projekt: 'Kv. Vasa 4', timmar: '8 h', typ: 'Installation', status: 'waiting', st: 'Väntar attest' },
    { id: 2, datum: '2026-03-12', person: 'Johan R.', projekt: 'Hyllie P2', timmar: '6 h 30 min', typ: 'Kanalisation', status: 'waiting', st: 'Väntar attest' },
    { id: 3, datum: '2026-03-11', person: 'Maria S.', projekt: 'Kv. Vasa 4', timmar: '4 h', typ: 'Projektering', status: 'done', st: 'Attesterad' },
  ],
};
