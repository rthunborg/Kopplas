# Kopplas — projektregler

## Markering av vald rad (gäller alla listor och tabeller)
En och samma markering i hela systemet, från Förfrågningar:

- `background: var(--bg-selected)`
- `box-shadow: inset 2px 0 0 var(--n-950)` — 2 px bläckmarkör i vänsterkant
- första cellens text i `--weight-medium`
- `cursor: pointer` och `transition: background-color var(--dur-fast) var(--ease-standard)`
- radskiljare: `1px solid var(--border-subtle)`, radhöjd via `padding: 14px 16px`

I logikklassen finns `selRow(on, cols, gap)` för egna listor och `selCell(on, text)` för
designsystemets `Table` (bläckmarkören renderas i första kolumnen eftersom Table inte
kan styla raden). Bygg inga nya varianter — använd dessa två.

Designsystemet (KopplaDesignSystem_4b46f2) är read-only härifrån. `Table` markerar i dag
bara med `--bg-selected`; bläckmarkören behöver läggas in i `components/data/Table.jsx`
i designsystemprojektet för att regeln ska gälla utanför det här projektet.

## En radie för alla kontroller
Knappar, fält, väljare, flikar och statuschips har samma radie: **8 px**.
Sätts en gång per DC i `<helmet>` genom att skriva över designsystemets token:

```css
:root{--radius-control:8px;--radius-chip:8px}
```

Egna kontroller ska använda `border-radius:8px` — inte 3, 5 eller 12 px. Kort ligger
kvar på 8 px, ark/modaler på 12 px, och pillerform (`999px`) används bara för
gantt-staplar, statuspiller och avatarer.

Designsystemet självt har `--radius-control: 5px`; ändringen behöver göras i
`tokens/radius.css` i designsystemprojektet för att gälla utanför det här projektet.

## Kontrast
All text ska klara **4.5:1** mot ytan den står på — även på grå `--bg-sunken` och `--n-100`.
Projektet skärper designsystemets tokens i `<helmet>`:

```css
:root{--text-secondary:var(--n-700);--text-tertiary:var(--n-600);
--border-subtle:var(--n-150);--border-default:var(--n-200);--border-strong:var(--n-400)}
```

- `--text-tertiary` är den ljusaste tillåtna textfärgen. Använd aldrig `--n-300`–`--n-500` för text.
- Ingen text med opacity eller `color-mix` för att dämpa den.
- Inmatningsfält (input, select, textarea, datumknapp) har **ingen kant** (`border: 0`) och syns bara genom tonskillnad mot ytan:
  - på grå yta (`--n-050`, `--bg-sunken`, `--n-100`) är fältet **vitt** (`#ffffff`)
  - på vit yta (inloggning, modaler, ark, kort i kort, sidan) är fältet **ljusgrått** (`--n-050`)
  - fokus: `box-shadow: inset 0 0 0 1px var(--n-950)`
  - undantag: tidrapportens rutor får färgad kant bara som statussignal (ändrad/saknas).
- Siffror som betyder något (summor, TG, avvikelse) står i `--text-primary` eller semantisk färg,
  aldrig i tertiär.

## Indelning
Tre nivåer, alltid i den här ordningen — bygg inga mellanvarianter:

1. **Kort** — `--surface-card`, radie 8 px, ingen skugga. Ett kort = en uppgift.
2. **Sektionshuvud i kort** — rad med `background: var(--n-100)`, `border-top: 1px solid var(--border-strong)`,
   rubrik 15 px / 500. Används för grupper (arbetspaket, jobb i tidrapporten, kapitel i byggdagboken).
3. **Rad** — vit, `border-bottom: 1px solid var(--border-subtle)`, markering enligt reglen ovan.

Rubriker i versaler (11 px, `--track-caps`) är etiketter, inte sektioner — de får aldrig ensamma
bära en indelning.

## Jämförelser (kalkyl mot utfall, plan mot rapporterat)
- **Plan/kalkyl** står på grå yta (`--bg-sunken`) i `--text-secondary`.
- **Utfall/verkligt** står på vit yta med 1 px bläckkant eller bläckrubrik, i `--text-primary`, 600.
- Kolumngrupper får rubrikband: kalkyl på `--n-100`, utfall på `--n-950` med vit text.
- Avvikelsen visas separat med tecken (+/−) och semantisk färg: grönt bättre, rött sämre.
