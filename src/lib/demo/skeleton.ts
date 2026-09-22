// The demo storyline. Relationships, statuses and timings are fixed here;
// the industry profile supplies names and wording. Times are relative to "now",
// so the demo always looks live whenever it's presented.

import type {
  Activity,
  Asset,
  AssetStatus,
  AssetType,
  Issue,
  IssueStatus,
  MaintenanceRecord,
  Priority,
  Role,
  Site,
  WorkOrder,
  WorkOrderKind,
  WorkOrderStatus,
  Worker,
} from "../types";
import type { DemoConfig } from "./config";
import type { IndustryProfile, Terms } from "./profile";

export interface Dataset {
  profile: IndustryProfile;
  terms: Terms;
  brand: { orgName: string; accent: string; logo?: string; isCustom: boolean };
  currentUser: { id: string; fullName: string; title: string };
  sites: Site[];
  assetTypes: AssetType[];
  assets: Asset[];
  workers: Worker[];
  issues: Issue[];
  workOrders: WorkOrder[];
  maintenance: MaintenanceRecord[];
  activity: Activity[];
  metrics: ReturnType<typeof buildMetrics>;
}

const SITE_IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

// [id, site index, status, last inspected (minutes ago), next maintenance (days from now)]
const ASSETS: [string, number, AssetStatus, number, number][] = [
  ["a1", 3, "down", 24, 0],
  ["a2", 3, "operational", 12 * 1440, 78],
  ["a3", 3, "needs_attention", 3 * 1440, 4],
  ["a4", 0, "operational", 6 * 1440, 24],
  ["a5", 0, "operational", 18 * 1440, 72],
  ["a6", 1, "needs_attention", 1 * 1440, -2],
  ["a7", 1, "operational", 9 * 1440, 51],
  ["a8", 2, "operational", 4 * 1440, 26],
  ["a9", 2, "operational", 20 * 1440, 70],
  ["a10", 4, "needs_attention", 2 * 1440, 1],
  ["a11", 4, "operational", 40 * 1440, 140],
  ["a12", 5, "operational", 8 * 1440, 22],
  ["a13", 5, "operational", 11 * 1440, 49],
  ["a14", 4, "operational", 15 * 1440, 30],
];

// [id, role, base site index, on shift]
const WORKERS: [string, Role, number, boolean][] = [
  ["w1", "manager", 0, true],
  ["w2", "field_worker", 1, true],
  ["w3", "field_worker", 3, true],
  ["w4", "field_worker", 5, true],
  ["w5", "field_worker", 4, false],
  ["w6", "field_worker", 2, true],
  ["w7", "field_worker", 0, true],
  ["w8", "admin", 5, true],
];

// [id, ref, severity, status, asset, reporter, minutes ago, photos, resolved minutes ago]
const ISSUES: [string, string, Priority, IssueStatus, string, string, number, number, number?][] = [
  ["i1", "ISS-311", "critical", "open", "a1", "w3", 22, 3],
  ["i2", "ISS-309", "high", "acknowledged", "a6", "w2", 260, 2],
  ["i3", "ISS-306", "medium", "in_progress", "a3", "w3", 2 * 1440, 1],
  ["i4", "ISS-302", "high", "open", "a10", "w5", 1 * 1440, 2],
  ["i5", "ISS-298", "low", "resolved", "a8", "w6", 4 * 1440, 4, 3 * 1440],
];

interface WOSeed {
  id: string; ref: string; kind: WorkOrderKind; status: WorkOrderStatus; priority: Priority;
  site: number; asset?: string; assignee?: string; issue?: string;
  dueDays: number; createdMins: number; checkInMins?: number; completedMins?: number;
}
const WORK_ORDERS: WOSeed[] = [
  { id: "wo1", ref: "WO-1042", kind: "inspection", status: "completed", priority: "high", site: 3, asset: "a1", assignee: "w3", dueDays: 0, createdMins: 1440, checkInMins: 48, completedMins: 20 },
  { id: "wo2", ref: "WO-1047", kind: "repair", status: "assigned", priority: "high", site: 1, asset: "a6", assignee: "w2", issue: "i2", dueDays: 0, createdMins: 240 },
  { id: "wo3", ref: "WO-1045", kind: "maintenance", status: "in_progress", priority: "medium", site: 0, asset: "a4", assignee: "w7", dueDays: 0, createdMins: 3 * 1440, checkInMins: 35 },
  { id: "wo4", ref: "WO-1044", kind: "inspection", status: "in_progress", priority: "medium", site: 3, asset: "a3", assignee: "w3", issue: "i3", dueDays: 1, createdMins: 2 * 1440, checkInMins: 10 },
  { id: "wo5", ref: "WO-1046", kind: "repair", status: "open", priority: "high", site: 4, asset: "a10", issue: "i4", dueDays: 1, createdMins: 1440 },
  { id: "wo6", ref: "WO-1043", kind: "inspection", status: "assigned", priority: "low", site: 5, assignee: "w4", dueDays: 2, createdMins: 2 * 1440 },
  { id: "wo7", ref: "WO-1040", kind: "maintenance", status: "completed", priority: "low", site: 2, asset: "a8", assignee: "w6", issue: "i5", dueDays: -3, createdMins: 4 * 1440, checkInMins: 3 * 1440, completedMins: 3 * 1440 },
  { id: "wo8", ref: "WO-1039", kind: "maintenance", status: "open", priority: "medium", site: 1, asset: "a6", dueDays: -2, createdMins: 6 * 1440 },
  { id: "wo9", ref: "WO-1048", kind: "inspection", status: "open", priority: "low", site: 4, asset: "a11", dueDays: 5, createdMins: 90 },
];

