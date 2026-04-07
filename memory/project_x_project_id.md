---
name: x-project-id 헤더 미확인
description: POST /v1/asset/attachment/presigned-url의 x-project-id 헤더 값 출처가 불명확하여 임시 처리됨
type: project
---

`shared/lib/asset/assetApi.ts`의 `getAttachmentPresignedUrl` 함수에서
`x-project-id` 헤더가 required인데 값의 출처를 확인하지 못한 채 파라미터로 임시 처리됨.

**Why:** 백엔드 API 문서 curl 예시에 값이 비어 있어 (`x-project-id: `) 환경변수인지
런타임 동적 값인지 불명확했음.

**How to apply:** 백엔드 팀에 x-project-id 출처 확인 후 아래 처리:
- 환경변수라면: `.env.local`에 `NEXT_PUBLIC_PROJECT_ID=값` 추가 →
  `shared/config/env.ts`의 `env` 객체에 `projectId` 필드 추가 →
  `assetApi.ts`에서 파라미터 제거 후 `env.projectId`로 직접 참조
- 동적 값이라면: 현재 시그니처(파라미터 전달) 유지
