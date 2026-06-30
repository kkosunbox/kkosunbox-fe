import type { DogGender } from "@/features/profile/api/types";

export function GenderButtons({
  gender,
  onChange,
}: {
  gender: DogGender | null;
  onChange: (value: DogGender) => void;
}) {
  const className = (value: DogGender) =>
    [
      "flex h-10 flex-1 items-center justify-center rounded-[4px] text-body-13-m transition-colors",
      gender === value
        ? "bg-[var(--color-secondary)] font-semibold text-[var(--color-surface-dark)]"
        : "bg-[var(--color-ui-inactive-bg)] text-[var(--color-text)]",
    ].join(" ");

  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => onChange("male")} className={className("male")}>
        남
      </button>
      <button type="button" onClick={() => onChange("female")} className={className("female")}>
        여
      </button>
    </div>
  );
}
