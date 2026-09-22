import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getAsset, getAssets, getFieldWorkers, getIssue, getSites } from "@/lib/data";
import { WorkOrderForm } from "./work-order-form";

export const metadata: Metadata = { title: "New work order" };

export default async function NewWorkOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { issue: issueId } = await searchParams;
  const issue = typeof issueId === "string" ? getIssue(issueId) : undefined;
  const asset = issue?.assetId ? getAsset(issue.assetId) : undefined;

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/work-orders" className="hover:text-text">Work orders / New</Link>}
        title="New work order"
        description={
          issue
            ? `Dispatching a technician for ${issue.reference} — details are pre-filled from the field report.`
            : "Assign work to a technician. They'll get it on their phone immediately."
        }
      />
      <WorkOrderForm
        sites={getSites().map((s) => ({ id: s.id, label: s.name }))}
        assets={getAssets().map((a) => ({ id: a.id, label: `${a.tag} · ${a.name}`, siteId: a.siteId }))}
        workers={getFieldWorkers().map((w) => ({ id: w.id, label: w.fullName, onShift: w.onShift, baseSiteId: w.baseSiteId }))}
        initial={
          issue
            ? {
                title: `Repair: ${issue.title}`,
                description: issue.description,
                kind: "repair",
                priority: issue.severity,
                siteId: issue.siteId,
                assetId: asset?.id ?? "",
                issueRef: issue.reference,
              }
            : undefined
        }
      />
    </>
  );
}
