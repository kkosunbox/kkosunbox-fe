"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";

export function RegisterLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/register/social") {
    return (
      <div className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div data-login-mobile-chrome>
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[51] lg:hidden"
        style={{
          height: "calc(env(safe-area-inset-top) + 30px)",
          backgroundColor: "var(--color-login-top)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[51] lg:hidden"
        style={{
          height: "env(safe-area-inset-bottom)",
          backgroundColor: "var(--color-login-mobile-chrome)",
        }}
      />
      <main>{children}</main>
    </div>
  );
}
