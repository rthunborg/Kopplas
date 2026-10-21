One-line: Icon-only control for dense toolbars and row actions; `label` is mandatory.

```jsx
<IconButton icon="ellipsis" label="Fler åtgärder" />
<IconButton icon="download" label="Ladda ner" variant="outline" />
```

Only legal where space genuinely forbids a label (table rows, toolbars, topbar). Everywhere else use `Button` with `icon`.
