One-line: Centred dialog on a 48% ink scrim — 12px radius, the only place `--shadow-lg` is used.

```jsx
<Modal title="Ta bort egenkontrollen?" description="Bilagorna följer med." onClose={close}
  footer={<><Button onClick={close}>Avbryt</Button><Button variant="danger">Ta bort</Button></>} />
```

Destructive confirmations always state the consequence in the description.
