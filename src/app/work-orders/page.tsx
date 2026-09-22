import type { Metadata } from "next";
import { MapPinCheck, Plus } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  PageHeader,
  PriorityBadge,
  Table,
  Td,
  TextLink,
  WorkOrderStatusBadge,
} from "@/components/ui";
import { getStore, isOpenWorkOrder, isOverdue } from "@/lib/data";
import { formatDue, titleCase } from "@/lib/format";

export const metadata: Metadata = { title: "Work orders" };

export default async function WorkOrdersPage() {
  const store = await getStore();
  const { getAsset, getSite, getWorker, getWorkOrders, terms } = store;
  const all = getWorkOrders();
  const open = all.filter(isOpenWorkOrder);

  return (
    <>
      <PageHeader
        title="Work orders"
        description={`${open.length} open · ${all.filter(isOverdue).length} overdue`}
        actions={
          <Button variant="primary" href="/work-orders/new">
            <Plus className="size-4" /> New work order
          </Button>
        }
      />
      <Card padded={false}>
        <Table head={["Work order", "Type", `${terms.site} / asset`, "Assignee", "Priority", "Status", "Due"]}>
          {all.map((wo) => {
            const worker = getWorker(wo.assignedTo);
            const asset = wo.assetId ? getAsset(wo.assetId) : undefined;
            return (
              <tr key={wo.id} className="hover:bg-surface-2">
                <Td>
                  <div className="font-mono text-[11px] text-faint">{wo.reference}</div>
                  <TextLink href={`/work-orders/${wo.id}`}>{wo.title}</TextLink>
                </Td>
                <Td className="text-muted">{titleCase(wo.kind)}</Td>
                <Td>
                  <div>{getSite(wo.siteId)?.name}</div>
                  {asset && <div className="font-mono text-[11px] text-faint">{asset.tag}</div>}
                </Td>
                <Td>
                  {worker ? (
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <Avatar name={worker.fullName} />
                      {worker.fullName}
                      {wo.checkInVerified && wo.status !== "completed" && (
                        <MapPinCheck className="size-3.5 text-ok" aria-label="Checked in on site" />
                      )}
                    </span>
                  ) : (
                    <span className="text-faint">Unassigned</span>
                  )}
                </Td>
                <Td><PriorityBadge value={wo.priority} /></Td>
                <Td><WorkOrderStatusBadge value={wo.status} /></Td>
                <Td className={`whitespace-nowrap ${isOverdue(wo) ? "font-medium text-critical" : "text-muted"}`}>
                  {wo.status === "completed" ? "Done" : formatDue(wo.dueAt)}
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
