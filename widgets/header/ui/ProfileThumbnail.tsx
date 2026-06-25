import { FallbackAvatar } from "@/shared/ui";

const THUMBNAIL_SIZE_PX = { sm: 32, md: 48, lg: 54, xl: 68 } as const;

export function ProfileThumbnail({
  imageUrl,
  userId,
  size,
}: {
  imageUrl: string | null;
  userId?: number | null;
  size: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-[54px] w-[54px]", xl: "h-[68px] w-[68px]" }[size];

  return (
    <div className={`${sizeClass} shrink-0 overflow-hidden rounded-full`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- 프로필 CDN URL, 도메인 가변
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <FallbackAvatar userId={userId} size={THUMBNAIL_SIZE_PX[size]} className="h-full w-full" />
      )}
    </div>
  );
}
