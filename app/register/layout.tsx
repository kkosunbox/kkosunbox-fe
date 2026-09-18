import type { Metadata, Viewport } from "next";
import { NOINDEX_METADATA } from "@/shared/lib/seo";
import { RegisterLayoutShell } from "./RegisterLayoutShell";

export const viewport: Viewport = {
  themeColor: "#FEFDF4",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  ...NOINDEX_METADATA,
  appleWebApp: {
    statusBarStyle: "default",
  },
};

/** 일반 회원가입은 몰입형 레이아웃, 소셜 약관 동의는 사이트 공통 레이아웃을 사용한다. */
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <RegisterLayoutShell>{children}</RegisterLayoutShell>;
}
