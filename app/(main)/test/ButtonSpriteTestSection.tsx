"use client";

import { ButtonWithPawEffect } from "@/shared/ui";

const BUTTON_CASES: {
  label: string;
  variant: "primary" | "secondary" | "ghost";
  size: "lg" | "md" | "sm";
}[] = [
  { label: "Primary LG", variant: "primary", size: "lg" },
  { label: "Secondary LG", variant: "secondary", size: "lg" },
  { label: "Ghost LG", variant: "ghost", size: "lg" },
  { label: "Primary MD", variant: "primary", size: "md" },
  { label: "Secondary MD", variant: "secondary", size: "md" },
  { label: "Ghost MD", variant: "ghost", size: "md" },
  { label: "Primary SM", variant: "primary", size: "sm" },
  { label: "Secondary SM", variant: "secondary", size: "sm" },
  { label: "Ghost SM", variant: "ghost", size: "sm" },
];

export default function ButtonSpriteTestSection() {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <p className="text-sm text-zinc-500">
        버튼을 클릭하면 발바닥 팝 스프라이트 애니메이션이 1회 재생됩니다. 연속 클릭 시 애니메이션이 재시작됩니다.
      </p>
      <div className="grid grid-cols-3 gap-x-6 gap-y-10">
        {BUTTON_CASES.map(({ label, variant, size }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <span className="text-xs text-zinc-400">{label}</span>
            <div className="flex items-center justify-center py-6">
              <ButtonWithPawEffect variant={variant} size={size}>
                {label}
              </ButtonWithPawEffect>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
