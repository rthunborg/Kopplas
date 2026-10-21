One-line: The app's primary navigation — 248px, sunken grey, sections in uppercase micro-labels.

```jsx
<SidebarNav value={view} onSelect={setView} items={[
  { key: 'oversikt', label: 'Översikt', icon: 'layout-dashboard' },
  { key: 'projekt', label: 'Projekt', icon: 'folder-open', count: 12 },
  { section: 'Företaget' },
  { key: 'tillgangar', label: 'Tillgångar', icon: 'truck' },
]} />
```

Selected row is white with a hairline; icons are 16px and always paired with a label.
