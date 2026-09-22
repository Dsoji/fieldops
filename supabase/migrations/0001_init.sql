-- FieldOps — initial schema
-- Multi-tenant from day one: every business table carries organization_id,
-- and row-level security limits each user to their own organization.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────
create type user_role          as enum ('admin', 'manager', 'field_worker');
create type asset_status       as enum ('operational', 'needs_attention', 'down', 'retired');
create type work_order_status  as enum ('open', 'assigned', 'in_progress', 'completed', 'cancelled');
create type work_order_kind    as enum ('inspection', 'maintenance', 'installation', 'repair');
create type priority_level     as enum ('low', 'medium', 'high', 'critical');
create type issue_status       as enum ('open', 'acknowledged', 'in_progress', 'resolved');

-- ─────────────────────────────────────────────────────────────
-- Tenancy & people
-- ─────────────────────────────────────────────────────────────
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  industry    text,                         -- 'solar', 'oil_gas', 'construction', ...
  created_at  timestamptz not null default now()
);

create table profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  organization_id  uuid not null references organizations(id) on delete cascade,
  full_name        text not null,
  phone            text,
  role             user_role not null default 'field_worker',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Sites & assets (configurable per industry via asset_types)
-- ─────────────────────────────────────────────────────────────
create table sites (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  name             text not null,
  code             text,
  address          text,
  city             text,
  latitude         double precision,
  longitude        double precision,
  geofence_radius_m integer not null default 150,   -- used to verify GPS check-ins
  created_at       timestamptz not null default now()
);

create table asset_types (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  name             text not null,                   -- 'Inverter', 'Battery bank', 'Generator'
  maintenance_interval_days integer,                -- drives preventive maintenance
  unique (organization_id, name)
);

create table assets (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  site_id          uuid not null references sites(id) on delete restrict,
  asset_type_id    uuid not null references asset_types(id) on delete restrict,
  tag              text not null,                   -- 'INV-104', printed on the QR label
  name             text not null,
  manufacturer     text,
  model            text,
  serial_number    text,
  status           asset_status not null default 'operational',
  installed_on     date,
  last_inspected_at timestamptz,
  next_maintenance_on date,
  created_at       timestamptz not null default now(),
  unique (organization_id, tag)
);

