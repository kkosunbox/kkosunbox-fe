// ── InquiryDto ────────────────────────────────────────────────────

export type InquiryStatus = "pending" | "in_progress" | "resolved";

export interface InquiryDto {
  id: number;
  title: string;
  content: string;
  status: InquiryStatus;
  isAnswered: boolean;
  createdAt: string;     // date-time
  answer?: string;       // 관리자 답변
  answeredAt?: string;   // date-time
  attachmentUrls?: string[];
  contact?: string;
}

// ── 요청 ──────────────────────────────────────────────────────────

export interface CreateInquiryRequest {
  title: string;            // 최대 50자
  content: string;          // 최대 200자
  attachmentUrls?: string[]; // asset 모듈에서 발급받은 fileUrl 배열 (최대 2개)
  contact?: string;         // 최대 100자
}

// ── 응답 ──────────────────────────────────────────────────────────

export interface InquiryListResponse {
  inquiries: InquiryDto[];
}

export interface CreateInquiryResponse {
  inquiry: InquiryDto;
}
