-- Demo tenant: SunGrid Energy (fictional solar & mini-grid operator).
-- Mirrors src/lib/demo-data.ts. Users/profiles are created via Supabase Auth,
-- then linked with: update profiles set organization_id = '00000000-0000-0000-0000-000000000001' where ...

insert into organizations (id, name, industry) values
  ('00000000-0000-0000-0000-000000000001', 'SunGrid Energy', 'solar');

insert into sites (organization_id, code, name, city, address, latitude, longitude) values
  ('00000000-0000-0000-0000-000000000001', 'LAG-01', 'Lekki Commercial Hub',  'Lagos',         'Admiralty Way, Lekki Phase 1',        6.4474, 3.4723),
  ('00000000-0000-0000-0000-000000000001', 'LAG-02', 'Ikeja Industrial Park', 'Lagos',         'Oba Akran Ave, Ikeja',                6.6018, 3.3515),
  ('00000000-0000-0000-0000-000000000001', 'OYO-01', 'Ibadan Cold Storage',   'Ibadan',        'Ring Road, Ibadan',                   7.3775, 3.9470),
  ('00000000-0000-0000-0000-000000000001', 'DEL-01', 'Warri Mini-Grid',       'Warri',         'Effurun–Sapele Rd, Warri',            5.5544, 5.7932),
  ('00000000-0000-0000-0000-000000000001', 'RIV-01', 'Trans-Amadi Plant',     'Port Harcourt', 'Trans-Amadi Industrial Layout',       4.8156, 7.0498),
  ('00000000-0000-0000-0000-000000000001', 'FCT-01', 'Abuja Office Campus',   'Abuja',         'Plot 1021, Central Business District', 9.0579, 7.4951);

insert into asset_types (organization_id, name, maintenance_interval_days) values
  ('00000000-0000-0000-0000-000000000001', 'Inverter',         90),
  ('00000000-0000-0000-0000-000000000001', 'Battery bank',     60),
  ('00000000-0000-0000-0000-000000000001', 'PV array',         30),
  ('00000000-0000-0000-0000-000000000001', 'Backup generator', 45),
  ('00000000-0000-0000-0000-000000000001', 'Smart meter',     180);

insert into inspection_templates (organization_id, asset_type_id, name, items)
select organization_id, id, 'Inverter routine inspection', '[
  {"key":"cabinet_temp","label":"Cabinet temperature","type":"number","unit":"°C","required":true},
  {"key":"fans","label":"Cooling fans spinning freely","type":"check","required":true},
  {"key":"filters","label":"Air filters clean","type":"check","required":true},
  {"key":"dc_voltage","label":"DC input voltage","type":"number","unit":"V","required":true},
  {"key":"fault_log","label":"No active fault codes","type":"check","required":true},
  {"key":"connections","label":"AC/DC terminals tight, no discolouration","type":"check","required":true},
  {"key":"photo","label":"Photo of display panel","type":"photo","required":true}
]'::jsonb
from asset_types where name = 'Inverter';