-- ─────────────────────────────────────────────────────────────
-- Inspection templates (checklists stored as data, not code)
-- ─────────────────────────────────────────────────────────────
create table inspection_templates (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  asset_type_id    uuid references asset_types(id) on delete set null,
  name             text not null,
  -- [{ "key": "dc_voltage", "label": "DC input voltage", "type": "number", "unit": "V", "required": true }, ...]
  items            jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Work orders
-- ─────────────────────────────────────────────────────────────
create table work_orders (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  reference        text not null,                   -- 'WO-1042'
  title            text not null,
  description      text,
  kind             work_order_kind not null default 'inspection',
  status           work_order_status not null default 'open',
  priority         priority_level not null default 'medium',
  site_id          uuid not null references sites(id) on delete restrict,
  asset_id         uuid references assets(id) on delete set null,
  template_id      uuid references inspection_templates(id) on delete set null,
  assigned_to      uuid references profiles(id) on delete set null,
  created_by       uuid references profiles(id) on delete set null,
  source_issue_id  uuid,                            -- set when created from an issue (FK added below)
  due_at           timestamptz,
  checked_in_at    timestamptz,
  check_in_lat     double precision,
  check_in_lng     double precision,
  check_in_verified boolean,                        -- inside site geofence?
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  unique (organization_id, reference)
);

create table inspections (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  work_order_id    uuid not null references work_orders(id) on delete cascade,
  asset_id         uuid references assets(id) on delete set null,
  performed_by     uuid references profiles(id) on delete set null,
  notes            text,
  signature_url    text,
  completed_at     timestamptz,
  created_at       timestamptz not null default now()
);

create table inspection_items (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  inspection_id    uuid not null references inspections(id) on delete cascade,
  item_key         text not null,
  label            text not null,
  passed           boolean,
  value            text,
  note             text
);

-- ─────────────────────────────────────────────────────────────
-- Issues & maintenance history
-- ─────────────────────────────────────────────────────────────
create table issues (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  reference        text not null,                   -- 'ISS-311'
  title            text not null,
  description      text,
  severity         priority_level not null,
  status           issue_status not null default 'open',
  site_id          uuid not null references sites(id) on delete restrict,
  asset_id         uuid references assets(id) on delete set null,
  work_order_id    uuid references work_orders(id) on delete set null,   -- where it was found
  reported_by      uuid references profiles(id) on delete set null,
  reported_at      timestamptz not null default now(),
  resolved_at      timestamptz,
  unique (organization_id, reference)
);

alter table work_orders
  add constraint work_orders_source_issue_fk
  foreign key (source_issue_id) references issues(id) on delete set null;

create table maintenance_records (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  asset_id         uuid not null references assets(id) on delete cascade,
  work_order_id    uuid references work_orders(id) on delete set null,
  kind             work_order_kind not null,
  summary          text not null,
  performed_by     uuid references profiles(id) on delete set null,
  performed_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Attachments, notifications, audit trail
-- ─────────────────────────────────────────────────────────────
create table attachments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  entity_type      text not null check (entity_type in ('work_order','inspection','issue','asset')),
  entity_id        uuid not null,
  storage_path     text not null,
  captured_at      timestamptz,                     -- from the device, not upload time
  captured_lat     double precision,
  captured_lng     double precision,
  uploaded_by      uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);

create table notifications (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  recipient_id     uuid not null references profiles(id) on delete cascade,
  title            text not null,
  body             text,
  entity_type      text,
  entity_id        uuid,
  read_at          timestamptz,
  created_at       timestamptz not null default now()
);

create table activity_log (
  id               bigint generated always as identity primary key,
  organization_id  uuid not null references organizations(id) on delete cascade,
  actor_id         uuid references profiles(id) on delete set null,
  action           text not null,                   -- 'issue.reported', 'work_order.completed'
  entity_type      text not null,
  entity_id        uuid not null,
  summary          text not null,
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────
create index on profiles (organization_id);
create index on sites (organization_id);
create index on assets (organization_id, site_id);
create index on work_orders (organization_id, status);
create index on work_orders (assigned_to, status);
create index on issues (organization_id, status, severity);
create index on attachments (entity_type, entity_id);
create index on notifications (recipient_id, read_at);
create index on activity_log (organization_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Row-level security
-- ─────────────────────────────────────────────────────────────
create or replace function current_org_id() returns uuid
language sql stable security definer set search_path = public as $$
  select organization_id from profiles where id = auth.uid()
$$;

create or replace function current_user_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'sites','asset_types','assets','inspection_templates','work_orders',
    'inspections','inspection_items','issues','maintenance_records',
    'attachments','activity_log'
  ] loop
    execute format('alter table %I enable row level security', t);
    -- Everyone in the org can read.
    execute format(
      'create policy %I on %I for select using (organization_id = current_org_id())',
      t || '_read', t);
    -- Admins and managers can write anything in their org.
    execute format(
      'create policy %I on %I for all using (organization_id = current_org_id() and current_user_role() in (''admin'',''manager'')) with check (organization_id = current_org_id())',
      t || '_manage', t);
  end loop;
end $$;

-- Field workers: update their own work orders, and create issues,
-- inspections and attachments within their organization.
create policy work_orders_worker_update on work_orders for update
  using (organization_id = current_org_id() and assigned_to = auth.uid())
  with check (organization_id = current_org_id() and assigned_to = auth.uid());

create policy issues_worker_insert on issues for insert
  with check (organization_id = current_org_id() and reported_by = auth.uid());

create policy inspections_worker_insert on inspections for insert
  with check (organization_id = current_org_id() and performed_by = auth.uid());

create policy inspection_items_worker_insert on inspection_items for insert
  with check (organization_id = current_org_id());

create policy attachments_worker_insert on attachments for insert
  with check (organization_id = current_org_id() and uploaded_by = auth.uid());

alter table organizations enable row level security;
create policy organizations_read on organizations for select using (id = current_org_id());

alter table profiles enable row level security;
create policy profiles_read on profiles for select using (organization_id = current_org_id());
create policy profiles_admin on profiles for all
  using (organization_id = current_org_id() and current_user_role() = 'admin')
  with check (organization_id = current_org_id());

alter table notifications enable row level security;
create policy notifications_own on notifications for all
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

-- Live dashboard updates.
alter publication supabase_realtime add table issues, work_orders, activity_log;
