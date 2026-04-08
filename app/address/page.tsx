import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import { AddressManager } from "@/features/delivery-address/ui";

export default async function AddressPage() {
  const token = await getServerToken();
  if (!token) redirect("/login");

  const addresses = await fetchDeliveryAddresses(token);

  return <AddressManager initialAddresses={addresses} />;
}
