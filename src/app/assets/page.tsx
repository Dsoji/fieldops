import type { Metadata } from "next";
import { AssetStatusBadge, Card, PageHeader, Table, Td, TextLink } from "@/components/ui";
import { getStore } from "@/lib/data";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Assets" };

export default async function AssetsPage() {
  const store = await getStore();
  const { getAssets, getAssetType, getSite, now, terms } = store;
  const { formatDate } = store.fmt;
  const assets = getAssets();
  const dueSoon = assets.filter((a) => new Date(a.nextMaintenanceOn).getTime() - now.getTime() < 7 * 86_400_000);

  return (
    <>
      <PageHeader title="Assets" description={`${assets.length} assets · ${dueSoon.length} due for maintenance within 7 days`} />
      <Card padded={false}>
        <Table head={["Asset", "Type", terms.site, "Make / model", "Status", "Last inspected", "Next service"]}>
          {assets.map((a) => {
            const due = dueSoon.includes(a);
            return (
              <tr key={a.id} className="hover:bg-surface-2">
                <Td>
                  <div className="font-mono text-[11px] text-faint">{a.tag}</div>
                  <TextLink href={`/assets/${a.id}`}>{a.name}</TextLink>
                </Td>
                <Td className="text-muted">{getAssetType(a.typeId)?.name}</Td>
                <Td className="text-muted">{getSite(a.siteId)?.name}</Td>
                <Td className="whitespace-nowrap text-muted">{a.manufacturer} {a.model}</Td>
                <Td><AssetStatusBadge value={a.status} /></Td>
                <Td className="whitespace-nowrap text-muted">{timeAgo(a.lastInspectedAt)}</Td>
                <Td className={`whitespace-nowrap ${due ? "font-medium text-high" : "text-muted"}`}>{formatDate(a.nextMaintenanceOn)}</Td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
