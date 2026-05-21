# 품종 데이터 추가 TODO (2단계 · 3단계)

> 작업 파일: `shared/config/dogBreeds.ts` — `const BREEDS: DogBreedItem[]`
>
> 규칙: 배열 자체는 ㄱㄴㄷ 순으로 작성. 삽입 위치는 각 항목에 표시.
> `.sort()` 가 export 시 최종 정렬을 보장하므로 위치가 약간 어긋나도 무방.

---

## ✅ 1단계 완료 (기존 항목 수정)

| 항목 | 처리 내용 |
|---|---|
| 노르위전 엘크하운드 통합 | 그레이/블랙 → 1개로 합침 |
| 노바 스코샤 덕 톨링 리트리버 | 삭제 |
| 동경이 → 동경견 | name 변경, 동경이 alias 추가 |
| 래브라도 → 라브라도 리트리버 | name 변경, alias에 "래브라도 리트리버" |
| 브뤼셀 그리폰 | alias: 브뤼셀그리펀, 브뤼셀 그리펀 |
| 아메리칸 코커 스파니엘 | alias: 아메리칸 코카 스파니엘 |
| 아이리쉬 레드 세터 外 4종 | alias: 아이리시 버전 추가 |
| 아이리쉬소프트 코티드 휘튼 테리어 | alias: 붙여쓰기·아이리시 버전 추가 |
| 아키타 | alias: 아키다 |
| 에어데일 테리어 | alias: 에어델 테리어 |
| 오스트레일리언 셰퍼드·캐틀 독 | alias: 오스트랄리안/오스트레일리안 버전 |
| 올드 잉글리쉬 쉽독 | alias: 올드 잉글리시 쉽독 |
| 자이언트 슈나우저 | alias: 슈나우져·슈나유져 버전 |
| 저먼 스피츠 2종 삭제 | 키스혼드 / 토이 스피츠 / 포메라니언 으로 교체 |
| 코리아 진도 독 | 삭제 (진도견은 2단계에서 추가) |
| 이탈리언 사이트하운드 | alias: 이탈리안 버전 추가 |
| 잉글리쉬 세터 外 3종 | alias: 잉글리시 버전 추가 |
| 휘핏 | alias: 휘펫 |

---

## 2단계: 신규 추가 ㄱ ~ ㅁ

> 각 항목의 `englishName` 은 공식 FCI/AKC 명칭을 기준으로 작성할 것.

