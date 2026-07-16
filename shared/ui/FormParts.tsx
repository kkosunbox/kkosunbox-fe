"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { ChevronIcon, CheckIcon, RadioCheckedIcon } from "./FormPartsIcons";

export function CollapsiblePanel({
  open,
  id,
  children,
  className = "",
  innerClassName = "",
}: {
  open: boolean;
  id?: string;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div
      id={id}
      aria-hidden={!open}
      inert={!open}
      className={className}
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transition: prefersReducedMotion
          ? "none"
          : "grid-template-rows 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease",
      }}
    >
      <div className="min-h-0 overflow-hidden">
        {innerClassName ? <div className={innerClassName}>{children}</div> : children}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const contentId = useId();

  return (
    <div className="max-md:rounded-none max-md:px-0 md:rounded-[20px] md:bg-white md:px-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between border-b border-[var(--color-text-muted)] text-left max-md:pb-3 md:pt-7 md:pb-5"
      >
        <span className="tracking-[-0.04em] text-[var(--color-text)] max-md:text-subtitle-16-b md:text-subtitle-18-b">{title}</span>
        <ChevronIcon open={open} />
      </button>
      <CollapsiblePanel id={contentId} open={open} innerClassName="max-md:pt-5 md:pt-5 md:pb-5">
        {children}
      </CollapsiblePanel>
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange()}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={[
          "w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 transition-colors",
          checked ? "bg-[var(--color-accent)]" : "border border-[var(--color-border)] bg-white",
        ].join(" ")}
      >
        {checked && <CheckIcon />}
      </span>
      <span className="text-body-13-m leading-[16px] text-[var(--color-text)]">{label}</span>
    </label>
  );
}

export function RadioButton({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        checked={checked}
        onChange={() => onChange()}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={[
          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
          checked ? "" : "border border-[var(--color-border)]",
        ].join(" ")}
      >
        {checked && <RadioCheckedIcon />}
      </span>
      <span className="text-body-14-m leading-[17px] tracking-[-0.02em] text-[var(--color-text)]">
        {label}
      </span>
    </label>
  );
}

export function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-0">
      <span className="shrink-0 pt-3 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px]">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
