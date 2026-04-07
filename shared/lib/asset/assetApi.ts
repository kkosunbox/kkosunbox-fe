import { apiClient } from "@/shared/lib/api";
import type { PresignedUrlRequest, PresignedUrlResponse } from "./types";

// TODO: x-project-id 헤더 값 확인 필요
//
// POST /v1/asset/attachment/presigned-url 요청 시 x-project-id 헤더가 required.
// 백엔드 문서의 curl 예시에 값이 비어 있어 (`x-project-id: `) 출처가 불명확함.
//
// 확인 후 아래 중 하나로 처리:
//   A) 환경변수로 관리
//      → .env.local / .env.example 에 NEXT_PUBLIC_PROJECT_ID=값 추가
//      → shared/config/env.ts 의 env 객체에 projectId 필드 추가
//      → 이 파일에서 projectId 파라미터 제거 후 env.projectId 로 직접 참조
//
//   B) 런타임에 동적으로 결정되는 값
//      → 현재 시그니처(projectId 파라미터) 유지, 호출 측에서 주입
//
// 현재는 호출 측에서 projectId를 직접 전달하도록 임시 처리해둠.

/**
 * 문의하기 파일 첨부용 Presigned URL 발급
 * @param projectId - x-project-id 헤더 값 (출처 확인 필요 — 위 TODO 참고)
 */
export function getAttachmentPresignedUrl(
  body: PresignedUrlRequest,
  projectId: string,
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
