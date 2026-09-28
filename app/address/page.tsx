import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import { AddressManager } from "@/features/delivery-address/ui";

export default async function AddressPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; selectedId?: string }>;
}) {
  const token = await getServerToken();
  if (!token) redirect("/login?next=/address");

  const { mode, selectedId: selectedIdStr } = await searchParams;
  const selectedId = selectedIdStr ? Number(selectedIdStr) : null;

  const addresses = await fetchDeliveryAddresses(token);

  return (
    <AddressManager
      initialAddresses={addresses}
      selectionMode={mode === "select"}
      initialSelectedId={Number.isFinite(selectedId) ? selectedId : null}
    />
  );
}
