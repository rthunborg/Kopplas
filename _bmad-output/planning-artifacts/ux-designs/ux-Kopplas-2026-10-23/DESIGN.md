---
name: Kopplas
description: Accepted visual direction for the connected Phase B electrical-contractor application.
status: accepted-direction
updated: 2026-10-23
implementation: not-authorized
sources:
  - .memlog.md
  - ../../../../docs/design/claude-design/v1/handoff/PROJEKTREGLER -CLAUDE.md-.md
  - ../../../../docs/design/claude-design/v1/handoff/design-system-source/readme.md
  - ../../../../docs/design/claude-design/v1/handoff/design-system-source/tokens/
  - reconcile-handoff-v1.md
colors:
  white: '#ffffff'
  n-025: '#fafafa'
  n-050: '#f5f5f6'
  n-100: '#eeeeef'
  n-150: '#e4e4e6'
  n-200: '#d6d6d9'
  n-300: '#b9b9bd'
  n-400: '#95959b'
  n-500: '#74747a'
  n-600: '#57575c'
  n-700: '#3d3d41'
  n-800: '#26262a'
  n-900: '#17171a'
  ink: '#0d0d0f'
  black: '#000000'
  page: '#ffffff'
  card: '#ffffff'
  sunken: '#f5f5f6'
  inset: '#fafafa'
  hover: '#f5f5f6'
  active: '#eeeeef'
  selected: '#f5f5f6'
  text-primary: '#0d0d0f'
  text-secondary: '#3d3d41'
  text-tertiary: '#57575c'
  text-disabled: '#57575c'
  border-subtle: '#e4e4e6'
  border-default: '#d6d6d9'
  border-strong: '#95959b'
  signal-050: '#fffbe6'
  signal-200: '#ffeda1'
  signal: '#ffd21f'
  signal-hover: '#f5c000'
  signal-600: '#c99a00'
  signal-700: '#8a6900'
  ok-surface: '#eef7f1'
  ok-dot: '#137a43'
  ok-text: '#0c5730'
  warn-surface: '#fdf4e7'
  warn-dot: '#a86a12'
  warn-text: '#7a4c0a'
  risk-surface: '#fdf0ef'
  risk-dot: '#b3261e'
  risk-text: '#8a1c16'
  info-surface: '#eff2fb'
  info-dot: '#2f4bd1'
  info-text: '#22389c'
  inverse-surface: '#0d0d0f'
  inverse-raised: '#17171a'
  inverse-text: '#ffffff'
  inverse-muted: '#95959b'
  scrim: '#0d0d0f7a'
  glass: '#ffffffb8'
typography:
  body: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 15px, fontWeight: 400, lineHeight: 1.45, letterSpacing: -0.005em}
  body-prose: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 17px, fontWeight: 400, lineHeight: 1.6, letterSpacing: -0.005em}
  title: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 30px, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.018em}
  heading: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 20px, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.018em}
  section: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 15px, fontWeight: 500, lineHeight: 1.2, letterSpacing: -0.018em}
  label: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 13px, fontWeight: 500, lineHeight: 1.45, letterSpacing: 0.01em}
  table: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 13px, fontWeight: 400, lineHeight: 1.45, letterSpacing: -0.005em}
  caption: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 12px, fontWeight: 400, lineHeight: 1.45, letterSpacing: -0.005em}
  micro: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 11px, fontWeight: 500, lineHeight: 1.45, letterSpacing: 0.09em}
  metric: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 38px, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.025em}
  display: {fontFamily: 'Inter Variable, Inter, system-ui, sans-serif', fontSize: 72px, fontWeight: 500, lineHeight: 1.05, letterSpacing: -0.03em}
  mono: {fontFamily: 'ui-monospace, SF Mono, Menlo, Consolas, monospace', fontSize: 13px, fontWeight: 400, lineHeight: 1.45, letterSpacing: 0em}
rounded:
  none: 0px
  DEFAULT: 8px
  control: 8px
  chip: 8px
  card: 8px
  sheet: 12px
  full: 999px
