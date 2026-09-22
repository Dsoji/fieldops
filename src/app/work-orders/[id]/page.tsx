import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Circle, MapPinCheck } from "lucide-react";
import { Avatar, Card, PageHeader, PriorityBadge, WorkOrderStatusBadge } from "@/components/ui";
import { getAsset, getIssue, getSite, getWorker, getWorkOrders } from "@/lib/data";
import { formatDate, formatDue, formatTime, titleCase } from "@/lib/format";

export default async function WorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wo = getWorkOrders().find((w) => w.id === id);
  if (!wo) notFound();

  const site = getSite(wo.siteId);
  const asset = wo.assetId ? getAsset(wo.assetId) : undefined;
  const worker = getWorker(wo.assignedTo);
  const issue = wo.sourceIssueId ? getIssue(wo.sourceIssueId) : undefined;

  const steps = [
    { label: "Created", at: wo.createdAt, done: true },
    { label: `Assigned${worker ? ` to ${worker.fullName}` : ""}`, at: undefined, done: Boolean(worker) },
    { label: "Checked in on site", at: wo.checkedInAt, done: Boolean(wo.checkedInAt), verified: wo.checkInVerified },
    { label: "Completed", at: wo.completedAt, done: wo.status === "completed" },
  ];

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/work-orders" className="hover:text-text">
            Work orders / <span className="font-mono">{wo.reference}</span>
          </Link>
        }
        title={wo.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <PriorityBadge value={wo.priority} />
            <WorkOrderStatusBadge value={wo.status} />
            <span>{titleCase(wo.kind)} · due {formatDue(wo.dueAt).toLowerCase()}</span>
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Progress">
          <ol className="relative space-y-5 pl-1">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full ${
                    s.done ? "bg-ok text-white" : "border border-border bg-surface text-faint"
                  }`}
                >
                  {s.done ? <Check className="size-3.5" /> : <Circle className="size-2" />}
                </span>
                <div className="text-sm">
                  <div className={s.done ? "font-medium" : "text-muted"}>{s.label}</div>
                  {s.at && (
                    <div className="text-xs text-muted">
                      {formatDate(s.at)} · {formatTime(s.at)}
                    </div>
                  )}
                  {s.verified && (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-ok">
                      <MapPinCheck className="size-3.5" /> GPS inside {site?.name} boundary
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-6">
          <Card title="Details">
            <dl className="space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-muted">Site</dt>
                <dd><Link className="hover:underline" href={`/sites/${site?.id}`}>{site?.name}</Link></dd>
              </div>
              {asset && (
                <div>
                  <dt className="text-xs text-muted">Asset</dt>
                  <dd><Link className="hover:underline" href={`/assets/${asset.id}`}><span className="font-mono">{asset.tag}</span> · {asset.name}</Link></dd>
                </div>
              )}
              {issue && (
                <div>
                  <dt className="text-xs text-muted">Raised from</dt>
                  <dd><Link className="hover:underline" href={`/issues/${issue.id}`}><span className="font-mono">{issue.reference}</span> · {issue.title}</Link></dd>
                </div>
              )}
            </dl>
          </Card>
          <Card title="Assignee">
            {worker ? (
              <div className="flex items-center gap-3">
                <Avatar name={worker.fullName} size="md" />
                <div className="text-sm">
                  <div className="font-medium">{worker.fullName}</div>
                  <div className="text-xs text-muted">{worker.phone}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Not assigned yet.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
