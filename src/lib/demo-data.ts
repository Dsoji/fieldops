// Demo dataset for "SunGrid Energy", a fictional Nigerian solar & mini-grid operator.
// Mirrors supabase/seed.sql so the dashboard runs before the backend is wired up.
// All timestamps are relative to DEMO_NOW so the demo always looks "live".

import type {
  Activity,
  Asset,
  AssetType,
  Issue,
  MaintenanceRecord,
  Organization,
  Site,
  WorkOrder,
  Worker,
} from "./types";

export const DEMO_NOW = new Date("2026-09-22T10:15:00+01:00");

const minsAgo = (m: number) => new Date(DEMO_NOW.getTime() - m * 60_000).toISOString();
const daysAgo = (d: number) => minsAgo(d * 24 * 60);
const inDays = (d: number) => new Date(DEMO_NOW.getTime() + d * 86_400_000).toISOString();

export const organization: Organization = {
  id: "org_sungrid",
  name: "SunGrid Energy",
  industry: "solar",
};

export const currentUser = {
  id: "w_adaeze",
  fullName: "Adaeze Okafor",
  role: "manager" as const,
  title: "Operations Manager",
};

export const sites: Site[] = [
  { id: "s_lek", code: "LAG-01", name: "Lekki Commercial Hub", city: "Lagos", address: "Admiralty Way, Lekki Phase 1", latitude: 6.4474, longitude: 3.4723, capacityKw: 480 },
  { id: "s_ikj", code: "LAG-02", name: "Ikeja Industrial Park", city: "Lagos", address: "Oba Akran Ave, Ikeja", latitude: 6.6018, longitude: 3.3515, capacityKw: 750 },
  { id: "s_ibd", code: "OYO-01", name: "Ibadan Cold Storage", city: "Ibadan", address: "Ring Road, Ibadan", latitude: 7.3775, longitude: 3.947, capacityKw: 320 },
  { id: "s_wrr", code: "DEL-01", name: "Warri Mini-Grid", city: "Warri", address: "Effurun–Sapele Rd, Warri", latitude: 5.5544, longitude: 5.7932, capacityKw: 1200 },
  { id: "s_phc", code: "RIV-01", name: "Trans-Amadi Plant", city: "Port Harcourt", address: "Trans-Amadi Industrial Layout", latitude: 4.8156, longitude: 7.0498, capacityKw: 900 },
  { id: "s_abj", code: "FCT-01", name: "Abuja Office Campus", city: "Abuja", address: "Plot 1021, Central Business District", latitude: 9.0579, longitude: 7.4951, capacityKw: 400 },
];

export const assetTypes: AssetType[] = [
  { id: "t_inv", name: "Inverter", maintenanceIntervalDays: 90 },
  { id: "t_bat", name: "Battery bank", maintenanceIntervalDays: 60 },
  { id: "t_pnl", name: "PV array", maintenanceIntervalDays: 30 },
  { id: "t_gen", name: "Backup generator", maintenanceIntervalDays: 45 },
  { id: "t_mtr", name: "Smart meter", maintenanceIntervalDays: 180 },
];

export const workers: Worker[] = [
  { id: "w_adaeze", fullName: "Adaeze Okafor", role: "manager", phone: "+234 803 000 1101", baseSiteId: "s_lek", onShift: true },
  { id: "w_tunde", fullName: "Tunde Bakare", role: "field_worker", phone: "+234 803 000 1102", baseSiteId: "s_ikj", onShift: true },
  { id: "w_emeka", fullName: "Emeka Nwosu", role: "field_worker", phone: "+234 803 000 1103", baseSiteId: "s_wrr", onShift: true },
  { id: "w_fatima", fullName: "Fatima Bello", role: "field_worker", phone: "+234 803 000 1104", baseSiteId: "s_abj", onShift: true },
  { id: "w_kelechi", fullName: "Kelechi Eze", role: "field_worker", phone: "+234 803 000 1105", baseSiteId: "s_phc", onShift: false },
  { id: "w_seyi", fullName: "Seyi Adeyemi", role: "field_worker", phone: "+234 803 000 1106", baseSiteId: "s_ibd", onShift: true },
  { id: "w_ngozi", fullName: "Ngozi Umeh", role: "field_worker", phone: "+234 803 000 1107", baseSiteId: "s_lek", onShift: true },
  { id: "w_ibrahim", fullName: "Ibrahim Musa", role: "admin", phone: "+234 803 000 1108", baseSiteId: "s_abj", onShift: true },
];

