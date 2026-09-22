import type { Metadata } from "next";
import { Avatar, Badge, Card, PageHeader, Table, Td } from "@/components/ui";
import { getStore, isOpenWorkOrder } from "@/lib/data";
import { titleCase } from "@/lib/format";

export const metadata: Metadata = { title: "Field team" };

export default async function WorkersPage() {
  const store = await getStore();
  const { getSite, getWorkers, getWorkOrders, terms } = store;
  const workers = getWorkers();
  const wos = getWorkOrders();

  return (
    <>
      <PageHeader title="Field team" description={`${workers.length} people · roles control what each person can see and do.`} />
      <Card padded={false}>
        <Table head={["Name", "Role", `Base ${terms.site.toLowerCase()}`, "Open work", "Completed", "Shift"]}>
          {workers.map((w) => {
            const mine = wos.filter((o) => o.assignedTo === w.id);
            const onSite = mine.find((o) => o.checkInVerified && o.status === "in_progress");
            return (
              <tr key={w.id} className="hover:bg-surface-2">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={w.fullName} size="md" />
                    <div>
                      <div className="font-medium">{w.fullName}</div>
                      <div className="text-[11px] text-faint">{w.phone}</div>
                    </div>
                  </div>
                </Td>
                <Td><Badge tone={w.role === "field_worker" ? "neutral" : "info"}>{titleCase(w.role)}</Badge></Td>
                <Td className="text-muted">{getSite(w.baseSiteId)?.name}</Td>
                <Td>{w.role === "field_worker" ? mine.filter(isOpenWorkOrder).length : "—"}</Td>
                <Td>{w.role === "field_worker" ? mine.filter((o) => o.status === "completed").length : "—"}</Td>
                <Td>
                  {onSite ? (
                    <Badge tone="ok" dot>On site · {getSite(onSite.siteId)?.city}</Badge>
                  ) : w.onShift ? (
                    <Badge tone="info" dot>On shift</Badge>
                  ) : (
                    <Badge tone="neutral">Off</Badge>
                  )}
                </Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
