"use client";

import { useState } from "react";
import { Button, Text, type TypographyVariant } from "@/shared/ui";
import CollapseSection from "./CollapseSection";

/* ── Color Data ──────────────────────────────────────────────────── */

type ColorEntry = { token: string; label: string };

const COLOR_GROUPS: { group: string; colors: ColorEntry[] }[] = [
  {
    group: "Brand",
    colors: [
      { token: "primary", label: "Primary" },
      { token: "secondary", label: "Secondary" },
      { token: "accent", label: "Accent" },
      { token: "accent-orange", label: "Accent Orange" },
    ],
  },
  {
    group: "Surface",
    colors: [
      { token: "background", label: "Background" },
      { token: "surface-warm", label: "Surface Warm" },
      { token: "surface-light", label: "Surface Light" },
      { token: "surface-dark", label: "Surface Dark" },
      { token: "footer-bg", label: "Footer BG" },
      { token: "footer-text", label: "Footer Text" },
      { token: "beige", label: "Beige" },
    ],
  },
  {
    group: "Tier",
    colors: [
      { token: "premium", label: "Premium" },
      { token: "plus", label: "Plus" },
      { token: "basic", label: "Basic" },
      { token: "card-premium", label: "Card Premium" },
      { token: "card-standard", label: "Card Standard" },
      { token: "card-basic", label: "Card Basic" },
    ],
  },
  {
    group: "Brown Scale",
    colors: [
      { token: "brown-dark", label: "Brown Dark" },
      { token: "brown", label: "Brown" },
      { token: "brown-light", label: "Brown Light" },
      { token: "amber", label: "Amber" },
      { token: "tag", label: "Tag" },
    ],
  },
  {
    group: "Text",
    colors: [
      { token: "text", label: "Text" },
      { token: "text-secondary", label: "Secondary" },
      { token: "text-tertiary", label: "Tertiary" },
      { token: "text-muted", label: "Muted" },
      { token: "text-warm", label: "Warm" },
      { token: "text-on-warm", label: "On Warm" },
      { token: "text-body-warm", label: "Body Warm" },
    ],
  },
  {
    group: "Decoration",
    colors: [
      { token: "accent-rust", label: "Accent Rust" },
      { token: "divider-warm", label: "Divider Warm" },
      { token: "link-blue", label: "Link Blue" },
    ],
  },
];

const SPECIAL_COLORS = [
  { value: "#ffffff", label: "White" },
  { value: "#000000", label: "Black" },
];

/* ── Typography Data ─────────────────────────────────────────────── */

const TYPOGRAPHY_GROUPS: { label: string; variants: TypographyVariant[] }[] = [
  {
    label: "Title",
    variants: ["title-42-b", "title-40-r", "title-32-b", "title-32-r", "title-24-b", "title-24-sb", "title-24-m"],
  },
  {
    label: "Subtitle",
    variants: ["subtitle-20-b", "subtitle-20-m", "subtitle-18-b", "subtitle-18-sb", "subtitle-18-m", "subtitle-16-r", "subtitle-16-sb"],
  },
  {
    label: "Body",
    variants: ["body-18-r", "body-16-m", "body-16-r", "body-14-m", "body-14-r", "body-13-r"],
  },
  {
    label: "Caption & Action",
    variants: ["caption-12-sb", "caption-12-r", "btn-14-m", "link-14-sb", "btn-12-m"],
  },
  {
    label: "Section Intro",
    variants: ["section-intro-griun", "section-intro-griun-sm"],
  },
];

const TYPO_SAMPLE = "꼬순박스 강아지 간식 구독 The quick brown fox";

/* ── Button Data ─────────────────────────────────────────────────── */

const BUTTON_VARIANTS = ["primary", "secondary", "ghost"] as const;
const BUTTON_SIZES = ["lg", "md", "sm"] as const;

/* ── Swatch ──────────────────────────────────────────────────────── */

function Swatch({
  cssValue,
  label,
  active,
  onClick,
}: {
  cssValue: string;
  label: string;
  active: boolean;
  onClick: (v: string) => void;
}) {
  return (
    <button
      type="button"
      title={cssValue}
      onClick={() => onClick(cssValue)}
      className="flex flex-col items-center gap-1"
    >
      <span
        className="block h-9 w-9 rounded-full transition-transform hover:scale-110"
        style={{
          background: cssValue,
          border: active ? "2px solid var(--color-accent)" : "2px solid #e4e4e7",
          boxShadow: active
            ? "0 0 0 2px var(--color-accent)"
            : "0 1px 3px rgba(0,0,0,0.12)",
        }}
      />
      <span className="max-w-[52px] text-center text-[10px] leading-tight text-zinc-400">
        {label}
      </span>
    </button>
  );
}

/* ── Color Palette Panel ─────────────────────────────────────────── */

