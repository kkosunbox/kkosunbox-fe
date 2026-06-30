import { FallbackAvatar } from "@/shared/ui";
import { PencilIcon } from "./PencilIcon";

export function PetAvatar({
  size = 124,
  editSize = 40,
  imageUrl,
  userId,
  onEditClick,
  disabled,
  uploading,
}: {
  size?: number;
  editSize?: number;
  imageUrl: string | null;
  userId?: number | null;
  onEditClick: () => void;
  disabled?: boolean;
  uploading?: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <div
        role="button"
        tabIndex={0}
        aria-label="프로필 사진 변경"
        onClick={() => { if (!disabled && !uploading) onEditClick(); }}
        onKeyDown={(e) => { if (!disabled && !uploading && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onEditClick(); } }}
        className="cursor-pointer overflow-hidden rounded-full ring-1 ring-[var(--color-text-muted)]"
        style={{ width: size, height: size }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            width={size}
            height={size}
          />
        ) : (
          <FallbackAvatar userId={userId} className="h-full w-full" />
        )}
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        onClick={onEditClick}
        disabled={disabled || uploading}
        className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] shadow-[0_4px_10px_rgba(92,70,52,0.12)] disabled:opacity-50"
        style={{ width: editSize, height: editSize }}
      >
        {uploading ? (
          <span
            className="inline-block animate-spin rounded-full border-2 border-[var(--color-text-secondary)] border-t-transparent"
            style={{ width: editSize * 0.45, height: editSize * 0.45 }}
            aria-hidden
          />
        ) : (
          <PencilIcon style={{ width: editSize * 0.8, height: editSize * 0.8 }} />
        )}
      </button>
    </div>
  );
}