spacing:
  '0': 0px
  '1': 2px
  '2': 4px
  '3': 6px
  '4': 8px
  '5': 12px
  '6': 16px
  '7': 20px
  '8': 24px
  '9': 32px
  '10': 40px
  '11': 56px
  '12': 72px
  '13': 96px
  '14': 128px
  '15': 176px
  gutter: 24px
  gutter-field: 16px
  gutter-marketing: 32px
  sidebar: 248px
  topbar: 56px
  page-max: 1240px
  prose-max: 660px
  control-sm: 28px
  control-md: 34px
  control-lg: 44px
  row-block: 14px
  row-inline: 16px
components:
  AppShell: {background: '{colors.page}', sidebar: '{colors.sunken}', gutter: '{spacing.gutter}', sidebarWidth: '{spacing.sidebar}', topbarHeight: '{spacing.topbar}'}
  Button: {background: '{colors.ink}', foreground: '{colors.white}', radius: '{rounded.control}', height: '{spacing.control-md}'}
  Field: {radius: '{rounded.control}', foreground: '{colors.text-primary}', label: '{typography.label.fontSize}', focus: 'inset0 0 0 1px #0d0d0f'}
  SelectionRow: {background: '{colors.selected}', marker: 'inset2px0 0 #0d0d0f', paddingBlock: '{spacing.row-block}', paddingInline: '{spacing.row-inline}'}
  Table: {foreground: '{colors.text-secondary}', fontSize: '{typography.table.fontSize}', row: '{components.SelectionRow.background}'}
  StatusIndicator: {dotSize: 6px, fontSize: 14px, foreground: '{colors.text-primary}'}
  ConnectionChip: {radius: '{rounded.chip}', foreground: '{colors.text-secondary}', background: '{colors.sunken}', minHeight: 44px}
  Card: {background: '{colors.card}', radius: '{rounded.card}', padding: '{spacing.8}', shadow: none}
  SideSheet: {background: '{colors.card}', radius: '{rounded.sheet}', padding: '{spacing.8}'}
  LockConfirmDialog: {background: '{colors.card}', radius: '{rounded.sheet}', maxWidth: 520px}
  Banner: {radius: '{rounded.card}', paddingBlock: '{spacing.5}', paddingInline: '{spacing.6}'}
  Toast: {background: '{colors.inverse-surface}', foreground: '{colors.inverse-text}', radius: '{rounded.card}', fontSize: 13px}
  Tooltip: {background: '{colors.inverse-surface}', foreground: '{colors.inverse-text}', radius: '{rounded.control}', fontSize: 11px}
  EmptyState: {foreground: '{colors.text-primary}', headingSize: 17px, maxDescriptionWidth: 320px}
  WidgetCard: {background: '{colors.card}', radius: '{rounded.card}', padding: '{spacing.8}'}
  BookingBlock: {background: '{colors.sunken}', foreground: '{colors.text-primary}', radius: '{rounded.control}'}
  ConflictPanel: {background: '{colors.card}', radius: '{rounded.card}', foreground: '{colors.risk-text}'}
  RecurrencePreview: {background: '{colors.sunken}', foreground: '{colors.text-primary}', radius: '{rounded.card}'}
  CaptureButton: {background: '{colors.ink}', foreground: '{colors.white}', radius: '{rounded.control}', minHeight: 48px}
  AuditTrail: {foreground: '{colors.text-primary}', timeForeground: '{colors.text-tertiary}', spine: '{colors.border-default}'}
  Wizard: {background: '{colors.card}', radius: '{rounded.card}', gap: '{spacing.8}'}
  MaskedValue: {foreground: '{colors.text-primary}', label: Dold, icon: lock, fontSize: '{typography.label.fontSize}'}
  EffectivePermissions: {foreground: '{colors.text-primary}', background: '{colors.card}', row: '{components.SelectionRow.background}'}
---

## Brand & Style

Kopplas is an instrument panel for electrical contractors: quiet white ground, near-black actions, precise numbers and restrained functional color. The accepted direction inherits the supplied written design system, then applies the project's explicit amendments. This document owns appearance; [EXPERIENCE.md](EXPERIENCE.md) owns behavior. The spines win on conflict with any mock, prototype or imported artifact. Product requirements, manifest scope and domain safeguards remain binding.

This is **accepted direction, not final UX, implementation approval or a passed verification gate**. Owner approval of DT-2026-10-23 establishes the authority/cross-reference scheme; full story allocation and implementation readiness remain subject to targeted authoring and planning gates. DESIGN owns appearance and does not override PRD/ADR/manifest or detailed domain behavior. No application, backlog, schema or sprint change follows automatically.

