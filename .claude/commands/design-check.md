지정한 파일(인자 없으면 현재 git 변경 파일 전체)에서 CLAUDE.md의 디자인 시스템 규칙 위반을 검사한다.

## 검사 항목

### 1. 색상 hex 직접 사용 금지
- `className`에 `text-[#...]`, `bg-[#...]`, `border-[#...]` 등
- `style={{ color: "#..." }}`, `style={{ background: "#..." }}` 등
- 예외: `text-white`, `text-black` (Tailwind 시맨틱)

### 2. CSS 변수 사용 패턴 확인
- `var(--color-...)` 형태로 사용하고 있는지
- 해당 변수가 `app/globals.css`의 `:root`에 실제로 등록되어 있는지

### 3. `@layer utilities` 내 타이포그래피 선언 금지
- `@layer utilities { .text-* { ... } }` 패턴 → `@utility text-* { ... }` 로 써야 함

### 4. `@utility`로 색상 유틸 중복 선언 금지
- `@theme inline`에 등록된 색상은 `text-{이름}` 유틸이 자동 생성됨
- `@utility text-primary { color: ... }` 처럼 중복 선언하는 경우

### 5. 임의 픽셀값으로 타이포그래피 직접 지정 금지
- `text-[18px]`, `text-[13px]` 등 임의값으로 폰트 크기를 지정하는 경우
- `text-[1.125rem]` 등 rem 단위도 동일하게 금지
- 대신 프로젝트 타이포그래피 클래스 사용: `text-body-18-r`, `text-body-13-r` 등
- `font-size`, `line-height`, `font-weight`를 style 속성으로 직접 지정하는 경우도 해당

### 6. 신규 CSS 변수 등록 누락
- `:root`에는 있는데 `@theme inline`에 없는 경우 (또는 반대)
- 변수명 불일치 (`--color-foo` vs `--color-foo-bar`)

## 출력 형식

위반 항목마다:
- 파일 경로 + 라인번호
- 현재 코드 (문제 부분)
- 올바른 코드 제안
- 위반 규칙 설명

이상 없으면 "디자인 시스템 규칙 위반 없음" 출력.