export const assets: Asset[] = [
  { id: "a1", tag: "INV-104", name: "Central inverter 104", typeId: "t_inv", siteId: "s_wrr", manufacturer: "Huawei", model: "SUN2000-100KTL", status: "down", lastInspectedAt: minsAgo(24), nextMaintenanceOn: inDays(0) },
  { id: "a2", tag: "INV-105", name: "Central inverter 105", typeId: "t_inv", siteId: "s_wrr", manufacturer: "Huawei", model: "SUN2000-100KTL", status: "operational", lastInspectedAt: daysAgo(12), nextMaintenanceOn: inDays(78) },
  { id: "a3", tag: "BAT-210", name: "Battery bank A", typeId: "t_bat", siteId: "s_wrr", manufacturer: "BYD", model: "Battery-Box HVM", status: "needs_attention", lastInspectedAt: daysAgo(3), nextMaintenanceOn: inDays(4) },
  { id: "a4", tag: "PV-331", name: "Rooftop array North", typeId: "t_pnl", siteId: "s_lek", manufacturer: "Jinko", model: "Tiger Neo 580W", status: "operational", lastInspectedAt: daysAgo(6), nextMaintenanceOn: inDays(24) },
  { id: "a5", tag: "INV-044", name: "String inverter 044", typeId: "t_inv", siteId: "s_lek", manufacturer: "SMA", model: "Sunny Tripower 25", status: "operational", lastInspectedAt: daysAgo(18), nextMaintenanceOn: inDays(72) },
  { id: "a6", tag: "GEN-012", name: "Backup generator", typeId: "t_gen", siteId: "s_ikj", manufacturer: "Perkins", model: "500 kVA", status: "needs_attention", lastInspectedAt: daysAgo(1), nextMaintenanceOn: inDays(-2) },
  { id: "a7", tag: "BAT-118", name: "Battery bank B", typeId: "t_bat", siteId: "s_ikj", manufacturer: "Pylontech", model: "Force H2", status: "operational", lastInspectedAt: daysAgo(9), nextMaintenanceOn: inDays(51) },
  { id: "a8", tag: "PV-402", name: "Ground-mount array", typeId: "t_pnl", siteId: "s_ibd", manufacturer: "Longi", model: "Hi-MO 6", status: "operational", lastInspectedAt: daysAgo(4), nextMaintenanceOn: inDays(26) },
  { id: "a9", tag: "INV-077", name: "Hybrid inverter 077", typeId: "t_inv", siteId: "s_ibd", manufacturer: "Victron", model: "Quattro 15kVA", status: "operational", lastInspectedAt: daysAgo(20), nextMaintenanceOn: inDays(70) },
  { id: "a10", tag: "INV-150", name: "Central inverter 150", typeId: "t_inv", siteId: "s_phc", manufacturer: "Sungrow", model: "SG110CX", status: "needs_attention", lastInspectedAt: daysAgo(2), nextMaintenanceOn: inDays(1) },
  { id: "a11", tag: "MTR-520", name: "Export meter", typeId: "t_mtr", siteId: "s_phc", manufacturer: "Hexing", model: "HXE310", status: "operational", lastInspectedAt: daysAgo(40), nextMaintenanceOn: inDays(140) },
  { id: "a12", tag: "PV-515", name: "Carport array", typeId: "t_pnl", siteId: "s_abj", manufacturer: "Jinko", model: "Tiger Neo 580W", status: "operational", lastInspectedAt: daysAgo(8), nextMaintenanceOn: inDays(22) },
  { id: "a13", tag: "BAT-305", name: "Battery bank C", typeId: "t_bat", siteId: "s_abj", manufacturer: "BYD", model: "Battery-Box HVS", status: "operational", lastInspectedAt: daysAgo(11), nextMaintenanceOn: inDays(49) },
  { id: "a14", tag: "GEN-031", name: "Standby generator", typeId: "t_gen", siteId: "s_phc", manufacturer: "Cummins", model: "C250 D5", status: "operational", lastInspectedAt: daysAgo(15), nextMaintenanceOn: inDays(30) },
];

