import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = NOINDEX_METADATA;

export default function AddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[540px] justify-center bg-white">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
