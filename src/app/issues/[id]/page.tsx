import { notFound } from "next/navigation";
import Link from "next/link";
import { Camera, ImageIcon, MapPin } from "lucide-react";
import {
  AssetStatusBadge,
  Avatar,
  Button,
  Card,
  IssueStatusBadge,
  PageHeader,
  PriorityBadge,
  WorkOrderStatusBadge,
} from "@/components/ui";
import { getAsset, getIssue, getSite, getWorker, getWorkOrders } from "@/lib/data";
import { formatDate, formatTime, timeAgo } from "@/lib/format";

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = getIssue(id);
  if (!issue) notFound();

  const asset = issue.assetId ? getAsset(issue.assetId) : undefined;
  const site = getSite(issue.siteId);
  const reporter = getWorker(issue.reportedBy);
  const linkedWOs = getWorkOrders().filter((w) => w.sourceIssueId === issue.id);

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/issues" className="hover:text-text">
            Issues / <span className="font-mono">{issue.reference}</span>
          </Link>
        }
        title={issue.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <PriorityBadge value={issue.severity} />
            <IssueStatusBadge value={issue.status} />
            <span>
              Reported {timeAgo(issue.reportedAt)} by {reporter?.fullName}
            </span>
          </span>
        }
        actions={
          issue.status !== "resolved" && (
            <>
              <Button>Acknowledge</Button>
              <Button variant="danger" href={`/work-orders/new?issue=${issue.id}`}>
                Create work order
              </Button>
            </>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Field report">
            <p className="text-sm leading-relaxed">{issue.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: issue.photoCount }).map((_, i) => (
                <div
                  key={i}
                  className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-md border border-border bg-[repeating-linear-gradient(135deg,var(--surface-2),var(--surface-2)_8px,var(--neutral-bg)_8px,var(--neutral-bg)_16px)]"
                >
                  <ImageIcon className="size-5 text-faint" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1.5 py-1 font-mono text-[9px] leading-tight text-white">
                    {formatTime(issue.reportedAt)} · {site?.latitude.toFixed(4)}, {site?.longitude.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
              <Camera className="size-3.5" /> Photos captured in-app, stamped with time and GPS at capture. Gallery uploads are blocked.
            </p>
          </Card>

          <Card title="Linked work orders" padded={linkedWOs.length > 0}>
            {linkedWOs.length ? (
              <ul className="divide-y divide-border">
                {linkedWOs.map((wo) => (
                  <li key={wo.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <Link href={`/work-orders/${wo.id}`} className="text-sm font-medium hover:underline">
                      <span className="mr-2 font-mono text-xs text-faint">{wo.reference}</span>
                      {wo.title}
                    </Link>
                    <WorkOrderStatusBadge value={wo.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-sm text-muted">
                No work order yet. Create one to dispatch a technician.
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {asset && (
            <Card title="Asset">
              <Link href={`/assets/${asset.id}`} className="block hover:underline">
                <div className="font-mono text-xs text-faint">{asset.tag}</div>
                <div className="text-sm font-medium">{asset.name}</div>
              </Link>
              <div className="mt-2"><AssetStatusBadge value={asset.status} /></div>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><dt className="text-muted">Model</dt><dd>{asset.manufacturer} {asset.model}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Last inspected</dt><dd>{formatDate(asset.lastInspectedAt)}</dd></div>
              </dl>
            </Card>
          )}
          <Card title="Location">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 text-muted" />
              <div>
                <Link href={`/sites/${site?.id}`} className="font-medium hover:underline">{site?.name}</Link>
                <div className="text-xs text-muted">{site?.address}</div>
              </div>
            </div>
          </Card>
          <Card title="Reported by">
            {reporter && (
              <div className="flex items-center gap-3">
                <Avatar name={reporter.fullName} size="md" />
                <div className="text-sm">
                  <div className="font-medium">{reporter.fullName}</div>
                  <div className="text-xs text-muted">{reporter.phone}</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
