# GA4 향상된 측정(Enhanced Measurement) 활성화 가이드

> 코드 변경 없이 GA4 콘솔에서만 설정하면 됩니다.
> `NEXT_PUBLIC_GA_ID` 환경변수를 세팅할 때 함께 진행하세요.

---

## 활성화 경로

1. [Google Analytics](https://analytics.google.com/) 접속
2. 좌측 하단 **관리(톱니바퀴 아이콘)** 클릭
3. **속성** 열 → **데이터 스트림** 클릭
4. 웹 스트림(ggosoonbox.com) 클릭
5. **향상된 측정** 섹션의 토글을 **ON**으로 변경

---

## 자동 추적되는 항목

| 이벤트명 | 발화 조건 |
|---|---|
| `scroll` | 페이지를 75% 이상 스크롤했을 때 |
| `click` | 외부 링크(아웃바운드) 클릭 시 |
| `view_search_results` | 사이트 내 검색 결과 페이지 진입 시 |
| `video_start` / `video_progress` / `video_complete` | 유튜브 동영상 재생 시 |
| `file_download` | PDF, 이미지 등 파일 다운로드 링크 클릭 시 |

> 현재 서비스 기준으로는 **scroll(스크롤 깊이)**과 **click(외부 링크)**이 주로 수집됩니다.

---

## 이후 단계 (광고 집행 시)

광고를 집행할 때 GA4 콘솔에서 `purchase` 이벤트를 **전환 목표**로 등록하면 구글 광고와 연동됩니다.

**경로:** 관리 → 이벤트 → `purchase` 이벤트 옆 "전환으로 표시" 토글 ON

이 설정도 코드 작업 없이 콘솔에서만 처리합니다.
