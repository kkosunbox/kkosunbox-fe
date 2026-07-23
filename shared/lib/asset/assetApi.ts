import { apiClient } from "@/shared/lib/api";
import type { PresignedUrlRequest, PresignedUrlResponse } from "./types";

/**
 * 문의하기 파일 첨부용 Presigned URL 발급
 */
export function getAttachmentPresignedUrl(body: PresignedUrlRequest) {
  return apiClient.post<PresignedUrlResponse>(
    "/v1/asset/attachment/presigned-url",
    body,
  );
}

/**
 * 프로필 이미지 업로드용 Presigned URL 발급
 * 허용 포맷 외 파일 전달 시 400 INVALID_FILE_FORMAT
 */
export function getProfileImagePresignedUrl(body: PresignedUrlRequest) {
  return apiClient.post<PresignedUrlResponse>(
    "/v1/asset/profile-image/presigned-url",
    body,
  );
}
