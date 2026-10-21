One-line: Lucide glyph as inline SVG inheriting `currentColor` — the only icon primitive in Kopplas; never hand-write an SVG.

```jsx
<Icon name="zap" size={16} />
<Icon name="file-text" size={20} title="Dokument" />
<Icon name="check" size={24} strokeWidth={2} />
```

Geometry for 57 Lucide icons is embedded in `Icon.jsx`, so glyphs are real DOM — they survive static capture, print and offline use, and inherit text colour. Need another icon? Add its inner markup to the `LUCIDE` map from `lucide-static@0.542.0`; unknown names render nothing and warn. Icons in nav and buttons are paired with a label; icon-only controls use `IconButton`, which requires `label`.
