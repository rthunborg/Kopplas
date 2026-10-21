One-line: In-view section switch — 2px ink underline on the active tab, hairline rule beneath.

```jsx
<Tabs value={tab} onChange={setTab} items={[
  { key: 'oversikt', label: 'Översikt' },
  { key: 'tid', label: 'Tid', count: 34 },
  { key: 'dok', label: 'Dokument', count: 8 },
]} />
```

For switching *content within a page*. For view modes use `SegmentedControl`.
