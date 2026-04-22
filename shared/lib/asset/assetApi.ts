import { apiClient } from "@/shared/lib/api";
import { env } from "@/shared/config/env";
import type { PresignedUrlRequest, PresignedUrlResponse } from "./types";

// x-project-id 헤더 값 출처는 아직 백엔드 팀 확인 중.
// 현재는 env.projectId(NEXT_PUBLIC_PROJECT_ID) 를 기본값으로 사용하고,
// 동적 값이 필요한 경우 projectId 파라미터로 override 가능.

/**
 * 문의하기 파일 첨부용 Presigned URL 발급
 * @param projectId - x-project-id 헤더 값 override (기본: env.projectId)
 */
export function getAttachmentPresignedUrl(
  body: PresignedUrlRequest,
  projectId: string = env.projectId,
) {
  return apiClient.post<PresignedUrlResponse>(
    "/v1/asset/attachment/presigned-url",
    body,
    { headers: { "x-project-id": projectId } },
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
