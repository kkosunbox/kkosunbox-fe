지정한 파일(인자 없으면 현재 git 변경 파일 전체)에서 CLAUDE.md의 반응형 규칙 위반을 검사한다.

## 검사 항목

### 1. 베이스 클래스 우선 적용 버그 (Tailwind v4)
- `hidden lg:block`, `hidden md:flex`, `hidden sm:flex` 등 → `max-lg:hidden`, `max-md:hidden` 으로 교체해야 함
- `block lg:hidden` 등 반대 방향도 동일하게 체크

### 2. Text 컴포넌트 mobileVariant 방향
- `mobileVariant`는 `max-md:` 접두사로 생성되므로 `variant`(베이스)와 `mobileVariant`가 올바른 방향인지 확인
- 잘못된 예: `variant="body-13-r" mobileVariant="body-18-r"` (모바일에 더 큰 폰트)

### 3. 불필요한 이중 분기
- `max-sm:` 와 `sm:` 를 각각 따로 렌더링하는 JSX 블록이 단일 구조로 합칠 수 있는지 확인
- 동일한 내용을 `hidden max-sm:flex` / `flex max-sm:hidden` 으로 두 번 쓰는 경우

### 4. 브레이크포인트 기준 준수
- `CLAUDE.md` 기준: sm=360px, md=768px, lg=1200px, xl=1440px
- 임의 숫자 브레이크포인트(`min-[910px]`, `max-[500px]` 등) 사용 여부 — 사용 시 사유 확인

## 출력 형식

위반 항목마다:
- 파일 경로 + 라인번호
- 현재 코드 (문제 부분)
- 올바른 코드 제안
- 위반 규칙 설명
