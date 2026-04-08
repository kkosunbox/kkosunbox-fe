/**
 * 서버 전용 문의 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { InquiryDto } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/** 문의 목록 */
export async function fetchInquiries(token?: string): Promise<InquiryDto[]> {
  const data = await apiClient
    .get<{ inquiries: InquiryDto[] }>("/v1/inquiries", serverOpts(token))
    .catch(() => ({ inquiries: [] as InquiryDto[] }));
  return data.inquiries;
}