Provenance: [project rules](../../../../docs/design/claude-design/v1/handoff/PROJEKTREGLER%20-CLAUDE.md-.md) lines3–69; [foundation readme](../../../../docs/design/claude-design/v1/handoff/design-system-source/readme.md) lines61–136; [reconciliation](reconcile-handoff-v1.md). Prototype styling is legacy even where it uses stronger selectors or `!important`.

Use a plain **Kopplas** wordmark in Inter 500, heading tracking, ink on white or white on ink. The owner is obtaining logo and photographic assets. Until selection, use neutral placeholders only when an image has a real layout purpose. Do not invent a logo, stock imagery, screenshots or placeholder modules. Swedish copy is concrete, sentence case, verbs first; no emoji or celebratory decoration.

## Colors

White is the page. Gray creates local inset depth rather than a gray application canvas. Yellow means focused/live emphasis, never a generic success or primary application button. Keep signal below approximately5% of a viewport; semantic hues belong to small dots, labels and meaningful deltas. Use dark semantic text on corresponding pale fills, not dot colors indiscriminately for text.

The [color tokens](../../../../docs/design/claude-design/v1/handoff/design-system-source/tokens/colors.css) supply the palette; project contrast aliases supersede their original text and border aliases. `scrim` and `glass` are eight-digit hex representations of approximately48% ink and 72% white, not opaque text colors. Preserve the source alpha intent when adapting CSS.

### Source-to-application alias mapping

| Supplied CSS alias | Contract token | Resolved value / adaptation |
|---|---|---|
| `--bg-page`, `--bg-raised`, `--surface-card` | `{colors.page}`, `{colors.card}` | #ffffff |
| `--bg-sunken`, `--bg-hover`, `--bg-selected` | `{colors.sunken}`, `{colors.hover}`, `{colors.selected}` | #f5f5f6 |
| `--bg-inset`, `--bg-active` | `{colors.inset}`, `{colors.active}` | #fafafa / #eeeeef |
| `--text-primary`, `--text-link` | `{colors.text-primary}` | #0d0d0f |
| `--text-secondary`, `--text-tertiary` | `{colors.text-secondary}`, `{colors.text-tertiary}` | #3d3d41 / #57575c |
| `--text-disabled` | `{colors.text-disabled}` | #57575c; high contrast, no whole-control opacity |
| `--border-subtle/default/strong` | `{colors.border-subtle}`, `{colors.border-default}`, `{colors.border-strong}` | #e4e4e6 / #d6d6d9 / #95959b |
| `--signal-400/500` | `{colors.signal}`, `{colors.signal-hover}` | #ffd21f / #f5c000 |
| semantic `--*-050/500/700` | `*-surface`, `*-dot`, `*-text` in colors | Full hex palette above |
| inverse primary | `{colors.inverse-text}` | #ffffff |
| inverse secondary/tertiary/disabled | `{colors.inverse-muted}` | #95959b; replace failing inherited n500/n600 |
| `--radius-control`, `--radius-chip` | `{rounded.control}`, `{rounded.chip}` | 8px |
| `--radius-card`, `--radius-sheet` | `{rounded.card}`, `{rounded.sheet}` | 8px / 12px |

This is a semantic adaptation map, not a claim that the current application's variables already implement it. The future implementation must bind existing design-system aliases without duplicating domain components.

### Contrast decisions

All text, including disabled labels, meets **4.5:1** against its actual surface. Disabled text uses the tertiary high-contrast mapping; disabled state additionally has a state label where needed, no activation and a distinct inset surface. It is never communicated by fading text. The n300–n500 text prohibition applies to **light surfaces**; inverse text may use an inverse alias only after measurement. Inverse surfaces are localized toast/overlay treatments, not authorization for a dark theme.

Calculated WCAG sRGB relative-luminance ratios (solid colors, rounded to two decimals; arithmetic evidence only, not browser/composite validation):

| Foreground / background | Ratio | Use |
|---|---:|---|
| #57575c / #eeeeef | 6.20:1 | darkest approved light neutral background with tertiary/disabled text |
| #3d3d41 / #f5f5f6 | 9.92:1 | secondary on inset |
| #ffffff / #0d0d0f | 19.42:1 | primary action / inverse text |
| #0d0d0f / #ffd21f | 13.40:1 | signal label |
| #95959b / #17171a | 6.01:1 | inverse muted on raised inverse surface |
| #74747a / #0d0d0f | **4.18:1, rejected** | inherited inverse tertiary cannot be copied |
| #0c5730 / #eef7f1 | 7.93:1 | success text |
| #7a4c0a / #fdf4e7 | 6.72:1 | warning text |
| #8a1c16 / #fdf0ef | 8.36:1 | risk text |
| #22389c / #eff2fb | 8.88:1 | information text |

