"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { openChecklistForm } from "@/shared/lib/checklistModal";

export default function ChecklistRedirectClient({
  rewrite,
  editQuestionId,
}: {
  rewrite: boolean;
  editQuestionId: number | null;
}) {
  const router = useRouter();

  useEffect(() => {
    openChecklistForm({ rewrite, editQuestionId, viaRedirect: true });
    router.replace("/");
  }, [router, rewrite, editQuestionId]);

  return null;
}
