import { ElementType, ComponentPropsWithoutRef } from "react";

export type TypographyVariant =
  // Titles
  | "title-42-b"
  | "title-40-r"
  | "title-32-b"
  | "title-32-r"
  | "title-28-sb"
  | "title-24-b"
  | "title-24-sb"
  | "title-24-m"
  // Subtitles
  | "subtitle-20-b"
  | "subtitle-20-m"
  | "subtitle-18-b"
  | "subtitle-18-sb"
  | "subtitle-18-m"
  | "subtitle-16-r"
  | "subtitle-16-sb"
  // Body
  | "body-18-r"
  | "body-16-m"
  | "body-16-r"
  | "body-14-m"
  | "body-14-r"
  | "body-13-r"
  // Captions
  | "caption-12-sb"
  | "caption-12-r"
  // Action
  | "btn-14-m"
  | "link-14-sb"
  | "btn-12-m"
  // Section intros
  | "section-intro-griun"
  | "section-intro-griun-sm";

/**
 * Base class literals — Tailwind v4 cannot detect dynamically constructed
 * class names, so all variants must appear as complete string literals here.
 */
const BASE: Record<TypographyVariant, string> = {
  "title-42-b":             "text-title-42-b",
  "title-40-r":             "text-title-40-r",
  "title-32-b":             "text-title-32-b",
  "title-32-r":             "text-title-32-r",
  "title-28-sb":            "text-title-28-sb",
  "title-24-b":             "text-title-24-b",
  "title-24-sb":            "text-title-24-sb",
  "title-24-m":             "text-title-24-m",
  "subtitle-20-b":          "text-subtitle-20-b",
  "subtitle-20-m":          "text-subtitle-20-m",
  "subtitle-18-b":          "text-subtitle-18-b",
  "subtitle-18-sb":         "text-subtitle-18-sb",
  "subtitle-18-m":          "text-subtitle-18-m",
  "subtitle-16-r":          "text-subtitle-16-r",
  "subtitle-16-sb":         "text-subtitle-16-sb",
  "body-18-r":              "text-body-18-r",
  "body-16-m":              "text-body-16-m",
  "body-16-r":              "text-body-16-r",
  "body-14-m":              "text-body-14-m",
  "body-14-r":              "text-body-14-r",
  "body-13-r":              "text-body-13-r",
  "caption-12-sb":          "text-caption-12-sb",
  "caption-12-r":           "text-caption-12-r",
  "btn-14-m":               "text-btn-14-m",
  "link-14-sb":             "text-link-14-sb",
  "btn-12-m":               "text-btn-12-m",
  "section-intro-griun":    "text-section-intro-griun",
  "section-intro-griun-sm": "text-section-intro-griun-sm",
};

/**
 * max-md: variants — used for mobileVariant overrides.
 *
 * Tailwind v4 CSS generation order: base classes are emitted AFTER media-query
 * classes, so a plain `text-*` base class always wins over `md:text-*`.
 * The fix mirrors the `hidden md:block` rule: use `max-md:text-*` (also a
 * media-query class) for the mobile override so both sides are media-query-based
 * and ordering is deterministic.
 *
 * Pattern: `max-md:{mobile} {base}`  (NOT `{mobile} md:{base}`)
 */
const MAX_MD: Record<TypographyVariant, string> = {
  "title-42-b":             "max-md:text-title-42-b",
  "title-40-r":             "max-md:text-title-40-r",
  "title-32-b":             "max-md:text-title-32-b",
  "title-32-r":             "max-md:text-title-32-r",
  "title-28-sb":            "max-md:text-title-28-sb",
  "title-24-b":             "max-md:text-title-24-b",
  "title-24-sb":            "max-md:text-title-24-sb",
  "title-24-m":             "max-md:text-title-24-m",
  "subtitle-20-b":          "max-md:text-subtitle-20-b",
  "subtitle-20-m":          "max-md:text-subtitle-20-m",
  "subtitle-18-b":          "max-md:text-subtitle-18-b",
  "subtitle-18-sb":         "max-md:text-subtitle-18-sb",
  "subtitle-18-m":          "max-md:text-subtitle-18-m",
  "subtitle-16-r":          "max-md:text-subtitle-16-r",
  "subtitle-16-sb":         "max-md:text-subtitle-16-sb",
  "body-18-r":              "max-md:text-body-18-r",
  "body-16-m":              "max-md:text-body-16-m",
  "body-16-r":              "max-md:text-body-16-r",
  "body-14-m":              "max-md:text-body-14-m",
  "body-14-r":              "max-md:text-body-14-r",
  "body-13-r":              "max-md:text-body-13-r",
  "caption-12-sb":          "max-md:text-caption-12-sb",
  "caption-12-r":           "max-md:text-caption-12-r",
  "btn-14-m":               "max-md:text-btn-14-m",
  "link-14-sb":             "max-md:text-link-14-sb",
  "btn-12-m":               "max-md:text-btn-12-m",
  "section-intro-griun":    "max-md:text-section-intro-griun",
  "section-intro-griun-sm": "max-md:text-section-intro-griun-sm",
};

type TextProps<T extends ElementType = "p"> = {
  as?: T;
  variant: TypographyVariant;
  mobileVariant?: TypographyVariant;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export default function Text<T extends ElementType = "p">({
  as,
  variant,
  mobileVariant,
  className,
  children,
  ...props
}: TextProps<T>) {
  const Component = (as ?? "p") as ElementType;
  // mobileVariant present → "max-md:{mobile} {base}"  (both media-query-based)
  // mobileVariant absent  → "{base}"
  const variantClasses = mobileVariant
    ? `${MAX_MD[mobileVariant]} ${BASE[variant]}`
    : BASE[variant];
  return (
    <Component className={[variantClasses, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </Component>
  );
}
