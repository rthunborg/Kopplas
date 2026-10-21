# Kopplas – överlämning

## Innehåll
- `Verksamhetssystem.dc.html` – huvudapplikationen (mall + logikklass i samma fil). Öppnas direkt i webbläsare.
- `Fältvy.dc.html`, `Arkitektur -internt-.dc.html` – övriga vyer.
- `Kopplat-verksamhetssystem.html` – äldre fristående export (genererad, ej källa).
- `support.js` – körmiljö för .dc.html-filer (genererad runtime, laddar React 18.3.1 + Babel från unpkg).
- `ds-base.js`, `ios-frame.jsx` – hjälpfiler.
- `uploads/` – logotyp och bilder som appen refererar.
- `_ds/koppla-design-system-4b46f26a-…/` – den kompilerade kopia av designsystemet som appen faktiskt laddar (`_ds_bundle.js`, tokens, typsnitt).
- `design-system-source/` – originalkällan till designsystemet, kopierad från det separata designsystemprojektet
  "Koppla Design System" (id 4b46f26a-fdce-415f-b082-d547dd01ae37): `components/**/*.jsx` (+ .d.ts, .prompt.md), tokens, assets/fonts,
  guidelines, templates, ui_kits, readme.md, SKILL.md, styles.css, manifest och bundle.
- `PROJEKTREGLER (CLAUDE.md).md` – projektets designregler (filen heter CLAUDE.md i projektet).

## Beroenden
- React 18.3.1, ReactDOM 18.3.1, @babel/standalone 7.29.0 – laddas från unpkg.com (CDN), ingår inte i paketet.
- Inget package.json eller byggkonfiguration finns, varken i appen eller i designsystemet.
  `_ds_bundle.js` är genererad av verktyget från `design-system-source/components`; byggskriptet för den finns inte tillgängligt.

## Att veta
- Appen använder `_ds/…/_ds_bundle.js`, inte filerna i `design-system-source/`. Ändringar i .jsx-källan slår inte igenom förrän bundlen byggs om.
- Projektet skriver över vissa designsystem-tokens i `<helmet>` (radie, kontrast) – se projektreglerna.
