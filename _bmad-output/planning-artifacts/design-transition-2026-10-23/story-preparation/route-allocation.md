# Integrated route allocation — exact source base 99104d0

All rows retain existing checked commands; allocation is prospective, never a code claim. API/callback routes are semantic consumers and do not acquire page UI. Actual imports/exports and SHA-256 are in base-and-consumers.json. DT-B15 route names remain explicitly unbound until integration.

| Source file | Actual route | Follow-up / disposition |
| --- | --- | --- |
| `src/app/(app)/(notification-settings)/settings/notifications/page.tsx` | `/settings/notifications` | 35.15; APIs remain JSON semantic consumers |
| `src/app/(app)/admin/users/[membershipId]/page.tsx` | `/admin/users/[membershipId]` | 35.16 users/roles; profile section 35.13/E15 |
| `src/app/(app)/admin/users/page.tsx` | `/admin/users` | 35.16 users/roles; profile section 35.13/E15 |
| `src/app/(app)/calculations/[calculationId]/page.tsx` | `/calculations/[calculationId]` | 35.8 |
| `src/app/(app)/calculations/page.tsx` | `/calculations` | 35.8 |
| `src/app/(app)/customers/[customerId]/page.tsx` | `/customers/[customerId]` | 35.6 (foundation representative flow 35.3) |
| `src/app/(app)/customers/page.tsx` | `/customers` | 35.6 (foundation representative flow 35.3) |
| `src/app/(app)/dashboard/page.tsx` | `/dashboard` | 35.14 / existing landing; shell 35.5 |
| `src/app/(app)/files/page.tsx` | `/files` | 35.11 (foundation selected preview 35.4) |
| `src/app/(app)/jobs/[jobId]/page.tsx` | `/jobs/[jobId]` | 35.10; existing booking semantic consumer, E15-owned behavior |
| `src/app/(app)/jobs/page.tsx` | `/jobs` | 35.10; existing booking semantic consumer, E15-owned behavior |
| `src/app/(app)/notifications/page.tsx` | `/notifications` | 35.15; APIs remain JSON semantic consumers |
| `src/app/(app)/quotes/[quoteId]/page.tsx` | `/quotes/[quoteId]` | 35.9 |
| `src/app/(app)/quotes/[quoteId]/versions/[versionId]/page.tsx` | `/quotes/[quoteId]/versions/[versionId]` | 35.9 |
| `src/app/(app)/quotes/page.tsx` | `/quotes` | 35.9 |
| `src/app/(app)/settings/company/page.tsx` | `/settings/company` | 35.7; onboarding composition 35.17 |
| `src/app/(app)/settings/page.tsx` | `/settings` | 35.7; onboarding composition 35.17 |
| `src/app/(app)/settings/pricing/page.tsx` | `/settings/pricing` | 35.7; onboarding composition 35.17 |
| `src/app/(app)/settings/quote-terms/page.tsx` | `/settings/quote-terms` | 35.7; onboarding composition 35.17 |
| `src/app/(auth)/invite/accept/page.tsx` | `/invite/accept` | 35.19 auth/callback/public feedback; login foundation 35.2 |
| `src/app/(auth)/login/page.tsx` | `/login` | 35.19 auth/callback/public feedback; login foundation 35.2 |
| `src/app/(auth)/password/update/page.tsx` | `/password/update` | 35.19 auth/callback/public feedback; login foundation 35.2 |
| `src/app/(public)/unsubscribe/[token]/route.ts` | `/unsubscribe/[token]` | 35.19 auth/callback/public feedback; login foundation 35.2 |
| `src/app/api/jobs/run/route.ts` | `/api/jobs/run` | Nonvisual authenticated runner: no restyle/new privilege |
| `src/app/api/notifications/[id]/read/route.ts` | `/api/notifications/[id]/read` | 35.15; APIs remain JSON semantic consumers |
| `src/app/api/notifications/preferences/route.ts` | `/api/notifications/preferences` | 35.15; APIs remain JSON semantic consumers |
| `src/app/api/notifications/read-all/route.ts` | `/api/notifications/read-all` | 35.15; APIs remain JSON semantic consumers |
| `src/app/api/notifications/route.ts` | `/api/notifications` | 35.15; APIs remain JSON semantic consumers |
| `src/app/api/quotes/[quoteVersionId]/delivery-recipients/route.ts` | `/api/quotes/[quoteVersionId]/delivery-recipients` | 35.9 semantic delivery-recipient consumer; no new page |
| `src/app/auth/invite/complete/page.tsx` | `/auth/invite/complete` | 35.19 auth/callback/public feedback; login foundation 35.2 |
| `src/app/auth/invite/confirm/route.ts` | `/auth/invite/confirm` | 35.19 auth/callback/public feedback; login foundation 35.2 |
| `src/app/operator/[tenantId]/page.tsx` | `/operator/[tenantId]` | 35.18 |
| `src/app/operator/page.tsx` | `/operator` | 35.18 |
| `src/app/page.tsx` | `/` | 35.14 / existing landing; shell 35.5 |

## Embedded/unbuilt surfaces

- Facilities/contacts are children of /customers/[customerId]; own articles/work roles live in /settings/pricing. Onboarding checklist/reminder is embedded, not a new /onboarding route.
- Current job five-tab registry lives at /jobs/[jobId] with tab/workOrder query identity; no route is invented for future Material/Ekonomi/Dagbok/Foton/Avvikelser/Risk/Chatt/Rapporter.
- No calendar/feed/asset-QR page or route exists in this pinned app tree. Scheduling/time/Min dag must bind actual integrated E15 route and action hashes at DT-B15; QR remains future E22.
- All 17 MAIN/eight FIELD source IDs retain accepted crosswalk dispositions; unsupported intake/global chat/inbound invoices/work packages never become routes through this allocation.
- Shell/primitive changes affect every route indirectly; owner reconciliation includes semantic inheritance even where source paths differ.
