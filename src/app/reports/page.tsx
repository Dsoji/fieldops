import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button, Card, Meter, PageHeader, Stat } from "@/components/ui";
import { getMonthlyMetrics } from "@/lib/data";
import { pct } from "@/lib/format";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const m = getMonthlyMetrics();
  const max = Math.max(...m.weekly.map((w) => w.created));
  const completionRate = m.workOrdersCompleted / m.workOrdersCreated;
  const inspectionRate = m.inspectionsDone / m.inspectionsScheduled;

  return (
    <>
      <PageHeader
        title="Reports"
        description={`${m.month} · month to date`}
        actions={<Button><Download className="size-4" /> Export PDF</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Work orders completed" value={`${m.workOrdersCompleted}/${m.workOrdersCreated}`} hint={`${m.overdue} overdue`} />
        <Stat label="Avg. time to resolve an issue" value={`${m.avgResolutionHours} h`} hint={`${m.issuesResolved} of ${m.issuesReported} resolved`} />
        <Stat label="Fixed on first visit" value={pct(m.firstTimeFixRate)} tone="ok" />
        <Stat label="GPS-verified check-ins" value={pct(m.verifiedCheckInRate)} tone="ok" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Work orders per week" action={
          <div className="flex items-center gap-3 text-[11px] text-muted">
            <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-neutral-bg ring-1 ring-border" />Created</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-text" />Completed</span>
          </div>
        }>
          <div className="flex h-56 items-end gap-6 px-2">
            {m.weekly.map((w) => (
              <div key={w.week} className="flex h-full flex-1 flex-col justify-end">
                <div className="relative flex flex-1 items-end justify-center gap-1.5">
                  <div className="w-1/3 rounded-t bg-neutral-bg ring-1 ring-border" style={{ height: `${(w.created / max) * 100}%` }} title={`${w.created} created`} />
                  <div className="w-1/3 rounded-t bg-text" style={{ height: `${(w.completed / max) * 100}%` }} title={`${w.completed} completed`} />
                </div>
                <div className="mt-2 text-center text-[11px] text-muted">{w.week}</div>
                <div className="text-center text-xs font-medium">{w.completed}<span className="text-faint">/{w.created}</span></div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Compliance">
          <div className="space-y-5">
            {[
              { label: "Work orders completed", value: completionRate },
              { label: "Scheduled inspections done", value: inspectionRate },
              { label: "Issues resolved", value: m.issuesResolved / m.issuesReported },
              { label: "Check-ins verified by GPS", value: m.verifiedCheckInRate },
            ].map((r) => (
              <div key={r.label}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="text-muted">{r.label}</span>
                  <span className="font-medium">{pct(r.value)}</span>
                </div>
                <Meter value={r.value} tone={r.value >= 0.9 ? "ok" : "default"} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
