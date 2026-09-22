// Data access layer. Every page reads through here, so swapping the demo
// dataset for Supabase queries later touches only this file.

import * as demo from "./demo-data";
import type { Asset, Issue, Site, WorkOrder } from "./types";

export const organization = demo.organization;
export const currentUser = demo.currentUser;
export const now = demo.DEMO_NOW;

export const getSites = () => demo.sites;
export const getSite = (id: string) => demo.sites.find((s) => s.id === id);

export const getAssetTypes = () => demo.assetTypes;
export const getAssetType = (id: string) => demo.assetTypes.find((t) => t.id === id);

export const getAssets = () => demo.assets;
export const getAsset = (id: string) => demo.assets.find((a) => a.id === id);
export const getAssetsForSite = (siteId: string) => demo.assets.filter((a) => a.siteId === siteId);

export const getWorkers = () => demo.workers;
export const getWorker = (id?: string) => (id ? demo.workers.find((w) => w.id === id) : undefined);
export const getFieldWorkers = () => demo.workers.filter((w) => w.role === "field_worker");

export const getWorkOrders = () =>
  [...demo.workOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const getWorkOrdersForSite = (siteId: string) =>
  getWorkOrders().filter((w) => w.siteId === siteId);
export const getWorkOrdersForAsset = (assetId: string) =>
  getWorkOrders().filter((w) => w.assetId === assetId);

const severityRank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
export const getIssues = () =>
  [...demo.issues].sort(
    (a, b) =>
      Number(a.status === "resolved") - Number(b.status === "resolved") ||
      severityRank[a.severity] - severityRank[b.severity] ||
      b.reportedAt.localeCompare(a.reportedAt),
  );
export const getIssue = (id: string) => demo.issues.find((i) => i.id === id);
export const getIssuesForSite = (siteId: string) => getIssues().filter((i) => i.siteId === siteId);

export const getMaintenanceForAsset = (assetId: string) =>
  demo.maintenanceRecords
    .filter((m) => m.assetId === assetId)
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt));

export const getActivity = () => demo.activity;
export const getMonthlyMetrics = () => demo.monthlyMetrics;

// ── Derived helpers ─────────────────────────────────────────
export const isOpenWorkOrder = (w: WorkOrder) => w.status !== "completed" && w.status !== "cancelled";
export const isOverdue = (w: WorkOrder) => isOpenWorkOrder(w) && new Date(w.dueAt) < startOfDay(now);
export const isOpenIssue = (i: Issue) => i.status !== "resolved";

export function siteSummary(site: Site) {
  const siteAssets = getAssetsForSite(site.id);
  return {
    assets: siteAssets.length,
    assetsDown: siteAssets.filter((a: Asset) => a.status === "down").length,
    openIssues: getIssuesForSite(site.id).filter(isOpenIssue).length,
    criticalIssues: getIssuesForSite(site.id).filter((i) => isOpenIssue(i) && i.severity === "critical").length,
    openWorkOrders: getWorkOrdersForSite(site.id).filter(isOpenWorkOrder).length,
    workers: demo.workers.filter((w) => w.baseSiteId === site.id && w.role === "field_worker").length,
  };
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
