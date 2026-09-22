import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, ClipboardPlus, MapPinCheck, TriangleAlert, UserCheck } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  PageHeader,
  PriorityBadge,
  Stat,
  Table,
  Td,
  TextLink,
  WorkOrderStatusBadge,
} from "@/components/ui";
import {
  getActivity,
  getAssets,
  getAsset,
  getFieldWorkers,
  getIssues,
  getSite,
  getSites,
  getWorker,
  getWorkOrders,
  isOpenIssue,
  isOpenWorkOrder,
  isOverdue,
  now,
  organization,
  siteSummary,
} from "@/lib/data";
import { formatDue, formatTime, timeAgo } from "@/lib/format";
import type { Activity } from "@/lib/types";

const activityIcon: Record<Activity["action"], { icon: typeof CheckCircle2; cls: string }> = {
  "issue.reported": { icon: TriangleAlert, cls: "text-critical bg-critical-bg" },
  "inspection.completed": { icon: Camera, cls: "text-ok bg-ok-bg" },
  "work_order.checked_in": { icon: MapPinCheck, cls: "text-info bg-info-bg" },
  "work_order.created": { icon: ClipboardPlus, cls: "text-muted bg-neutral-bg" },
  "work_order.assigned": { icon: UserCheck, cls: "text-muted bg-neutral-bg" },
  "work_order.completed": { icon: CheckCircle2, cls: "text-ok bg-ok-bg" },
  "issue.resolved": { icon: CheckCircle2, cls: "text-ok bg-ok-bg" },
};

export default function OverviewPage() {
  const sites = getSites();
  const workOrders = getWorkOrders();
  const openWOs = workOrders.filter(isOpenWorkOrder);
  const overdue = workOrders.filter(isOverdue);
  const openIssues = getIssues().filter(isOpenIssue);
  const critical = openIssues.filter((i) => i.severity === "critical");
  const workersOnShift = getFieldWorkers().filter((w) => w.onShift);
  const checkedIn = new Set(openWOs.filter((w) => w.checkInVerified && w.status === "in_progress").map((w) => w.assignedTo)).size;
  const assets = getAssets();
  const assetsDown = assets.filter((a) => a.status === "down").length;

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        eyebrow={now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Lagos" })}
        title={`${greeting}, Adaeze`}
        description={`Here's what's happening across ${organization.name} today.`}
      />

      {/* Critical issue banner — the demo's "wow" moment */}
      {critical.map((issue) => {
        const asset = issue.assetId ? getAsset(issue.assetId) : undefined;
        const site = getSite(issue.siteId);
        const reporter = getWorker(issue.reportedBy);
        return (
          <div
            key={issue.id}
            className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-critical/30 bg-critical-bg px-4 py-3.5"
          >
            <span className="pulse-critical grid size-9 shrink-0 place-items-center rounded-full bg-critical text-white">
              <TriangleAlert className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-critical">Critical issue</span>
                <span className="font-mono text-xs text-critical/80">{issue.reference}</span>
                <span className="text-xs text-critical/70">· {timeAgo(issue.reportedAt)}</span>
              </div>
              <div className="mt-0.5 text-sm">
                <span className="font-medium">{asset?.tag}</span> — {issue.title} at {site?.name}. Reported by{" "}
                {reporter?.fullName} at {formatTime(issue.reportedAt)} with {issue.photoCount} photos.
              </div>
            </div>
            <div className="flex gap-2">
              <Button href={`/issues/${issue.id}`}>View details</Button>
              <Button variant="danger" href={`/work-orders/new?issue=${issue.id}`}>
                Create work order
              </Button>
            </div>
          </div>
        );
      })}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open work orders" value={openWOs.length} hint={<span className={overdue.length ? "text-critical" : ""}>{overdue.length} overdue</span>} />
        <Stat
          label="Open issues"
          value={openIssues.length}
          tone={critical.length ? "critical" : "default"}
          hint={`${critical.length} critical · ${openIssues.filter((i) => i.severity === "high").length} high`}
        />
        <Stat label="Technicians on shift" value={`${workersOnShift.length}/${getFieldWorkers().length}`} hint={`${checkedIn} checked in at sites`} />
        <Stat label="Assets monitored" value={assets.length} hint={`${assetsDown} down · across ${sites.length} sites`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          padded={false}
          title="Work orders due soon"
          action={
            <Link href="/work-orders" className="inline-flex items-center gap-1 text-xs text-muted hover:text-text">
              View all <ArrowRight className="size-3" />
            </Link>
          }
        >
          <Table head={["Work order", "Site", "Assignee", "Priority", "Status", "Due"]}>
            {openWOs
              .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
              .slice(0, 6)
              .map((wo) => {
                const worker = getWorker(wo.assignedTo);
                return (
                  <tr key={wo.id} className="hover:bg-surface-2">
                    <Td>
                      <div className="font-mono text-[11px] text-faint">{wo.reference}</div>
                      <TextLink href={`/work-orders/${wo.id}`}>{wo.title}</TextLink>
                    </Td>
                    <Td className="text-muted">{getSite(wo.siteId)?.city}</Td>
                    <Td>
                      {worker ? (
                        <span className="flex items-center gap-2">
                          <Avatar name={worker.fullName} />
                          <span className="whitespace-nowrap">{worker.fullName.split(" ")[0]}</span>
                        </span>
                      ) : (
                        <span className="text-faint">Unassigned</span>
                      )}
                    </Td>
                    <Td><PriorityBadge value={wo.priority} /></Td>
                    <Td><WorkOrderStatusBadge value={wo.status} /></Td>
                    <Td className={isOverdue(wo) ? "font-medium text-critical" : "text-muted"}>{formatDue(wo.dueAt)}</Td>
                  </tr>
                );
              })}
          </Table>
        </Card>

        <Card title="Live activity" action={<Badge tone="ok" dot>Live</Badge>}>
          <ol className="space-y-4">
            {getActivity().map((ev) => {
              const { icon: Icon, cls } = activityIcon[ev.action];
              const actor = getWorker(ev.actorId);
              return (
                <li key={ev.id} className="flex gap-3">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full ${cls}`}>
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 text-[13px] leading-snug">
                    <span className="font-medium">{actor?.fullName}</span> <span className="text-muted">{ev.summary}</span>
                    <div className="mt-0.5 text-[11px] text-faint">
                      {timeAgo(ev.createdAt)} · {getSite(ev.siteId)?.name}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      <Card className="mt-6" padded={false} title="Sites" action={<Link href="/sites" className="inline-flex items-center gap-1 text-xs text-muted hover:text-text">All sites <ArrowRight className="size-3" /></Link>}>
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
          {sites.map((site) => {
            const s = siteSummary(site);
            return (
              <Link key={site.id} href={`/sites/${site.id}`} className="flex items-center justify-between gap-3 border-border px-4 py-3.5 hover:bg-surface-2 sm:border-b">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 shrink-0 rounded-full ${s.criticalIssues ? "bg-critical" : s.openIssues ? "bg-high" : "bg-ok"}`}
                    />
                    <span className="truncate text-[13px] font-medium">{site.name}</span>
                  </div>
                  <div className="mt-0.5 pl-4 text-xs text-muted">
                    {site.city} · {s.assets} assets
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className={s.openIssues ? "font-medium text-high" : "text-faint"}>
                    {s.openIssues} {s.openIssues === 1 ? "issue" : "issues"}
                  </div>
                  <div className="text-faint">{s.openWorkOrders} open WOs</div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </>
  );
}
