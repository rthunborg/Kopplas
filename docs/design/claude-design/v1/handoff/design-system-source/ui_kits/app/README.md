# UI kit — Kopplas app

Interactive recreation of the Kopplas operations system (Swedish UI). Open `index.html`.

## Screens
| File | Screen |
|---|---|
| `AppShell.jsx` | 248px sidebar + 56px sticky topbar + toast host |
| `Oversikt.jsx` | Dashboard: attest banner, KPI strip, projects in progress, phase chain, event log |
| `Projektlista` (in `index.html`) | Project list with progress column and filters |
| `ProjektDetalj.jsx` | Project detail: phase chain, tabs (Översikt / Tid / Material / Dokument / ÄTA), egenkontroll checklist |
| `Anbud.jsx` | Quote pipeline + "Nytt anbud" modal |
| `Fakturering.jsx` | Invoice list, invoice draft modal, and `TidAttest` (time approval) |
| `Tillgangar.jsx` | Assets & maintenance: overdue calibration banner, asset table, maintenance timeline |
| `Installningar.jsx` | Settings forms |
| `data.js` | Fake Swedish sample data on `window.KopplasData` |

## Click-through
Sidebar navigates. Dashboard rows and project rows open the project detail. "Skapa faktura" in a project jumps to Fakturering with the draft modal open. Sending an invoice, saving a quote and approving time all raise a toast. Modals, tabs, filters, checkboxes and switches are live.

## Notes
Screens compose the published primitives from `window.KopplaDesignSystem_*` — no component is re-implemented here. Everything is cosmetic: no persistence, no validation, no routing.