Text over glass, imagery or scrims must be measured after compositing in its actual state; use an opaque backing when contrast cannot be guaranteed. Control boundaries/focus indicators must also meet applicable non-text contrast requirements; a subtle structural divider alone is not a control affordance.

## Typography

Use the supplied Inter roman/italic variable fonts, subject to production asset provenance/licensing checks. [Typography tokens](../../../../docs/design/claude-design/v1/handoff/design-system-source/tokens/typography.css) define the full size ramp: **11 / 12 / 13 / 14 / 15 / 17 / 20 / 24 / 30 / 38 / 52 / 72 / 104px**. Font roles above are application defaults, not permission to shrink text to fit. 400 is body, 500 headings and labels, 600 numeric emphasis; never700+. At display sizes use optical axis `opsz32` and tight tracking; the30px page title retains the explicit heading tracking role. The inherited metric uses −.025em tracking.

Use tabular numerals in tables, money fields and metrics. Use mono only for IDs/article numbers/log timestamps. Uppercase11px with .09em tracking is a micro-label or table header, never sufficient section structure. Other copy is sentence case. Italics are for quoted values/system notes, not emphasis. Links use ink with a visible underline; no blue link convention.

## Layout & Spacing

The [spacing ramp](../../../../docs/design/claude-design/v1/handoff/design-system-source/tokens/spacing.css) supplies the scale. Office rhythm is8/12/16/24px; field pages use16px edge gutters as a proportionate responsive adaptation, retaining44px minimum touch targets. Desktop sidebar 248px, topbar56px, content gutter24px. Sidebar is sunken with right hairline; header white or permitted glass with bottom hairline. Reading width660px; marketing reference maximum1240px is a foundation value, not new marketing scope.

At360×640, collapse permanent sidebar into explicit navigation; stack card/form groups and keep actions reachable without hiding server/error state. Wide data grids use a labeled scroll region or a deliberate compact record composition, never clipped values. Exact breakpoint and scheduling geometry require screen-level verification; do not infer them from prototype widths. Dense office controls28/34px are valid only outside field touch flows.

Cards have24px default padding, compact groups16px where content requires it. List/table rows use14px block and 16px inline padding. Do not revive source Table's12×16px or8×12px dense row as a competing default. One card carries one task. Section headers use n100, strong top border,15px/500; ordinary rows white with subtle bottom border.

Plan/calculation uses sunken/secondary; actual uses white with ink border or ink heading and 600 primary figures. Column group bands are n100 for plan and ink/white for actual. Show signed semantic delta separately; never communicate financial meaning solely with a colored bar.

## Elevation & Depth

Cards have a1px border and **no shadow at rest**, lift or scale. Structural depth uses tone and full-bleed internal hairlines. [Elevation tokens](../../../../docs/design/claude-design/v1/handoff/design-system-source/tokens/elevation.css): popover shadow `0 4px12px -2px rgb(13 13 15 / .08), 0 1px2px rgb(13 13 15 / .04)`; modal/sheet shadow `0 16px40px -8px rgb(13 13 15 / .14), 0 2px6px rgb(13 13 15 / .05)`. Toast is a floating layer and may use the latter. Do not apply the available small shadow to anchored widgets or selected segments.

Blur is limited to sticky header glass (`saturate(160%) blur(20px)`) and the modal scrim treatment. Decorative gradients are excluded; functional photograph protection/scroll-edge fades remain allowed only when necessary.

Motion follows [motion tokens](../../../../docs/design/claude-design/v1/handoff/design-system-source/tokens/motion.css):80ms instant,140ms feedback,220ms panel,420ms sheet,700ms marketing reveal. Standard easing `cubic-bezier(.2,0,.2,1)`, entrance `.16,1,.3,1`, inward `.6,0,1,1`. Use opacity and 4–8px translate only where explanatory. No spring/bounce/scale entrances or card cascade. Reduced motion zeroes durations. Loading is a flat neutral skeleton, hairline progress or clear text, without shimmer.

