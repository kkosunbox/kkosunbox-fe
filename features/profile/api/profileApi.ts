import { apiClient } from "@/shared/lib/api";
import type {
  ChecklistQuestion,
  CreateProfileRequest,
  Profile,
  UpdateProfileRequest,
} from "./types";

/**
 * 체크리스트 질문 + 선택지 목록 조회
 * 프로필 생성/수정 폼 진입 시 호출. 인증 불필요.
 */
export function getChecklistQuestions() {
  return apiClient.get<{ questions: ChecklistQuestion[] }>(
    "/v1/profiles/checklist",
  );
}

/** 내 애견 프로필 목록 조회 */
export function getProfiles() {
  return apiClient.get<{ profiles: Profile[] }>("/v1/profiles");
}

/**
 * 애견 프로필 생성
 * checklistAnswers 전달 시 체크리스트 답변도 함께 저장
 */
export function createProfile(body: CreateProfileRequest) {
  return apiClient.post<Profile>("/v1/profiles", body);
}

/** 특정 애견 프로필 조회 */
export function getProfile(profileId: number) {
  return apiClient.get<Profile>(`/v1/profiles/${profileId}`);
}

/**
 * 애견 프로필 수정
 * checklistAnswers 전달 시 기존 답변 전체 교체
 * 필드를 null로 전달하면 해당 값 초기화
 */
export function updateProfile(profileId: number, body: UpdateProfileRequest) {
  return apiClient.patch<Profile>(`/v1/profiles/${profileId}`, body);
}

/**
 * 애견 프로필 삭제
 * 최소 1개의 프로필은 유지되어야 함. 마지막 프로필 삭제 시 400 BAD_REQUEST
 */
export function deleteProfile(profileId: number) {
  return apiClient.delete<void>(`/v1/profiles/${profileId}`);
}
