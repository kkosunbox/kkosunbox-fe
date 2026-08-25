import { apiClient } from "@/shared/lib/api";
import type {
  CreatePartnershipInquiryRequest,
  CreatePartnershipInquiryResponse,
} from "./types";

/** 로그인 사용자의 제휴·입점 문의 등록 */
export function createPartnershipInquiry(body: CreatePartnershipInquiryRequest) {
  return apiClient.post<CreatePartnershipInquiryResponse>(
    "/v1/partnership-inquiries",
    body,
  );
}