export const issues: Issue[] = [
  {
    id: "i1", reference: "ISS-311", title: "Inverter overheating — tripped offline",
    description: "INV-104 cabinet reading 78°C. Intake fan not spinning, dust build-up on filter. Unit tripped at 09:47 and is not restarting.",
    severity: "critical", status: "open", siteId: "s_wrr", assetId: "a1", reportedBy: "w_emeka", reportedAt: minsAgo(22), photoCount: 3,
  },
  {
    id: "i2", reference: "ISS-309", title: "Generator coolant leak",
    description: "Small coolant leak under radiator hose clamp. Topped up; needs clamp replacement.",
    severity: "high", status: "acknowledged", siteId: "s_ikj", assetId: "a6", reportedBy: "w_tunde", reportedAt: minsAgo(260), photoCount: 2,
  },
  {
    id: "i3", reference: "ISS-306", title: "Battery cell imbalance",
    description: "Cell 14 is 0.18V below pack average. Monitor over next charge cycle.",
    severity: "medium", status: "in_progress", siteId: "s_wrr", assetId: "a3", reportedBy: "w_emeka", reportedAt: daysAgo(2), photoCount: 1,
  },
  {
    id: "i4", reference: "ISS-302", title: "Inverter fault code F-032 intermittent",
    description: "Grid overvoltage fault logged 6 times this week.",
    severity: "high", status: "open", siteId: "s_phc", assetId: "a10", reportedBy: "w_kelechi", reportedAt: daysAgo(1), photoCount: 2,
  },
  {
    id: "i5", reference: "ISS-298", title: "Panel soiling on east rows",
    description: "Heavy dust on rows E1–E6. Output down ~9% vs. west rows.",
    severity: "low", status: "resolved", siteId: "s_ibd", assetId: "a8", reportedBy: "w_seyi", reportedAt: daysAgo(4), photoCount: 4, resolvedAt: daysAgo(3),
  },
];

export const workOrders: WorkOrder[] = [
  { id: "wo1", reference: "WO-1042", title: "Routine inspection — INV-104", kind: "inspection", status: "completed", priority: "high", siteId: "s_wrr", assetId: "a1", assignedTo: "w_emeka", dueAt: inDays(0), checkedInAt: minsAgo(48), checkInVerified: true, completedAt: minsAgo(20), createdAt: daysAgo(1) },
  { id: "wo2", reference: "WO-1047", title: "Replace generator hose clamp", kind: "repair", status: "assigned", priority: "high", siteId: "s_ikj", assetId: "a6", assignedTo: "w_tunde", sourceIssueId: "i2", dueAt: inDays(0), createdAt: minsAgo(240) },
  { id: "wo3", reference: "WO-1045", title: "Monthly PV array cleaning", kind: "maintenance", status: "in_progress", priority: "medium", siteId: "s_lek", assetId: "a4", assignedTo: "w_ngozi", dueAt: inDays(0), checkedInAt: minsAgo(35), checkInVerified: true, createdAt: daysAgo(3) },
  { id: "wo4", reference: "WO-1044", title: "Battery health check — BAT-210", kind: "inspection", status: "in_progress", priority: "medium", siteId: "s_wrr", assetId: "a3", assignedTo: "w_emeka", sourceIssueId: "i3", dueAt: inDays(1), checkedInAt: minsAgo(10), checkInVerified: true, createdAt: daysAgo(2) },
  { id: "wo5", reference: "WO-1046", title: "Investigate F-032 fault on INV-150", kind: "repair", status: "open", priority: "high", siteId: "s_phc", assetId: "a10", sourceIssueId: "i4", dueAt: inDays(1), createdAt: daysAgo(1) },
  { id: "wo6", reference: "WO-1043", title: "Quarterly inspection — Abuja campus", kind: "inspection", status: "assigned", priority: "low", siteId: "s_abj", assignedTo: "w_fatima", dueAt: inDays(2), createdAt: daysAgo(2) },
  { id: "wo7", reference: "WO-1040", title: "Clean east PV rows", kind: "maintenance", status: "completed", priority: "low", siteId: "s_ibd", assetId: "a8", assignedTo: "w_seyi", sourceIssueId: "i5", dueAt: daysAgo(3), checkedInAt: daysAgo(3), checkInVerified: true, completedAt: daysAgo(3), createdAt: daysAgo(4) },
  { id: "wo8", reference: "WO-1039", title: "Generator service — GEN-012", kind: "maintenance", status: "open", priority: "medium", siteId: "s_ikj", assetId: "a6", dueAt: daysAgo(2), createdAt: daysAgo(6) },
  { id: "wo9", reference: "WO-1048", title: "Meter calibration check", kind: "inspection", status: "open", priority: "low", siteId: "s_phc", assetId: "a11", dueAt: inDays(5), createdAt: minsAgo(90) },
];

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: "m1", assetId: "a1", kind: "inspection", summary: "Routine inspection — overheating found, ISS-311 raised", performedBy: "w_emeka", performedAt: minsAgo(20) },
  { id: "m2", assetId: "a1", kind: "maintenance", summary: "Firmware update to V300R001C00SPC137", performedBy: "w_emeka", performedAt: daysAgo(34) },
  { id: "m3", assetId: "a1", kind: "inspection", summary: "Quarterly inspection — all checks passed", performedBy: "w_kelechi", performedAt: daysAgo(92) },
  { id: "m4", assetId: "a1", kind: "installation", summary: "Commissioned and connected to mini-grid bus", performedBy: "w_emeka", performedAt: daysAgo(410) },
  { id: "m5", assetId: "a6", kind: "inspection", summary: "Coolant leak found at radiator hose", performedBy: "w_tunde", performedAt: daysAgo(1) },
  { id: "m6", assetId: "a6", kind: "maintenance", summary: "Oil and filter change (250 hrs)", performedBy: "w_tunde", performedAt: daysAgo(47) },
  { id: "m7", assetId: "a8", kind: "maintenance", summary: "East rows cleaned, output restored", performedBy: "w_seyi", performedAt: daysAgo(3) },
  { id: "m8", assetId: "a3", kind: "inspection", summary: "Cell imbalance detected on cell 14", performedBy: "w_emeka", performedAt: daysAgo(2) },
];

