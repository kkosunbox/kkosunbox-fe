import { FallbackAvatar } from "@/shared/ui";
import { MenuPencilIcon } from "./MenuIcons";

const THUMBNAIL_SIZE_PX = { sm: 32, md: 48, lg: 64, xl: 68 } as const;

export function ProfileThumbnail({
  imageUrl,
  userId,
  size,
}: {
  imageUrl: string | null;
  userId?: number | null;
  size: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16", xl: "h-[68px] w-[68px]" }[size];

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

/** 프로필 메뉴 아바타 우하단 연필 배지 — 프로필 관리(체크리스트 폼) 진입 */
export function ProfileEditBadge({ onClick, className }: { onClick: () => void; className: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="프로필 관리"
      className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] transition-opacity hover:opacity-80 ${className}`}
    >
      <MenuPencilIcon />
    </button>
  );
}
