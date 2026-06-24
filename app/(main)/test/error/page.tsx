"use client";

import { notFound } from "next/navigation";
import { PageErrorFallback } from "@/shared/ui";

export default function ErrorTestPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="flex min-h-screen flex-col">
      <PageErrorFallback
        actions={
          <button
            onClick={() => window.location.reload()}
            className="h-12 w-full max-w-[360px] rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-16-sb text-white transition-opacity hover:opacity-90"
          >
            새로고침
          </button>
        }
      />
    </main>
  );
}