// [asset, kind, performer, minutes ago]
const MAINTENANCE: [string, WorkOrderKind, string, number][] = [
  ["a1", "inspection", "w3", 20],
  ["a1", "maintenance", "w3", 34 * 1440],
  ["a1", "inspection", "w5", 92 * 1440],
  ["a1", "installation", "w3", 410 * 1440],
  ["a6", "inspection", "w2", 1 * 1440],
  ["a6", "maintenance", "w2", 47 * 1440],
  ["a8", "maintenance", "w6", 3 * 1440],
  ["a3", "inspection", "w3", 2 * 1440],
];

export function buildDataset(profile: IndustryProfile, cfg: DemoConfig, now = new Date()): Dataset {
  const minsAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
  const inDays = (d: number) => new Date(now.getTime() + d * 86_400_000).toISOString();

  const sites: Site[] = profile.sites.map((s, i) => ({ id: SITE_IDS[i], ...s }));
  const assetTypes: AssetType[] = profile.assetTypes.map((t, i) => ({ id: `t${i}`, name: t.name, maintenanceIntervalDays: t.interval }));

  const assets: Asset[] = ASSETS.map(([id, site, status, inspected, next], i) => {
    const skin = profile.assets[i];
    return {
      id, tag: skin.tag, name: skin.name, typeId: `t${skin.type}`, siteId: SITE_IDS[site],
      manufacturer: skin.manufacturer, model: skin.model, status,
      lastInspectedAt: minsAgo(inspected), nextMaintenanceOn: inDays(next),
    };
  });

  const workers: Worker[] = WORKERS.map(([id, role, site, onShift], i) => ({
    id, role, onShift, baseSiteId: SITE_IDS[site],
    fullName: i === 0 && cfg.manager ? cfg.manager : profile.people[i].fullName,
    phone: profile.people[i].phone,
  }));

  const siteOfAsset = (assetId: string) => assets.find((a) => a.id === assetId)!.siteId;

  const issues: Issue[] = ISSUES.map(([id, reference, severity, status, asset, reporter, ago, photos, resolved], i) => ({
    id, reference, severity, status, assetId: asset, siteId: siteOfAsset(asset), reportedBy: reporter,
    reportedAt: minsAgo(ago), photoCount: photos, resolvedAt: resolved ? minsAgo(resolved) : undefined,
    ...profile.issues[i],
  }));

  const workOrders: WorkOrder[] = WORK_ORDERS.map((w, i) => ({
    id: w.id, reference: w.ref, title: profile.workOrders[i], kind: w.kind, status: w.status, priority: w.priority,
    siteId: SITE_IDS[w.site], assetId: w.asset, assignedTo: w.assignee, sourceIssueId: w.issue,
    dueAt: inDays(w.dueDays), createdAt: minsAgo(w.createdMins),
    checkedInAt: w.checkInMins !== undefined ? minsAgo(w.checkInMins) : undefined,
    checkInVerified: w.checkInMins !== undefined ? true : undefined,
    completedAt: w.completedMins !== undefined ? minsAgo(w.completedMins) : undefined,
  }));

  const maintenance: MaintenanceRecord[] = MAINTENANCE.map(([asset, kind, by, ago], i) => ({
    id: `m${i + 1}`, assetId: asset, kind, performedBy: by, performedAt: minsAgo(ago), summary: profile.maintenance[i],
  }));

  const tag = (id: string) => assets.find((a) => a.id === id)!.tag;
  const siteName = (i: number) => sites[i].name;
  const activity: Activity[] = (
    [
      ["issue.reported", "w3", `reported a critical issue on ${tag("a1")}`, 3, 22],
      ["inspection.completed", "w3", `completed inspection WO-1042 with 3 photos`, 3, 20],
      ["work_order.checked_in", "w3", `checked in at ${siteName(3)} · location verified`, 3, 10],
      ["work_order.checked_in", "w7", `checked in at ${siteName(0)} · location verified`, 0, 35],
      ["work_order.created", "w1", `created WO-1048 · ${profile.workOrders[8]}`, 4, 90],
      ["work_order.assigned", "w1", `assigned WO-1047 to ${workers[1].fullName}`, 1, 240],
      ["issue.reported", "w2", `reported a high-severity issue on ${tag("a6")}`, 1, 260],
    ] as const
  )
    .map(([action, actorId, summary, site, ago], i) => ({
      id: `ev${i + 1}`, action, actorId, summary, siteId: SITE_IDS[site], createdAt: minsAgo(ago),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    profile,
    terms: profile.terms,
    brand: {
      orgName: cfg.client ?? profile.orgName,
      accent: cfg.color ?? profile.accent,
      logo: cfg.logo,
      isCustom: Boolean(cfg.client || cfg.color || cfg.logo),
    },
    currentUser: { id: "w1", fullName: workers[0].fullName, title: profile.managerTitle },
    sites, assetTypes, assets, workers, issues, workOrders, maintenance, activity,
    metrics: buildMetrics(now),
  };
}

function buildMetrics(now: Date) {
  // Last four Mondays, oldest first.
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weeks = [3, 2, 1, 0].map((n) => {
    const d = new Date(monday);
    d.setDate(d.getDate() - n * 7);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  });
  const weekly = [
    { completed: 29, created: 33 },
    { completed: 34, created: 36 },
    { completed: 38, created: 41 },
    { completed: 25, created: 32 },
  ].map((w, i) => ({ week: weeks[i], ...w }));

  return {
    period: "Last 4 weeks",
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
    weekly,
  };
}
