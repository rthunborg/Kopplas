# Assets

| Path | What | Source |
|---|---|---|
| `fonts/Inter-Variable.ttf` | Inter variable, roman (opsz + wght axes) | Client-supplied (`uploads/`) |
| `fonts/Inter-Italic-Variable.ttf` | Inter variable, italic | Client-supplied (`uploads/`) |

## Missing, by design

- **No logo.** None was provided and none was drawn. The brand appears as the wordmark "Kopplas" set in Inter 500 — see `guidelines/brand-wordmark.card.html`.
- **No photography or illustration.** Kits use grey `--bg-sunken` blocks captioned with the intended subject.
- **Icons are not stored here.** Kopplas embeds the geometry of 57 Lucide 0.542.0 icons directly in `components/core/Icon.jsx` (inline SVG, `stroke="currentColor"`, no network). **This is a flagged substitution** — swap it if the client owns an icon set.
- **No mono typeface.** `--font-mono` is the system stack.
