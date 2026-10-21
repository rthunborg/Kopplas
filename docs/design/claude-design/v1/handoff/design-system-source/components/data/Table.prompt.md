One-line: The workhorse list — uppercase 11px headers, hairline rows, tabular numerals, no zebra.

```jsx
<Table
  columns={[
    { key: 'nr', header: 'Projektnr', width: 130 },
    { key: 'namn', header: 'Projekt' },
    { key: 'status', header: 'Status', render: r => <StatusDot status={r.status} label={r.statusText} /> },
    { key: 'belopp', header: 'Belopp', align: 'right' },
  ]}
  rows={rows}
  onRowClick={openProject}
/>
```

Right-align money and quantities. First column is ink; the rest are secondary grey.
