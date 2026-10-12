import { permanentRedirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 예전 스토어 목록 주소 — 쿼리(confirmError 등)를 유지한 채 /products로 영구 이동 */
export default async function PurchasePage({ searchParams }: Props) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of [value].flat()) if (item !== undefined) query.append(key, item);
  }
  permanentRedirect(query.size > 0 ? `/products?${query.toString()}` : "/products");
}
