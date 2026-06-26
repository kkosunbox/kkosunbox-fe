import { redirect } from "next/navigation";
import { getAuthUser } from "@/features/auth/lib/session";
import ChecklistRedirectClient from "./ChecklistRedirectClient";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "체크리스트 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function ChecklistPage({
  searchParams,
}: {
  searchParams: Promise<{
    result?: string;
    rewrite?: string;
    editQuestionId?: string;
  }>;
}) {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/login?next=/");
  }

  const params = await searchParams;

  if (params.result === "1") {
    redirect("/checklist/result");
  }

  const rewrite = params.rewrite === "1";
  const editQuestionId = params.editQuestionId
    ? Number(params.editQuestionId)
    : null;

  return (
    <ChecklistRedirectClient rewrite={rewrite} editQuestionId={editQuestionId} />
  );
}
