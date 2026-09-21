"use client";

import { usePathname } from "next/navigation";
import FooterSection from "./FooterSection";

export default function FooterGate({ hideOnRedesignedHome }: { hideOnRedesignedHome: boolean }) {
  const pathname = usePathname();
  if (hideOnRedesignedHome && pathname === "/") return null;
  return <FooterSection />;
}
