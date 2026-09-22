import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AssetStatusBadge,
  Card,
  Empty,
  IssueStatusBadge,
  PageHeader,
  PriorityBadge,
  Stat,
  Table,
  Td,
  TextLink,
  WorkOrderStatusBadge,
} from "@/components/ui";
import { getStore, isOpenWorkOrder } from "@/lib/data";
import { formatDue, timeAgo } from "@/lib/format";

export default async function SitePage({ params }: { params: Promise<{ id: string }> }) {
  const store = await getStore();
  const { getAssetsForSite, getAssetType, getIssuesForSite, getSite, getWorkOrdersForSite, siteSummary, terms } = store;
  const { formatDate } = store.fmt;
  const { id } = await params;
  const site = getSite(id);
  if (!site) notFound();

  const s = siteSummary(site);
  const assets = getAssetsForSite(site.id);
  const issues = getIssuesForSite(site.id);
  const wos = getWorkOrdersForSite(site.id).filter(isOpenWorkOrder);

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/sites" className="hover:text-text">{terms.sites} / <span className="font-mono">{site.code}</span></Link>}
        title={site.name}
        description={`${site.address}, ${site.city}${site.size && store.profile.siteSize ? ` · ${site.size.toLocaleString()} ${store.profile.siteSize.unit}` : ""} · ${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}`}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Assets" value={s.assets} hint={`${s.assetsDown} down`} />
        <Stat label="Open issues" value={s.openIssues} tone={s.criticalIssues ? "critical" : "default"} />
        <Stat label="Open work orders" value={s.openWorkOrders} />
        <Stat label={`${terms.technicians} based here`} value={s.workers} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Assets" padded={false}>
          <Table head={["Asset", "Type", "Status", "Next service"]}>
            {assets.map((a) => (
              <tr key={a.id} className="hover:bg-surface-2">
                <Td>
                  <div className="font-mono text-[11px] text-faint">{a.tag}</div>
                  <TextLink href={`/assets/${a.id}`}>{a.name}</TextLink>
                </Td>
                <Td className="text-muted">{getAssetType(a.typeId)?.name}</Td>
                <Td><AssetStatusBadge value={a.status} /></Td>
                <Td className="whitespace-nowrap text-muted">{formatDate(a.nextMaintenanceOn)}</Td>
              </tr>
            ))}
          </Table>
          {!assets.length && <Empty>No assets registered here.</Empty>}
        </Card>

        <div className="space-y-6">
          <Card title="Issues" padded={false}>
            {issues.length ? (
              <ul className="divide-y divide-border">
                {issues.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <TextLink href={`/issues/${i.id}`}>{i.title}</TextLink>
                      <div className="text-[11px] text-faint">{i.reference} · {timeAgo(i.reportedAt)}</div>
                    </div>
                    <div className="flex shrink-0 gap-1.5"><PriorityBadge value={i.severity} /><IssueStatusBadge value={i.status} /></div>
                  </li>
                ))}
              </ul>
            ) : <Empty>No issues reported.</Empty>}
          </Card>
          <Card title="Open work orders" padded={false}>
            {wos.length ? (
              <ul className="divide-y divide-border">
                {wos.map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <TextLink href={`/work-orders/${w.id}`}>{w.title}</TextLink>
                      <div className="text-[11px] text-faint">{w.reference} · due {formatDue(w.dueAt).toLowerCase()}</div>
                    </div>
                    <WorkOrderStatusBadge value={w.status} />
                  </li>
                ))}
              </ul>
            ) : <Empty>Nothing open.</Empty>}
          </Card>
        </div>
      </div>
    </>
  );
}