export const activity: Activity[] = [
  { id: "ev1", action: "issue.reported", actorId: "w_emeka", summary: "reported a critical issue on INV-104", siteId: "s_wrr", createdAt: minsAgo(22) },
  { id: "ev2", action: "inspection.completed", actorId: "w_emeka", summary: "completed inspection WO-1042 with 3 photos", siteId: "s_wrr", createdAt: minsAgo(20) },
  { id: "ev3", action: "work_order.checked_in", actorId: "w_emeka", summary: "checked in at Warri Mini-Grid · location verified", siteId: "s_wrr", createdAt: minsAgo(10) },
  { id: "ev4", action: "work_order.checked_in", actorId: "w_ngozi", summary: "checked in at Lekki Commercial Hub · location verified", siteId: "s_lek", createdAt: minsAgo(35) },
  { id: "ev5", action: "work_order.created", actorId: "w_adaeze", summary: "created WO-1048 · Meter calibration check", siteId: "s_phc", createdAt: minsAgo(90) },
  { id: "ev6", action: "work_order.assigned", actorId: "w_adaeze", summary: "assigned WO-1047 to Tunde Bakare", siteId: "s_ikj", createdAt: minsAgo(240) },
  { id: "ev7", action: "issue.reported", actorId: "w_tunde", summary: "reported a high-severity issue on GEN-012", siteId: "s_ikj", createdAt: minsAgo(260) },
].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Activity[];

// Month-to-date operational metrics for the Reports page.
export const monthlyMetrics = {
  month: "September 2026",
  workOrdersCreated: 142,
  workOrdersCompleted: 126,
  overdue: 4,
  inspectionsScheduled: 88,
  inspectionsDone: 81,
  issuesReported: 31,
  issuesResolved: 27,
  avgResolutionHours: 6.4,
  firstTimeFixRate: 0.83,
  verifiedCheckInRate: 0.97,
  weekly: [
    { week: "Sep 1", completed: 29, created: 33 },
    { week: "Sep 8", completed: 34, created: 36 },
    { week: "Sep 15", completed: 38, created: 41 },
    { week: "Sep 22", completed: 25, created: 32 },
  ],
};
