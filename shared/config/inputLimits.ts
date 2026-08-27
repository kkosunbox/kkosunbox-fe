/** 사용자 계정 및 문의에 입력하는 이메일의 임시 서비스 정책 상한. */
export const EMAIL_MAX_LENGTH = 100;

/** bcrypt 등 일반적인 비밀번호 처리 정책을 고려한 입력 상한. */
export const PASSWORD_MAX_LENGTH = 72;

/** 배송지 받는분(receiverName) — 백엔드 varchar(50). */
export const DELIVERY_RECEIVER_NAME_MAX_LENGTH = 50;

/** 배송지 상세주소(addressDetail) — 백엔드 varchar(200). */
export const DELIVERY_ADDRESS_DETAIL_MAX_LENGTH = 200;

/** 배송지명(nickname) — 백엔드 varchar(200). */
export const DELIVERY_ADDRESS_NICKNAME_MAX_LENGTH = 200;

/** 반려견 특징(specialNotes) — 체크리스트·프로필관리 공용, 백엔드 varchar(200). */
export const PET_SPECIAL_NOTES_MAX_LENGTH = 200;

/** 반려견 이름(name) — 체크리스트·프로필관리 공용, 백엔드 varchar(100). */
export const PET_NAME_MAX_LENGTH = 100;

/** 반려견 품종(breed, 믹스견 커스텀 입력 포함) — 백엔드 varchar(100). */
export const PET_BREED_MAX_LENGTH = 100;

/** 탈퇴 사유 '기타' 자유 입력 — 백엔드 정책 없음, 한 줄 입력 UI 유지(길면 내부 스크롤) 기준 프론트 자체 상한. */
export const WITHDRAWAL_REASON_MAX_LENGTH = 150;
