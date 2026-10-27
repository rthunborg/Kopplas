One-line: Kopplas's core metaphor — the process chain from prospect to invoice, as a row of 3px bars.

```jsx
<PhaseChain current={2} onSelect={setPhase} phases={[
  { label: 'Prospektering', meta: 'Klar 4 feb' },
  { label: 'Projektering', meta: 'Klar 26 feb' },
  { label: 'Genomförande', meta: '62 % rapporterat' },
  { label: 'Dokumentering' },
  { label: 'Fakturering' },
]} />
```

This is the only place the signal yellow appears inside the app by default. `compact` for cards and list rows.
