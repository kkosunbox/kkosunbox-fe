import { ElementType, ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "lg" | "md" | "sm";

type ButtonProps<T extends ElementType = "button"> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-text)] text-white",
  secondary: "bg-[var(--color-secondary)] text-[var(--color-text)]",
  ghost: "border border-[var(--color-text)] bg-transparent text-[var(--color-text)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  lg: "md:w-[192px] h-[52px] text-[18px] font-semibold leading-[30px] tracking-[-0.04em]",
  md: "h-[44px] px-6 text-[16px] font-semibold leading-[24px] tracking-[-0.02em]",
  sm: "h-[30px] px-4 text-[13px] font-medium leading-[1]",
};

export default function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "lg",
  className,
  children,
  ...props
}: ButtonProps<T>) {
  const Component = (as ?? "button") as ElementType;
  return (
    <Component
      className={[
        "inline-flex items-center justify-center rounded-full [font-feature-settings:'liga'_off]",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}
