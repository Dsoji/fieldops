// Data access layer. Every page reads through getStore(), so swapping the demo
// dataset for Supabase queries later touches only this file.
//
// In demo mode the dataset is built per request from the presenter's settings
// (industry, prospect branding), stored in a cookie.

import { cookies } from "next/headers";
import { cache } from "react";
import { DEMO_COOKIE, parseConfigCookie } from "./demo/config";
import { profiles } from "./demo/profiles";
import { buildDataset, type Dataset } from "./demo/skeleton";
import { createFormat } from "./format";
import type { Issue, Site, WorkOrder } from "./types";

// ── Pure helpers ────────────────────────────────────────────
export const isOpenWorkOrder = (w: WorkOrder) => w.status !== "completed" && w.status !== "cancelled";
export const isOpenIssue = (i: Issue) => i.status !== "resolved";
export function isOverdue(w: WorkOrder) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isOpenWorkOrder(w) && new Date(w.dueAt) < today;
}

const severityRank = { critical: 0, high: 1, medium: 2, low: 3 } as const;

export const getDemoConfig = cache(async () => parseConfigCookie((await cookies()).get(DEMO_COOKIE)?.value));

/** Request-scoped store: dataset + query helpers + formatters for the active profile. */
export const getStore = cache(async () => {
  const config = await getDemoConfig();
  const now = new Date();
  return createStore(buildDataset(profiles[config.industry], config, now), now, config);
});

function createStore(d: Dataset, now: Date, config: Awaited<ReturnType<typeof getDemoConfig>>) {
  const getWorkOrders = () => [...d.workOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const getIssues = () =>
    [...d.issues].sort(
      (a, b) =>
        Number(a.status === "resolved") - Number(b.status === "resolved") ||
        severityRank[a.severity] - severityRank[b.severity] ||
        b.reportedAt.localeCompare(a.reportedAt),
    );
  const getAssetsForSite = (siteId: string) => d.assets.filter((a) => a.siteId === siteId);
  const getIssuesForSite = (siteId: string) => getIssues().filter((i) => i.siteId === siteId);
  const getWorkOrdersForSite = (siteId: string) => getWorkOrders().filter((w) => w.siteId === siteId);

  return {
    now,
    config,
    profile: d.profile,
    terms: d.terms,
    brand: d.brand,
    currentUser: d.currentUser,
    fmt: createFormat(d.profile.timezone),

    getSites: () => d.sites,
    getSite: (id: string) => d.sites.find((s) => s.id === id),

    getAssetTypes: () => d.assetTypes,
    getAssetType: (id: string) => d.assetTypes.find((t) => t.id === id),

    getAssets: () => d.assets,
    getAsset: (id?: string) => (id ? d.assets.find((a) => a.id === id) : undefined),
    getAssetsForSite,

    getWorkers: () => d.workers,
    getWorker: (id?: string) => (id ? d.workers.find((w) => w.id === id) : undefined),
    getFieldWorkers: () => d.workers.filter((w) => w.role === "field_worker"),

    getWorkOrders,
    getWorkOrder: (id: string) => d.workOrders.find((w) => w.id === id),
    getWorkOrdersForSite,
    getWorkOrdersForAsset: (assetId: string) => getWorkOrders().filter((w) => w.assetId === assetId),

    getIssues,
    getIssue: (id?: string) => (id ? d.issues.find((i) => i.id === id) : undefined),
    getIssuesForSite,

    getMaintenanceForAsset: (assetId: string) =>
      d.maintenance.filter((m) => m.assetId === assetId).sort((a, b) => b.performedAt.localeCompare(a.performedAt)),

    getActivity: () => d.activity,
    getMetrics: () => d.metrics,

    siteSummary(site: Site) {
      const siteAssets = getAssetsForSite(site.id);
      const siteIssues = getIssuesForSite(site.id).filter(isOpenIssue);
      return {
        assets: siteAssets.length,
        assetsDown: siteAssets.filter((a) => a.status === "down").length,
        openIssues: siteIssues.length,
        criticalIssues: siteIssues.filter((i) => i.severity === "critical").length,
        openWorkOrders: getWorkOrdersForSite(site.id).filter(isOpenWorkOrder).length,
        workers: d.workers.filter((w) => w.baseSiteId === site.id && w.role === "field_worker").length,
      };
    },
  };
}

export type Store = Awaited<ReturnType<typeof getStore>>;
