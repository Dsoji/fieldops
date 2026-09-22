"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Smartphone } from "lucide-react";
import type { Terms } from "@/lib/demo/profile";
import type { Priority, WorkOrderKind } from "@/lib/types";

type Option = { id: string; label: string };

interface Props {
  sites: Option[];
  assets: (Option & { siteId: string })[];
  workers: (Option & { onShift: boolean; baseSiteId: string })[];
  terms: Terms;
  today: string; // YYYY-MM-DD
  initial?: {
    title: string;
    description: string;
    kind: WorkOrderKind;
    priority: Priority;
    siteId: string;
    assetId: string;
    issueRef: string;
  };
}

const priorities: Priority[] = ["critical", "high", "medium", "low"];
const kinds: WorkOrderKind[] = ["inspection", "maintenance", "repair", "installation"];

const field = "h-9 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-text";
const label = "mb-1.5 block text-xs font-medium text-muted";

export function WorkOrderForm({ sites, assets, workers, terms, today, initial }: Props) {
  const [siteId, setSiteId] = useState(initial?.siteId ?? sites[0].id);
  const [assetId, setAssetId] = useState(initial?.assetId ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [assignee, setAssignee] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const siteAssets = useMemo(() => assets.filter((a) => a.siteId === siteId), [assets, siteId]);
  // Technicians based at the chosen site come first.
  const sortedWorkers = useMemo(
    () => [...workers].sort((a, b) => Number(b.baseSiteId === siteId) - Number(a.baseSiteId === siteId)),
    [workers, siteId],
  );

  if (submitted) {
    const worker = workers.find((w) => w.id === assignee);
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-border bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-ok" />
        <h2 className="mt-3 text-lg font-semibold">Work order created</h2>
        <p className="mt-1 text-sm text-muted">
          {worker ? (
            <>
              <span className="inline-flex items-center gap-1"><Smartphone className="size-3.5" /> Push notification sent to</span>{" "}
              <span className="font-medium text-text">{worker.label}</span>.
            </>
          ) : (
            "It's in the unassigned queue."
          )}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/work-orders" className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-surface-2">
            All work orders
          </Link>
          <Link href="/" className="inline-flex h-9 items-center rounded-md bg-text px-3 text-sm font-medium text-white">
            Back to overview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: insert into Supabase `work_orders` and trigger FCM push to the assignee.
        setSubmitted(true);
      }}
      className="grid gap-6 lg:grid-cols-3"
    >
      <div className="space-y-5 rounded-lg border border-border bg-surface p-5 lg:col-span-2">
        {initial && (
          <div className="rounded-md bg-critical-bg px-3 py-2 text-xs text-critical">
            Linked to <span className="font-mono font-semibold">{initial.issueRef}</span>. The issue moves to “In progress” once this is assigned.
          </div>
        )}
        <div>
          <label className={label} htmlFor="title">Title</label>
          <input id="title" required defaultValue={initial?.title} className={field} placeholder="e.g. Routine inspection" />
        </div>
        <div>
          <label className={label} htmlFor="desc">Instructions</label>
          <textarea
            id="desc"
            rows={4}
            defaultValue={initial?.description}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-text"
            placeholder={`What should the ${terms.technician.toLowerCase()} do on site?`}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="site">{terms.site}</label>
            <select id="site" className={field} value={siteId} onChange={(e) => { setSiteId(e.target.value); setAssetId(""); }}>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="asset">Asset</label>
            <select id="asset" className={field} value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              <option value="">{`Whole ${terms.site.toLowerCase()}`}</option>
              {siteAssets.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="kind">Type</label>
            <select id="kind" className={field} defaultValue={initial?.kind ?? "inspection"}>
              {kinds.map((k) => <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="due">Due</label>
            <input id="due" type="date" className={field} defaultValue={today} />
          </div>
        </div>
        <div>
          <span className={label}>Priority</span>
          <div className="flex flex-wrap gap-2">
            {priorities.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={`h-8 rounded-md border px-3 text-xs font-medium capitalize ${
                  priority === p
                    ? p === "critical"
                      ? "border-critical bg-critical text-white"
                      : "border-text bg-text text-white"
                    : "border-border bg-surface text-muted hover:text-text"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <span className={label}>Assign to</span>
          <ul className="space-y-1">
            {sortedWorkers.map((w) => (
              <li key={w.id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${
                    assignee === w.id ? "border-text bg-surface-2" : "border-transparent hover:bg-surface-2"
                  }`}
                >
                  <input type="radio" name="assignee" value={w.id} checked={assignee === w.id} onChange={() => setAssignee(w.id)} className="accent-black" />
                  <span className="flex-1">{w.label}</span>
                  {w.baseSiteId === siteId && <span className="text-[11px] whitespace-nowrap text-ok">Based here</span>}
                  {!w.onShift && <span className="text-[11px] text-faint">Off shift</span>}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <button type="submit" className="h-10 w-full rounded-md bg-text text-sm font-medium text-white hover:bg-text/90">
          Create and notify {terms.technician.toLowerCase()}
        </button>
      </div>
    </form>
  );
}