## Shapes

The project amendment is decisive: buttons, fields, selectors, tabs and chips use8px; cards8px; sheets/dialogs12px. Source chip 3/control 5px and prototype999px controls are superseded. Pills are limited to status pills, avatars and gantt bars. Circular radio indicators and switch track/thumb are intrinsic exceptions; their surrounding interaction area still follows touch sizing and 8px container rules. The source progress primitive uses pill ends, but this does not add another exception to the accepted project shape rule; retain a thin neutral track without treating it as a pill control. Tooltip and toast use8px to avoid an extra radius dialect.

## Components

Names are shared with EXPERIENCE.md; inherited primitives are visual references, not copied runtime code. All controls have visible focus: general2px ink outline with 2px offset; text entry uses the specified inset1px focus line with a sufficiently visible boundary. Selected rows retain their marker on keyboard focus. Error/selected/loading/disabled states combine words or structure with color.

| Component | Visual anatomy and states | Inheritance / adaptation |
|---|---|---|
| AppShell | White canvas,248px sunken sidebar,56px header; current item gets selected fill +2px ink marker; field navigation collapses. | SidebarNav/TopBar foundation, project selected-row rule wins. |
| Button | Ink/white primary, one primary action per view; secondary white/ink strong border, ghost neutral, destructive risk text. Heights28/34/44, horizontal padding 12/16/20, font 12/13/15 at 500;8px radius. Hover ink lightens to n800; no press shrink. Disabled high-contrast text on inset, no opacity. | Button sizes/variants; marketing signal variant is not application default. |
| Field |13px/500 label, hint/error below; input/select/date/textarea border0,8px. White on gray, n050 on white. Inset ink focus; errors name issue beside field rather than introducing general red borders.44px field touch height. | Field + Input/Select/Textarea; source borders/outer ring replaced. |
| SelectionRow | n050 selected, inset2px ink left marker, first cell500;14×16 padding and subtle separator. | Explicit project rule, including table first-cell marker. |
| Table |11px uppercase 500 header,13px cells/tabular numbers, money/quantity right aligned, no zebra. Ink first column, secondary ordinary values; important numbers primary/semantic. Horizontal overflow intentional. | Table amended by SelectionRow and contrast contract. |
| StatusIndicator |6px dot plus visible word;14px text,6px gap. Draft neutral dot; planned info, active signal, waiting warn, complete ok, deviation risk. Text remains contrast-safe. | StatusDot; no glyph-only status. |
| ConnectionChip | Entity relationship chip with type icon and readable label, 8px radius and at least 44px tappable area. Linked record has a clear link affordance. | Badge/Tag appearance adapted to the existing entity-link contract; network feedback uses Banner. |
| Card | White,8px,1px default border,no shadow;24px padding. Section header n100,15/500,strong top line. Interactive border may darken. | Card + project grouping amendment. |
| SideSheet | White floating12px surface,24px padding, ink 48% scrim where modal, lg shadow. On narrow screens use available width without clipping; actions remain reachable. | Sheet foundation from radius/elevation, not prototype panel widths. |
| LockConfirmDialog | Centered white12px, default max520px,24px viewport/body space;17px/500 title,13px consequence, clear cancel/confirm hierarchy. | Modal; destructive action uses Button danger, no alarming full red surface. |
| Banner | In-flow8px,12×16 padding, small semantic icon + explicit title/action; pale semantic fill with 700 text. | Banner; message is local feedback, not decorative colored section. |
| Toast | One-line completed-action message, inverse ink/white,13px,8px,12×16 padding, bottom center in free viewport area. Muted dismiss text uses inverse-muted. | Toast; source “pill” wording resolved to project8px rule. |
| Tooltip |11px white on ink,8px,5×12 padding; small hover/focus clarification. Never the sole carrier of state. | Tooltip; source3px superseded. |
| EmptyState | Centered17px/500 title,13px secondary description max320px, one optional action, generous72×24 spacing where space permits. | EmptyState; no invented photography. |
| WidgetCard | Card anatomy plus micro-label/metric,38px/600 tabular figure, signed12px delta; loading neutral and flat. | Card/Metric; no shadow, charts need labels not decorative gradients. |
| BookingBlock |8px compact calendar rectangle, primary readable title/time, neutral fill, small status dot or left semantic marker; selected ink marker distinct from conflict. | New composition of SelectionRow/StatusIndicator; no imported scheduling behavior. |
| ConflictPanel | Card/SideSheet composition, risk title and explicit conflicting records on white; compare values in labeled rows with actionable choices. | Existing primitives; never an all-red panel. |
| RecurrencePreview | Sunken8px group containing dated rows, count and exclusions in primary/secondary text; proposed versus committed states visibly labeled. | Table/SelectionRow composition. |
| CaptureButton | At least 48px touch target, real icon plus label; progress/failure written out. No custom camera brand mark. | Button/Icon composition; no simulated capture output. |
| AuditTrail | Time gutter92px, spine 16px, gap 12px,1px neutral line,7px event dot;13px title and 12px time/meta. Reflow gutter when narrow. | Timeline; all text respects contrast. |
| Wizard | Card/SideSheet body with labeled step indicator and current step ink;24px grouped fields, secondary back and primary next/save. | PhaseChain visual idea may be adapted; no signal-heavy journey decoration. |
| MaskedValue | Lock glyph plus the readable label `Dold` and an explainer. Withheld payload is absent; do not render a masked numeric value, hidden numeric prop or reveal action. | Existing UX section 6 privacy contract; behavior in EXPERIENCE. |
| EffectivePermissions | Table/SelectionRow composition with named role/resource and explicit granted/denied/inherited words, small dot optional; no color-only permission matrix. | Table/StatusIndicator; does not change authorization semantics. |

