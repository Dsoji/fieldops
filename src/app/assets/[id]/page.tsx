import { notFound } from "next/navigation";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { AssetStatusBadge, Button, Card, Empty, PageHeader, WorkOrderStatusBadge } from "@/components/ui";
import { getStore } from "@/lib/data";
import { titleCase } from "@/lib/format";

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const store = await getStore();
  const { getAsset, getAssetType, getMaintenanceForAsset, getSite, getWorker, getWorkOrdersForAsset, terms } = store;
  const { formatDate } = store.fmt;
  const { id } = await params;
  const asset = getAsset(id);
  if (!asset) notFound();

  const type = getAssetType(asset.typeId);
  const site = getSite(asset.siteId);
  const history = getMaintenanceForAsset(asset.id);
  const wos = getWorkOrdersForAsset(asset.id);

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/assets" className="hover:text-text">Assets / <span className="font-mono">{asset.tag}</span></Link>}
        title={asset.name}
        description={<span className="inline-flex items-center gap-2"><AssetStatusBadge value={asset.status} /> {type?.name} at {site?.name}</span>}
        actions={
          <>
            <Button><QrCode className="size-4" /> Print QR label</Button>
            <Button variant="primary" href="/work-orders/new">New work order</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Maintenance history">
            {history.length ? (
              <ol className="relative space-y-5 border-l border-border pl-5">
                {history.map((m) => (
                  <li key={m.id} className="relative">
                    <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-surface bg-text" />
                    <div className="text-xs text-muted">{formatDate(m.performedAt)} · {titleCase(m.kind)}</div>
                    <div className="text-sm font-medium">{m.summary}</div>
                    <div className="text-xs text-faint">{getWorker(m.performedBy)?.fullName}</div>
                  </li>
                ))}
              </ol>
            ) : <Empty>No history yet.</Empty>}
          </Card>
          <Card title="Work orders" padded={false}>
            {wos.length ? (
              <ul className="divide-y divide-border">
                {wos.map((w) => (
                  <li key={w.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <Link href={`/work-orders/${w.id}`} className="hover:underline">
                      <span className="mr-2 font-mono text-xs text-faint">{w.reference}</span>{w.title}
                    </Link>
                    <WorkOrderStatusBadge value={w.status} />
                  </li>
                ))}
              </ul>
            ) : <Empty>No work orders for this asset.</Empty>}
          </Card>
        </div>

        <Card title="Specifications">
          <dl className="space-y-3 text-sm">
            {[
              ["Tag", <span key="t" className="font-mono">{asset.tag}</span>],
              ["Type", type?.name],
              ["Manufacturer", asset.manufacturer],
              ["Model", asset.model],
              [terms.site, <Link key="s" href={`/sites/${site?.id}`} className="hover:underline">{site?.name}</Link>],
              ["Last inspection", formatDate(asset.lastInspectedAt)],
              ["Next maintenance", formatDate(asset.nextMaintenanceOn)],
              ["Service interval", `Every ${type?.maintenanceIntervalDays} days`],
            ].map(([k, v], i) => (
              <div key={i} className="flex justify-between gap-4">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  );
}