### ㄱ
- [ ] **그레이트 피레니즈** (원문 #1)
  - 삽입 위치: 그레이트 덴 다음
  - `{ name: "그레이트 피레니즈", englishName: "Pyrenean Mountain Dog", aliases: ["피레니언 마운틴 독"] }`
  - ⚠️ 기존 `피레니언 마운틴 독` 항목과 중복 → 둘 중 하나를 메인명으로 통일하거나 alias 처리 검토

### ㄴ
- [ ] **네오폴리탄 마스티프** (원문 #4)
  - `{ name: "네오폴리탄 마스티프", englishName: "Neapolitan Mastiff", aliases: ["나폴리탄 마스티프"] }`
- [ ] **노르포크 테리어** (원문 #5)
  - ⚠️ `노퍽 테리어` (Norfolk Terrier) 와 동일 품종의 다른 표기. 기존 `노퍽 테리어` alias에 추가하는 방향 검토
  - `{ name: "노퍽 테리어", ..., aliases: [..., "노르포크 테리어"] }` 로 수정하는 게 나을 수 있음

### ㄷ
- [ ] **도고 까나리오** (원문 #6)
  - ⚠️ 현재 `프레사 까나리오` alias에 "도고 까나리오" 가 있음 → 별도 품종으로 분리할지 alias 유지할지 확인
  - 분리 시: `{ name: "도고 까나리오", englishName: "Dogo Canario", aliases: ["프레사 까나리오"] }`

### ㄹ
- [ ] **라이카** (원문 #9)
  - 시베리안 라이카 / 웨스트 시베리언 라이카 와 겹칠 수 있음 → 포괄적 항목으로 처리 검토
  - `{ name: "라이카", englishName: "Laika", aliases: ["러시안 라이카"] }`
- [ ] **래빗 닥스훈트** (원문 #10)
  - `{ name: "래빗 닥스훈트", englishName: "Rabbit Dachshund", aliases: ["카닌헨 닥스훈트"] }`
- [ ] **랫 테리어** (원문 #11)
  - `{ name: "랫 테리어", englishName: "Rat Terrier" }`

### ㅁ
- [ ] **마리노이즈** (원문 #12)
  - `{ name: "마리노이즈", englishName: "Belgian Malinois", aliases: ["말리노이즈", "벨기에 말리노이즈", "벨지안 말리노이즈"] }`
- [ ] **말라뮤트** (원문 #13)
  - ⚠️ `알라스칸 말라뮤트` 항목이 이미 존재. 별도 추가 시 동일 품종 중복 발생
  - 권장: `알라스칸 말라뮤트` alias에 "말라뮤트" 추가
  - `{ name: "알라스칸 말라뮤트", ..., aliases: [..., "말라뮤트"] }`
- [ ] **미니어쳐 닥스훈트** (원문 #14)
  - `{ name: "미니어쳐 닥스훈트", englishName: "Miniature Dachshund", aliases: ["미니어처 닥스훈트", "미니 닥스훈트"] }`
- [ ] **미디엄 푸들** (원문 #15)
  - `{ name: "미디엄 푸들", englishName: "Medium Poodle", aliases: ["미디엄푸들"] }`
- [ ] **미텔 스피츠** (원문 #16)
  - `{ name: "미텔 스피츠", englishName: "Mittelspitz", aliases: ["미들 스피츠", "독일 스피츠 미텔"] }`
- [ ] **진도견** (원문 #59 — 코리아 진도 독 삭제 후 신규 추가)
  - 삽입 위치: ㅈ 구간이나 ㅈ→ㅊ 사이 (sort 가 처리)
  - `{ name: "진도견", englishName: "Jindo", aliases: ["진돗개", "진도개", "코리아 진도 독"] }`

---

## 3단계: 신규 추가 ㅂ ~ ㅎ

### ㅂ
- [ ] **벨기에 그로넨달** (원문 #17)
  - `{ name: "벨기에 그로넨달", englishName: "Groenendael", aliases: ["그로넨달", "벨지안 그로넨달"] }`
- [ ] **벨기에 쉽독** (원문 #18)
  - `{ name: "벨기에 쉽독", englishName: "Belgian Sheepdog", aliases: ["벨지안 쉽독"] }`
  - ⚠️ `벨지안 셰퍼드 독` 과 중복 여부 확인 (그로넨달 품종의 다른 이름일 수 있음)
- [ ] **벨기에 테뷰런** (원문 #19)
  - `{ name: "벨기에 테뷰런", englishName: "Tervuren", aliases: ["테뷰런", "벨지안 테뷰런"] }`
- [ ] **볼로네즈** (원문 #20)
  - `{ name: "볼로네즈", englishName: "Bolognese", aliases: ["볼로그나"] }`
- [ ] **블랙 테리어** (원문 #22)
  - `{ name: "블랙 테리어", englishName: "Black Russian Terrier", aliases: ["러시안 블랙 테리어", "블랙 러시안 테리어"] }`

### ㅅ
- [ ] **샤페이** (원문 #23)
  - `{ name: "샤페이", englishName: "Shar Pei", aliases: ["차이니즈 샤페이"] }`
- [ ] **센트럴 아시안 오브차카** (원문 #24)
  - `{ name: "센트럴 아시안 오브차카", englishName: "Central Asian Shepherd Dog", aliases: ["중앙아시안 오브차카"] }`
- [ ] **셰퍼드** (원문 #25)
  - ⚠️ 포괄적 명칭. `저먼 셰퍼드 독` alias 에 추가하거나 독립 항목으로 추가 검토
  - `{ name: "셰퍼드", englishName: "Shepherd", aliases: ["독일 셰퍼드"] }`
- [ ] **소프트 코티드 휘튼 테리어** (원문 #26)
  - `{ name: "소프트 코티드 휘튼 테리어", englishName: "Soft Coated Wheaten Terrier" }`
- [ ] **슈나우져** (원문 #27)
  - ⚠️ 미니어쳐/스탠다드/자이언트 슈나우저 가 이미 있음. 포괄 alias 또는 별도 항목 검토
  - `{ name: "슈나우저", englishName: "Schnauzer", aliases: ["슈나우져"] }`
- [ ] **스코티쉬 디어하운드** (원문 #28)
  - `{ name: "스코티쉬 디어하운드", englishName: "Scottish Deerhound", aliases: ["스코티시 디어하운드"] }`
- [ ] **스태포드셔 불 테리어** (원문 #29, "스테포드 셔불테리어")
  - `{ name: "스태포드셔 불 테리어", englishName: "Staffordshire Bull Terrier", aliases: ["스태퍼드셔 불테리어", "스테포드 셔불테리어"] }`
- [ ] **스피츠** (원문 #30)
  - `{ name: "스피츠", englishName: "Spitz" }`
- [ ] **시베리안 라이카** (원문 #31)
  - `{ name: "시베리안 라이카", englishName: "Siberian Laika", aliases: ["시베리안라이카"] }`
- [ ] **시잉프랑세즈** (원문 #32)
  - ⚠️ 정확한 품종 불명. "Chien Français" (프랑스 하운드) 계열로 추정
  - `{ name: "시앙 프랑세즈", englishName: "Chien Français", aliases: ["시잉프랑세즈"] }` — 확인 필요
- [ ] **실리햄 테리어** (원문 #33)
  - `{ name: "실리햄 테리어", englishName: "Sealyham Terrier", aliases: ["씰리햄 테리어"] }`
- [ ] **실키 테리어** (원문 #34)
  - `{ name: "실키 테리어", englishName: "Silky Terrier", aliases: ["실키테리어", "오스트레일리언 실키 테리어"] }`

### ㅇ
- [ ] **아나톨리안 셰퍼드** (원문 #35)
  - `{ name: "아나톨리안 셰퍼드", englishName: "Anatolian Shepherd Dog", aliases: ["캉갈"] }`
- [ ] **아메리칸 불독** (원문 #36)
  - `{ name: "아메리칸 불독", englishName: "American Bulldog" }`
- [ ] **아메리칸 에스키모** (원문 #37)
  - `{ name: "아메리칸 에스키모", englishName: "American Eskimo Dog", aliases: ["아메리칸 에스키모 독"] }`
- [ ] **아메리칸 핏불 테리어** (원문 #39)
  - `{ name: "아메리칸 핏불 테리어", englishName: "American Pit Bull Terrier", aliases: ["핏불 테리어", "핏불테리어"] }`
- [ ] **아메리칸 불리** (원문 #40)
  - `{ name: "아메리칸 불리", englishName: "American Bully", aliases: ["아메리칸불리"] }`
- [ ] **아이리쉬 세터** (원문 #41)
  - ⚠️ `아이리쉬 레드 세터` 와 동일 품종. alias 추가 vs 별도 항목 검토
  - `{ name: "아이리쉬 세터", englishName: "Irish Setter", aliases: ["아이리시 세터"] }`
- [ ] **오브차카** (원문 #46)
  - `{ name: "오브차카", englishName: "Caucasian Shepherd Dog", aliases: ["코카시안 오브차카"] }`
- [ ] **올드 잉글리쉬 불독** (원문 #48)
  - `{ name: "올드 잉글리쉬 불독", englishName: "Olde English Bulldogge", aliases: ["올드 잉글리시 불독"] }`
- [ ] **울프독** (원문 #49)
  - `{ name: "울프독", englishName: "Wolfdog", aliases: ["체코슬로바키안 울프독"] }`
  - ⚠️ 기존 `체코슬로바키안 울프독` 과 중복 가능성 확인
- [ ] **웨스트 시베리언 라이카** (원문 #50)
  - `{ name: "웨스트 시베리언 라이카", englishName: "West Siberian Laika" }`
- [ ] **웰시 테리어** (원문 #51)
  - `{ name: "웰시 테리어", englishName: "Welsh Terrier" }`
- [ ] **이탈리안 그레이하운드** (원문 #52)
  - ⚠️ `이탈리언 사이트하운드` 에 alias "이탈리안 그레이하운드" 가 이미 추가됨 (1단계)
  - 별도 항목 필요 여부 확인

### ㅈ
- [ ] **재패니즈 스피츠** (원문 #54)
  - ⚠️ 현재 `일본 스피츠` alias 에 "재패니즈 스피츠" 가 있음 → 별도 품종화 시 일본 스피츠 alias 에서 제거 검토
  - `{ name: "재패니즈 스피츠", englishName: "Japanese Spitz" }`
- [ ] **저먼 포인터** (원문 #56)
  - ⚠️ `저먼 숏 헤어드 포인팅 독` / `저먼 와이어 헤어드 포인팅 독` 이 이미 있음
  - `{ name: "저먼 포인터", englishName: "German Pointer", aliases: ["독일 포인터"] }` 또는 기존 항목 alias 추가 검토
- [ ] **제주개** (원문 #57)
  - `{ name: "제주개", englishName: "Jeju Dog" }`
- [ ] **제패니즈 칭** (원문 #58, "제패니즈칭")
  - `{ name: "제패니즈 칭", englishName: "Japanese Chin", aliases: ["재패니즈 칭", "재패니즈칭", "일본 스패니얼"] }`
- [ ] **진도견** (원문 #59) — **2단계 ㅈ 구간에 포함**

### ㅋ
- [ ] **카렐리안 베어독** (원문 #60, "카레리안 베어독")
  - `{ name: "카렐리안 베어독", englishName: "Karelian Bear Dog", aliases: ["카레리안 베어독"] }`
- [ ] **케니스펜더** (원문 #61)
  - ⚠️ 정확한 품종 불명. 확인 필요 (Cane Spinone? Kerry Spaniel?)
- [ ] **코카 스파니엘** (원문 #62)
  - `{ name: "코카 스파니엘", englishName: "Cocker Spaniel", aliases: ["코커 스파니엘"] }`
- [ ] **코카시안 오브차카** (원문 #63)
  - `{ name: "코카시안 오브차카", englishName: "Caucasian Shepherd Dog", aliases: ["코카시안오브차카", "카프카스 목양견"] }`
  - ⚠️ `오브차카` 항목과 중복 가능성 → 통합 검토
- [ ] **콜리** (원문 #64)
  - ⚠️ `러프 콜리` / `스무스 콜리` 가 이미 있음. 포괄 alias 또는 별도 항목 검토
  - `{ name: "콜리", englishName: "Collie" }`
- [ ] **클라인 스피츠** (원문 #65)
  - `{ name: "클라인 스피츠", englishName: "Kleinspitz", aliases: ["클라인스피츠", "저먼 스피츠 클라인"] }`
- [ ] **키스혼드** — 1단계에서 저먼 스피츠 교체로 이미 추가됨 ✅ (원문 #66 해소)

### ㅌ
- [ ] **토이 맨체스터 테리어** (원문 #67, "토이 멘체스터 테리어")
  - `{ name: "토이 맨체스터 테리어", englishName: "Toy Manchester Terrier", aliases: ["토이 멘체스터 테리어"] }`
- [ ] **티베탄 마스티프** (원문 #68)
  - `{ name: "티베탄 마스티프", englishName: "Tibetan Mastiff", aliases: ["티베트 마스티프"] }`
- [ ] **티베탄 스패니얼** (원문 #69)
  - `{ name: "티베탄 스패니얼", englishName: "Tibetan Spaniel", aliases: ["티베트 스패니얼"] }`

### ㅍ
- [ ] **팔렌** (원문 #70)
  - `{ name: "팔렌", englishName: "Phalène", aliases: ["파피용 귀"] }`
  - ⚠️ 빠삐용(Papillon)의 귀 내려간 변종. 별도 품종화 필요 여부 확인
- [ ] **패터데일 테리어** (원문 #71, "페더데일테리어")
  - `{ name: "패터데일 테리어", englishName: "Patterdale Terrier", aliases: ["페더데일 테리어", "페더데일테리어"] }`
- [ ] **포인터** (원문 #72)
  - `{ name: "포인터", englishName: "Pointer", aliases: ["잉글리쉬 포인터"] }`
  - ⚠️ `잉글리쉬 포인터` 와 중복 가능성 확인
- [ ] **폭스 테리어** (원문 #73)
  - `{ name: "폭스 테리어", englishName: "Fox Terrier", aliases: ["폭스테리어"] }`
- [ ] **폼피츠** (원문 #74)
  - `{ name: "폼피츠", englishName: "Pomsky", aliases: ["포메라니언 허스키 믹스"] }`
  - ⚠️ 믹스견 범주 해당 여부 확인
- [ ] **푸들** (원문 #75)
  - `{ name: "푸들", englishName: "Poodle", aliases: ["스탠다드 푸들"] }`
  - ⚠️ 토이/미니어쳐/스탠다드 푸들이 이미 별도 항목으로 존재 — 포괄 항목으로 추가
- [ ] **프렌치 브리타니** (원문 #76)
  - `{ name: "프렌치 브리타니", englishName: "French Brittany Spaniel" }`
  - ⚠️ `브리타니 스파니엘` 과 동일/유사 품종 가능성 확인
- [ ] **플롯 하운드** (원문 #77)
  - `{ name: "플롯 하운드", englishName: "Plott Hound" }`
- [ ] **필라 브라질레이로** (원문 #78, "필라 브라질레오")
  - `{ name: "필라 브라질레이로", englishName: "Fila Brasileiro", aliases: ["필라 브라질레오"] }`
- [ ] **핏불 테리어** (원문 #79)
  - ⚠️ `아메리칸 핏불 테리어` 와 중복 가능성 → alias 처리 검토
  - `{ name: "핏불 테리어", englishName: "Pit Bull Terrier", aliases: ["핏불테리어"] }`

### ㅎ
- [ ] **허배너스** (원문 #80, Havanese)
  - `{ name: "허배너스", englishName: "Havanese", aliases: ["하바네즈", "하바나이즈"] }`
- [ ] **화이트 리트리버** (원문 #81)
  - ⚠️ 공식 품종 아님. 화이트 골든 리트리버(골든 리트리버 색상 변종) 가능성 → alias 처리 검토
  - `{ name: "화이트 리트리버", englishName: "White Golden Retriever", aliases: ["화이트리트리버"] }`
- [ ] **화이트 테리어** (원문 #82)
  - ⚠️ `웨스트 하이랜드 화이트 테리어` (웨스티) alias 에 추가하는 방향 검토
  - `{ name: "웨스트 하이랜드 화이트 테리어", ..., aliases: [..., "화이트 테리어", "화이트테리어"] }`

---

## 작업 시 주의사항

- ⚠️ 표시된 항목은 중복·모호성 검토 후 처리
- 새 항목은 ㄱㄴㄷ 위치에 삽입하되 `sort()` 가 최종 보정함
- `englishName` 은 FCI/AKC 공식 명칭 우선
- alias 는 흔히 검색되는 오기·다른 표기 위주로 간결하게 유지
