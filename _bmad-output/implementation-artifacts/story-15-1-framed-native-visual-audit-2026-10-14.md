# Story 15.1 framed native visual audit — 2026-10-14

Outcome: bounded pixel audit complete; story remains blocked. Route: independent native visual auditor, Sol 6.1 Low. This is no broad review or Phase 5 completion credit.

Evidence: native run 38596630798, exact head `da3a4c595df22c0f699a19f56c16976fab08b925`. Original archive 11913012004 and extracted-file integrity were independently verified by the High evidence reviewer, as reported by the coordinator. This auditor independently parsed only the HTML embedded base64 ZIP metadata in memory, mapped the attachments below, checked PNG header dimensions and SHA256, and actually viewed all ten local images with `view_image`. HTML was not executed. Every image is **1440×1000**. Earlier-head images supply no credit here.

Base path: `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/.env.epic15.mail-runtime/ci-passive-diagnostics-38596630798/playwright-report/`.

| Native attachment label | Retry | Actual relative path | SHA256 |
| --- | ---: | --- | --- |
| desktop-schema-week | 0 | `data/ae719e39789bb522574069cf5c73e6ed0bfe8b5f.png` | `09cf041becf5b42a9e781320cf008144e303d5c6566135dca2f60c10e85c194a` |
| desktop-resources-week | 0 | `data/8c54f9e826070eeb25f7301e47f417d9b3eff056.png` | `a02defed9494964674f0e10a055534426f6d800772baf5a7196c95bec4a14e35` |
| desktop-team-week | 0 | `data/4cfc2d6aa9592be81e92907d4c6671e746d76edd.png` | `c979156b08ba3b0a66761e5c1442029ea3b930bad6ab6885274916f65607ebc2` |
| desktop-capacity-week | 0 | `data/cfda0b3c34ca90ac285391c300d3b9dd8a6cae98.png` | `380bbcfc023f348d7461e9632bd20f7926dfa9f14386949ffc538830bb79c897` |
| desktop-personal-calendar-week | 0 | `data/074cbac3f7feddfce7ef1ed576faf9772adb82ad.png` | `1b80d72e21f5a59c27aeb3e6f6cef15b2b96047318e8139625e2fd74c7ea5481` |
| desktop-schema-week | 1 | `data/d793cfefc6c9a2c3b092b25c6e813648f20dcedb.png` | `4135132140f677001aacdf10f8652f7938b9f8d7851e968226390910e667355e` |
| desktop-resources-week | 1 | `data/25acd525ba9e0194a97ecc1b015d46f09f44ec80.png` | `a6546b26fadcb79cf2c7258e1e3a15e8018c6b23ebbaebdeefe67259bac0a8ba` |
| desktop-team-week | 1 | `data/bf7a1ea9f7c748be1e90706e1ab580f9f52e0795.png` | `bd9c9212ebc30d95751244fd9ef0d06e21b678e3b5b3fbe1a2ab96f8f4e27761` |
| desktop-capacity-week | 1 | `data/ec44d20b4ca97fafa88c482e57840940dec0e05f.png` | `7648ebb6fd0ad01b57a02bee80322b6bd2ce422eb99f4c4e70d83deb9c123068` |
| desktop-personal-calendar-week | 1 | `data/fa4396bc14abfed0d9c1de5c1cd2a3aed169655b.png` | `0a4d3b7566fc6c3ecb4a43f95ed1974ef47270074c479f8a57ab6f09c3ac1bee` |

## Concrete pixel findings

Both attempts have materially consistent layout and different fixture descriptions/identifiers.

- **Schema:** The reframed first-day booking visibly states 2026-10-12 09:00–10:00, wraps multiple assignee/context labels, and exposes `Redigera / flytta` and `Ändra längd`. Neighboring columns show business-hour interval controls; later-day booking cards are visible. The first card begins above the crop, and toolbar/day headers are outside it. This is meaningful booking/interval/action evidence, not complete navigation evidence.
- **Resurser:** The selected long booking card is visible from description through 09:00–10:00, wrapped assignee/context text and both edit/move and resize controls. It occupies nearly the entire image height. Only slivers of the interval row remain at the top; person/role row headings, reassignment header and toolbar are outside this crop. Their absence here does not establish their absence from the page.
- **Min kalender:** The 09:00 and 09:30 `bokat` interval controls surround the visible 09:00–10:00 booking with wrapped multi-assignee text. Other columns display business-hour slots. No edit/move/resize action is visible in these personal-calendar crops, so none is claimed. Toolbar/day headings are outside the crop.
- **Team:** Five view tabs and active Team emphasis, date/period/filters/new-booking/interval/reset controls, a work-role heading, seven date columns and wrapped booking cards are visible. Tall cards extend below the image. This filtered state does not display `Ingen arbetsroll`; no-role visual proof is therefore absent here. The approved owner choice is work-role grouping, not named teams or verified legacy parity.
- **Beläggning:** Tabs/toolbar, capacity-scope explanatory text, person/date headings, numeric booked/budget/balance/percentage values, `Ingen kapacitet`, colored cells/bars and `Visa bokningar` drilldown labels are visible. Examples include 210/480 min with 270 min balance and 44%, 60/0 min with -60 min and no capacity, and 540/480 min with -60 min and 113%. Later columns are cropped to the right. No separate color legend is visible; explanatory and numeric text are visible. This records pixels only, not independent arithmetic or interaction execution.

The new framing addresses the earlier missing booking-block evidence for the three scrolled targets. It trades overview chrome for booking content. Static crops do not prove scrolling inaccessible, a reachable application defect, full-card/day usability or screen-reader behavior. Capture adequacy is not application usability certification. No app/source/test/helper/spec, fixture, filter, permission, CI or resource change was made by this audit.

## Native and visual gate limits

Coordinator/independent native audit reports general inventory 382 cases: 368 passed, one failed, 13 skipped. The first seven scheduling cases passed in both attempts; AC2 failed with `net::ERR_ABORTED` in both before the tampered navigation, and ten later scheduling cases did not execute. Editor 19 and auth/mail two cases passed. These native results are contextual evidence reported to this pixel reviewer, not conclusions inferred from screenshots or a runtime execution by this auditor.

Only ten desktop attachments exist here: five labels across two attempts. All six phone labels remain unexecuted. Consequently, the required eleven distinct target set is incomplete; no visual gate completion is claimed. Fresh exact-head phone agenda, capacity summary, editor draft, actual save-failure/retry and long-label images remain required along with the outstanding native gates.

`AGENTS.md:101,105`, approved corrected spec `:80,94,132,137` and the preceding framing addendum retain production-server, connected 360×640 and server-confirmed failure/retry requirements. The generic global visual adapter scripts/reference mappings are absent from this checkout; no approved Figma ID/reference PNG is available. No Figma/similarity comparison pass, invented waiver, 90% similarity or legacy-parity claim is supplied. The owner's Lovable disposition does not waive these remaining gates. Manual assistive-technology, daylight, one-hand usability and representative p95 performance remain unverified. No concrete reachable visual blocker is established by these pixels; story status and broad review count remain unchanged.
