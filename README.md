# FieldOps — web dashboard

Management dashboard for FieldOps, a platform that digitises field operations:
work orders, GPS-verified site visits, inspections, issue reporting and asset
maintenance history.

The demo tenant is **SunGrid Energy**, a fictional Nigerian solar and mini-grid
operator with 6 sites, 14 assets and 7 field staff.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The dashboard runs on demo data (`src/lib/demo-data.ts`), so you don't need a backend to present it.

## Demo script (5 minutes)

1. **Overview**: a critical issue banner is live. Emeka reported INV-104 overheating at Warri 22 minutes ago, with photos.
2. Click **View details** to see the field report, the photos stamped with time and GPS, the asset and the reporter.
3. Click **Create work order**. The form is pre-filled from the issue. Pick a technician (the ones based at that site appear first) and submit. The technician gets a push notification.
4. **Assets → INV-104** shows its maintenance history and upcoming service.
5. **Reports** shows completion rate, average time to resolve an issue, share fixed on the first visit and share of GPS-verified check-ins.

## Structure

```
src/
  app/                  routes: overview, issues, work-orders, sites, assets, workers, reports
  components/           sidebar, topbar, shared UI (badges, tables, cards)
  lib/
    types.ts            domain types
    demo-data.ts        SunGrid Energy demo dataset
    data.ts             data access layer (every page reads through this)
    supabase/server.ts  Supabase client for when the backend is connected
supabase/
  migrations/0001_init.sql   multi-tenant Postgres schema with row-level security
  seed.sql                   demo organization, sites, asset types, inspection template
```

## Connecting Supabase

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Apply `supabase/migrations/0001_init.sql` and then `supabase/seed.sql`.
3. Replace the getters in `src/lib/data.ts` with queries through `createClient()`.
   Pages don't need to change.

## Design decisions

- **Multi-tenant from day one.** Every table has an `organization_id`, and row-level security scopes each user to their own organization.
- **Configurable per industry.** Asset types, service intervals and inspection checklists are data (`asset_types`, `inspection_templates.items` JSON), not code.
- **Evidence the buyer can trust.** Work orders store the check-in coordinates and whether they fell inside the site boundary. Photos keep the capture time and location recorded on the phone.
- **Audit trail.** `activity_log` records every state change.

## Next

- Supabase Auth and role-based routes (admin / manager / field worker)
- Realtime issue feed (Supabase Realtime on `issues` and `activity_log`)
- Preventive maintenance: automatically create work orders from each asset's service interval
- PDF inspection reports
- Flutter field app (offline-first)