Inherited names remain aliases/compositions rather than additional primitives: **NotificationItem** uses SelectionRow with a StatusIndicator and readable title/time; **QueueList** uses Table or stacked SelectionRow composition with its existing empty/error states; **StatusBadge** uses the StatusIndicator vocabulary in an 8px chip with contrast-safe semantic text. These mappings preserve existing behavior and scope; they do not introduce new notification categories or queues.

### Source amendments and decisions

| Source detail | Resolution | Basis |
|---|---|---|
| control 5/chip 3 | control/chip 8 | Project rules20–33 supersede radius token/readme/specimens. |
| secondary n600/tertiary n400; faint disabled n300 | secondary n700, tertiary/disabled n600 | Project35–45 plus owner-delegated all-text contrast decision. |
| subtle n100/default n150/strong n300 | n150/n200/n400 | Project40–41. |
| Table selected fill only, no marker;12×16 default | marker + first cell500 +14×16 | Project3–18; don't copy workaround helpers as architecture. |
| Input border and outside focus ring | contextual borderless fill + inset1px ink | Project46–50; time-report status-border exception only. |
| n500 inverse tertiary | inverse-muted n400 | Measured4.18 failure; accepted light-only prohibition interpretation. |
| Switch/radio circular geometry | intrinsic exception | Accepted owner-delegated interpretation; not broad pill controls. |
| prototype signal/pill/selection overrides | exclude entirely | Owner precedence; no prototype styling exception. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use written rules then compatible foundation tokens | Reproduce prototype pill controls, changed yellow or n200 selection |
| Show server/error/disabled state with readable text | Fade essential or disabled labels below4.5:1 |
| Keep white page, restrained hierarchy and functional color | Use gray page canvas, decorative cards or gradients |
| Use Lucide-style currentColor stroke icons with labels | Treat screenshots, uploaded logos or embedded runtime as approved production assets |
| Preserve connected360×640 use and explicit failure/retry | Invent offline queues, customer portal, AI controls or other Phase C surfaces |

### Prospective verification and reference coverage

No new screen mocks have been rendered. Every surface in EXPERIENCE.md is currently **spine-only**; preserved prototype images/styles are not fidelity targets. This limits evidence for scheduling density, resizable table layouts, sheet/action placement and field navigation. Screen-level reference selection remains an explicit handoff item, not an implied passed gate.

Future visual validation must cover office shell and dense table, selected/focused rows, contextual fields on white/gray, dialogs/sheets, all feedback states, a scheduling grid with overlaps/recurrence/conflict, widgets, permissions/masked values and capture at 360×640. Include loading/empty/error/offline/disabled/permission-denied states where applicable, zoom/reflow, keyboard focus, measured composite contrast, reduced motion and server-confirmed success. Record viewport/state/rendering environment and compare against these spines; no screenshot-comparison, accessibility or integration gate has run here.
