import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { GreetingBanner } from "./GreetingBanner";

export async function GreetingBannerLoader() {
  const token = await getServerToken();
  const profile = await fetchProfile(token);
  return <GreetingBanner profile={profile} />;
}
