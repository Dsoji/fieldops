import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { Card, IssueStatusBadge, PageHeader, PriorityBadge, Table, Td, TextLink } from "@/components/ui";
import { getAsset, getIssues, getSite, getWorker, isOpenIssue } from "@/lib/data";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Issues" };

export default function IssuesPage() {
  const issues = getIssues();
  const open = issues.filter(isOpenIssue);

  return (
    <>
      <PageHeader
        title="Issues"
        description={`${open.length} open · reported by technicians from the field, sorted by severity.`}
      />
      <Card padded={false}>
        <Table head={["Issue", "Asset", "Site", "Severity", "Status", "Reported"]}>
          {issues.map((issue) => {
            const asset = issue.assetId ? getAsset(issue.assetId) : undefined;
            const reporter = getWorker(issue.reportedBy);
            return (
              <tr key={issue.id} className={`hover:bg-surface-2 ${issue.status === "resolved" ? "opacity-60" : ""}`}>
                <Td>
                  <div className="font-mono text-[11px] text-faint">{issue.reference}</div>
                  <TextLink href={`/issues/${issue.id}`}>{issue.title}</TextLink>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-faint">
                    <Camera className="size-3" /> {issue.photoCount} photos
                  </div>
                </Td>
                <Td className="font-mono text-xs">{asset?.tag ?? "—"}</Td>
                <Td className="text-muted">{getSite(issue.siteId)?.name}</Td>
                <Td><PriorityBadge value={issue.severity} /></Td>
                <Td><IssueStatusBadge value={issue.status} /></Td>
                <Td className="text-muted">
                  <div className="whitespace-nowrap">{timeAgo(issue.reportedAt)}</div>
                  <div className="text-[11px] text-faint">{reporter?.fullName}</div>
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
