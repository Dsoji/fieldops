import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui";
import { getStore } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getStore()).terms.sites };
}

export default async function SitesPage() {
  const store = await getStore();
  const { getSites, siteSummary, terms } = store;
  const sites = getSites();
  return (
    <>
      <PageHeader
        title={terms.sites}
        description={`${sites.length} ${terms.sites.toLowerCase()}${
          store.profile.siteSize
            ? ` · ${sites.reduce((n, s) => n + (s.size ?? 0), 0).toLocaleString()} ${store.profile.siteSize.unit} ${store.profile.siteSize.label}`
            : ` · ${new Set(sites.map((s) => s.city.split(",").pop()!.trim())).size} locations`
        }`}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sites.map((site) => {
          const s = siteSummary(site);
          return (
            <Link key={site.id} href={`/sites/${site.id}`} className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-text/30">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[11px] text-faint">{site.code}</div>
                  <div className="font-medium">{site.name}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted"><MapPin className="size-3" />{site.city}</div>
                </div>
                {s.criticalIssues ? (
                  <Badge tone="critical" dot>Critical</Badge>
                ) : s.openIssues ? (
                  <Badge tone="high" dot>Attention</Badge>
                ) : (
                  <Badge tone="ok" dot>Healthy</Badge>
                )}
              </div>
              <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center">
                {[
                  ["Assets", s.assets],
                  ["Issues", s.openIssues],
                  ["Open WOs", s.openWorkOrders],
                  [terms.technicians, s.workers],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dd className="text-lg font-semibold">{v}</dd>
                    <dt className="text-[11px] text-muted">{k}</dt>
                  </div>
                ))}
              </dl>
            </Link>
          );
        })}
      </div>
    </>
  );
}