function ColorPalettePanel() {
  const [target, setTarget] = useState<"text" | "bg">("text");
  const [textColor, setTextColor] = useState("var(--color-text)");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [previewText, setPreviewText] = useState(
    "꼬순박스 텍스트 미리보기\nThe quick brown fox jumps over the lazy dog"
  );

  function applyColor(value: string) {
    if (target === "text") setTextColor(value);
    else setBgColor(value);
  }

  const isActive = (value: string) =>
    target === "text" ? textColor === value : bgColor === value;

  return (
    <div className="flex flex-col gap-5">
      {/* Preview */}
      <div className="overflow-hidden rounded-xl border border-zinc-200">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-zinc-200 bg-zinc-50 px-4 py-2">
          <span className="text-xs font-medium text-zinc-500">미리보기</span>
          <div className="ml-auto flex flex-wrap gap-3 text-[11px] text-zinc-400">
            <span>
              글자:{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-600">
                {textColor}
              </code>
            </span>
            <span>
              배경:{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-600">
                {bgColor}
              </code>
            </span>
          </div>
        </div>
        <textarea
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="min-h-[96px] w-full resize-y px-5 py-4 text-[18px] leading-8 outline-none"
          style={{ color: textColor, backgroundColor: bgColor }}
        />
      </div>

      {/* Target toggle + reset */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-zinc-500">적용 대상</span>
        <div className="flex overflow-hidden rounded-full border border-zinc-200 text-sm">
          {(["text", "bg"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTarget(t)}
              className="px-4 py-1.5 font-medium transition-colors"
              style={{
                background: target === t ? "var(--color-text)" : "white",
                color: target === t ? "white" : "var(--color-text-secondary)",
              }}
            >
              {t === "text" ? "글자색" : "배경색"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setTextColor("var(--color-text)");
            setBgColor("#ffffff");
          }}
          className="ml-auto text-xs text-zinc-400 underline hover:text-zinc-600"
        >
          초기화
        </button>
      </div>

      {/* Swatches */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            Special
          </p>
          <div className="flex flex-wrap gap-3">
            {SPECIAL_COLORS.map(({ value, label }) => (
              <Swatch
                key={value}
                cssValue={value}
                label={label}
                active={isActive(value)}
                onClick={applyColor}
              />
            ))}
          </div>
        </div>

        {COLOR_GROUPS.map(({ group, colors }) => (
          <div key={group}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              {group}
            </p>
            <div className="flex flex-wrap gap-3">
              {colors.map(({ token, label }) => {
                const cssValue = `var(--color-${token})`;
                return (
                  <Swatch
                    key={token}
                    cssValue={cssValue}
                    label={label}
                    active={isActive(cssValue)}
                    onClick={applyColor}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Typography Panel ────────────────────────────────────────────── */

function TypographyPanel() {
  return (
    <div className="flex flex-col gap-6">
      {TYPOGRAPHY_GROUPS.map(({ label, variants }) => (
        <div key={label}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            {label}
          </p>
          <div className="overflow-hidden rounded-xl border border-zinc-100">
            {variants.map((variant, i) => (
              <div
                key={variant}
                className={`flex min-h-[44px] items-center gap-4 px-4 py-2 ${
                  i % 2 === 0 ? "bg-white" : "bg-zinc-50"
                }`}
              >
                <code className="w-[188px] shrink-0 text-[11px] text-zinc-400">
                  text-{variant}
                </code>
                <Text
                  as="span"
                  variant={variant}
                  className="flex-1 truncate text-[var(--color-text)]"
                >
                  {TYPO_SAMPLE}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Button Panel ────────────────────────────────────────────────── */

function ButtonPanel() {
  const [target, setTarget] = useState<"text" | "bg">("text");
  const [textColor, setTextColor] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string | null>(null);

  function applyColor(value: string) {
    if (target === "text") setTextColor(value);
    else setBgColor(value);
  }

  const isActive = (value: string) =>
    target === "text" ? textColor === value : bgColor === value;

  const buttonStyle: React.CSSProperties = {
    ...(textColor ? { color: textColor } : {}),
    ...(bgColor ? { backgroundColor: bgColor } : {}),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Color controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-500">적용 대상</span>
          <div className="flex overflow-hidden rounded-full border border-zinc-200 text-sm">
            {(["text", "bg"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTarget(t)}
                className="px-4 py-1.5 font-medium transition-colors"
                style={{
                  background: target === t ? "var(--color-text)" : "white",
                  color: target === t ? "white" : "var(--color-text-secondary)",
                }}
              >
                {t === "text" ? "글자색" : "배경색"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { setTextColor(null); setBgColor(null); }}
            className="ml-auto text-xs text-zinc-400 underline hover:text-zinc-600"
          >
            초기화
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: "Special", entries: SPECIAL_COLORS.map(({ value, label }) => ({ cssValue: value, label })) },
            ...COLOR_GROUPS.map(({ group, colors }) => ({
              label: group,
              entries: colors.map(({ token, label }) => ({ cssValue: `var(--color-${token})`, label })),
            })),
          ].map(({ label, entries }) => (
            <div key={label}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {label}
              </p>
              <div className="flex flex-wrap gap-2">
                {entries.map(({ cssValue, label: swatchLabel }) => (
                  <Swatch
                    key={cssValue}
                    cssValue={cssValue}
                    label={swatchLabel}
                    active={isActive(cssValue)}
                    onClick={applyColor}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button grid */}
      {BUTTON_VARIANTS.map((variant) => (
        <div key={variant}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            {variant}
          </p>
          <div className="flex flex-wrap items-end gap-4">
            {BUTTON_SIZES.map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <Button variant={variant} size={size} style={buttonStyle}>
                  {variant} · {size}
                </Button>
                <span className="text-[10px] text-zinc-400">size={size}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Export ──────────────────────────────────────────────────────── */

export default function DesignSystemPanels() {
  return (
    <>
      <CollapseSection
        title="Color Palette"
        description="색상 토큰을 선택해 글자색·배경색을 즉시 확인합니다."
      >
        <ColorPalettePanel />
      </CollapseSection>

      <CollapseSection
        title="Typography"
        description="프로젝트 타이포그래피 클래스 전체 목록입니다."
        defaultOpen={false}
      >
        <TypographyPanel />
      </CollapseSection>

      <CollapseSection
        title="Button"
        description="Button 컴포넌트의 variant × size 조합입니다."
        defaultOpen={false}
      >
        <ButtonPanel />
      </CollapseSection>
    </>
  );
}
