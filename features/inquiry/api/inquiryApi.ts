import { apiClient } from "@/shared/lib/api";
import type {
  CreateInquiryRequest,
  CreateInquiryResponse,
  InquiryListResponse,
} from "./types";

/** 내 문의 목록 조회 */
export function getInquiries() {
  return apiClient.get<InquiryListResponse>("/v1/inquiries");
}

/** 1:1 문의 등록 */
export function createInquiry(body: CreateInquiryRequest) {
  return apiClient.post<CreateInquiryResponse>("/v1/inquiries", body);
}

/** 1:1 문의 삭제 */
export function deleteInquiry(inquiryId: number) {
  return apiClient.delete<void>(`/v1/inquiries/${inquiryId}`);
}
