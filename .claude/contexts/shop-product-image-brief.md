# 꼬순박스 단일 상품 이미지 생성 브리프

`/shop`(간식 스토어)의 단품 상품 카드에 쓸 이미지 8종을 외부 이미지 생성 모델로 제작하기 위한 브리프.
현재는 `widgets/shop/ui/ShopProductArt.tsx`의 라인아트 placeholder가 그 자리를 채우고 있으며, 이 문서로 만든 이미지가 그것을 대체한다.

---

## 1. 브랜드 소개 (생성 모델에 전달할 맥락)

**꼬순박스(Ggosoonbox)** — 반려견용 프리미엄 수제 간식 정기구독 서비스.

- **핵심 가치**: 100% 국내산 · 휴먼그레이드(사람이 먹을 수 있는 등급) 재료 · 대량 생산이 아닌 소량 수제
- **브랜드 카피**: "먹는 순간 표정이 달라지는 휴먼그레이드 수제 간식 구독", "정성 가득 수제간식 — 대량 생산이 아닌, 직접 만든 간식만 담습니다"
- **톤 & 무드**: 따뜻함, 정직함, 담백함. 공장 제품이 아니라 **주방에서 갓 만든 것**처럼 보여야 한다. 과장된 광택·화려한 연출·자극적인 색 보정은 브랜드와 어긋난다.
- **주력 상품**: 월 정기배송 박스(베이직 / 스탠다드 / 프리미엄). `/shop`은 그 박스에 들어가는 간식을 **낱개로 파는** 서브 채널이다.

> 스토어 카피: "꼬순박스 속 그 간식, 낱개로 만나보세요 — 구독 박스에 담기는 수제간식을 필요한 만큼만 구매할 수 있어요."

---

## 2. 이미지의 사용 맥락

| 항목 | 값 |
|---|---|
| 용도 | 웹 스토어 상품 카드 썸네일 + 주문서 상품 정보 썸네일 |
| 비율 | **1:1 정사각 고정** (`aspect-square`) |
| 최대 렌더 크기 | 데스크탑 그리드 4열 기준 **약 235px** (2x DPR → 470px) |
| 주문서 렌더 크기 | 약 117×117px |
| 모서리 | 코드에서 `border-radius: 20px`로 잘라냄 → **이미지 자체는 직각 정사각**으로 제작 |
| 배지 오버레이 | 일부 상품은 **좌상단**에 "베스트"/"프리미엄" 알약형 배지가 얹힘 |

**제작 시사점 두 가지:**

1. **좌상단 약 25% 영역은 비워둘 것.** 배지가 그 위에 올라간다. 피사체의 핵심 디테일이 거기 오면 안 된다.
2. **모서리 4곳에 중요한 요소를 두지 말 것.** 20px 라운딩으로 잘려나간다.

---

## 3. 공통 촬영 레시피 (8장 전부 동일 — 가장 중요)

상품 8개가 같은 그리드에 나란히 놓이므로, **한 세트로 보이는 일관성이 개별 이미지의 완성도보다 중요하다.** 아래 항목은 8장 내내 고정한다.

| 항목 | 고정값 |
|---|---|
| 배경 | 단색 웜 크림 **`#FFF8F2`** — 그라디언트·질감·소품 없음 (코드의 `--color-surface-warm`과 동일) |
| 표면 | 배경과 이어지는 무한 배경(seamless), 바닥선 보이지 않음 |
| 카메라 각도 | 위에서 약 **35도 내려다본 3/4 앵글** (완전 탑다운 아님, 완전 정면 아님) |
| 렌즈감 | 50mm 상당, 왜곡 없음 |
| 피사계심도 | 얕게 — 피사체 전체는 선명, 뒤쪽 가장자리만 살짝 풀림 |
| 조명 | **좌측 상단 45도**에서 들어오는 부드러운 자연광 창광, 우측에 약한 반사판 |
| 그림자 | 피사체 우하단에 **아주 옅고 부드러운** 접지 그림자. 진하거나 긴 그림자 금지 |
| 프레이밍 | 피사체가 정사각 프레임의 **약 60~65%**를 차지, 사방에 여백 |
| 피사체 위치 | 프레임 **중앙에서 살짝 우하단** 쪽으로 (좌상단 배지 자리 확보) |
| 색감 | 자연스러운 화이트밸런스, 채도 과장 없음. 따뜻하되 누렇지 않게 |
| 스타일 | 사진처럼 사실적인 스튜디오 제품 사진 (일러스트·3D 렌더 느낌 금지) |

### 브랜드 컬러 (참고용 — 이미지에 강제로 넣지 말 것)

| 토큰 | HEX | 성격 |
|---|---|---|
| `--color-surface-warm` | `#FFF8F2` | **배경으로 사용** |
| `--color-primary` | `#C97A3D` | Corgi Brown — 브랜드 메인 |
| `--color-secondary` | `#F6E9DD` | Warm Beige |
| `--color-beige` | `#E8CFB9` | Beige — 장식 |
| `--color-accent-orange` | `#EE681A` | Warm Orange |

배경은 반드시 `#FFF8F2`. 나머지는 "이 팔레트와 충돌하지 않는 톤"이라는 뜻이지, 이미지에 칠하라는 뜻이 아니다.

---

## 4. 상품 리스트업 (8종)

번호는 이미지 제작 순서. 코드상 정의는 `entities/product/lib/shopProducts.ts`.

| # | id | 상품명 | 카테고리 | 중량 | 가격 | 배지 | 피사체 묘사 |
|---|---|---|---|---|---|---|---|
| **1** | `yogurt-ball` | 닭가슴살 요거트볼 | 간식 | 60g | 8,900원 | 베스트 | 한 입 크기 구슬형. 국내산 닭가슴살 속을 흰 수제 요거트로 코팅. 5~7알을 낮게 쌓고, 1~2알은 코팅이 갈라져 안쪽 결이 보이게 |
| 2 | `churu` | 촉촉 츄르 | 간식 | 15g × 4개입 | 6,900원 | — | 짜먹는 스틱형 파우치 4개. 무지 크래프트 톤 파우치를 가지런히 겹쳐 놓고, 하나는 끝을 뜯어 크리미한 내용물이 살짝 나오게 |
| 3 | `seaweed-chip-chicken` | 미역칩 꼬꼬 | 간식 | 40g | 7,900원 | — | 닭고기+미역을 바삭하게 구운 얇은 칩. 불규칙한 가장자리, 짙은 녹갈색 미역 조각이 박힌 결. 5~6장을 겹쳐 흩뿌리듯 |
| 4 | `seaweed-chip-pork` | 미역칩 꿀꿀 | 간식 | 40g | 7,900원 | — | 3번과 동일 형태·동일 배치. 돼지고기 기반이라 **더 붉고 진한 갈색**으로만 구분 (같은 제품군임이 보이게) |
| 5 | `beef-gum` | 소고기껌 | 껌 | 70g | 9,900원 | 베스트 | 100% 소고기를 말아 만든 길쭉한 막대형 껌. 표면에 꼬임 결. 3~4개를 살짝 어긋나게 겹쳐 |
| 6 | `milk-gum` | 우유껌 | 껌 | 50g | 5,900원 | — | 5번과 같은 막대형이나 **아이보리색·표면이 더 매끈하고 부드러운** 인상. 치아 약한 아이용이라는 게 질감으로 읽히게 |
| 7 | `kkokko-riceball` | 꼬꼬주먹밥 | 간식 | 80g | 8,500원 | — | 닭고기+잘게 썬 야채를 뭉친 한 입 볼. 표면에 당근·시금치 조각이 콕콕 박힌 러프한 질감. 4~5알 |
| 8 | `homemade-meal` | 수제 화식 | 화식 | 150g | 12,900원 | 프리미엄 | 갓 지은 프리미엄 식사 한 그릇. 흰 세라믹 볼에 닭고기·현미·삶은 야채가 층으로 보이게. **유일하게 그릇에 담긴 컷** |

**세트 내 짝 관계 (반드시 지킬 것):**
- 3번과 4번은 같은 제품군의 맛 차이 → **형태·배치는 동일, 색만 다르게**
- 5번과 6번은 같은 껌 카테고리 → **형태는 유사, 색·질감으로 구분**
- 8번만 그릇에 담긴다. 나머지 7종은 배경 위에 직접 놓인다.

---

## 5. 금지 사항 (8장 공통 네거티브)

- 텍스트, 로고, 워터마크, 포장 라벨의 글자 (상품명은 코드가 따로 렌더한다)
- 사람, 손, 강아지 — **제품만 단독으로**
- 소품(그릇 제외), 식탁보, 나뭇잎, 흩뿌린 가루 등 연출용 장식
- 배경 그라디언트, 비네팅, 나무 도마, 대리석 등 질감 있는 표면
- 강한 그림자, 하드 라이트, 스포트라이트
- 과채도·HDR·인공적인 광택
- 일러스트, 카툰, 3D 렌더, CG 느낌
- 사람 음식으로 보이는 연출 (초콜릿·설탕 글레이즈 등 반려견에게 유해한 재료 연상)

---

## 6. 산출 규격

- **마스터**: 1600×1600 PNG (무손실)
- **저장 위치**: `entities/product/assets/shop-{id}.webp` (예: `shop-yogurt-ball.webp`)
  - `entities/package/assets/`가 같은 방식이라 이 컨벤션을 따른다
- **변환**: 마스터를 받은 뒤 `/webp-convert` 스킬로 webp 변환 + 코드 참조 경로 수정
- **화질 원칙**: 렌더 화질은 불가침. 표시 크기(2x 기준 470px)를 감안해 잉여 픽셀만 줄이고, 눈에 보이는 화질은 손대지 않는다

---

## 7. 1번 이미지 프롬프트 (닭가슴살 요거트볼)

아래 블록을 이미지 생성 모델에 그대로 붙여넣는다. 영문인 이유는 대부분의 이미지 모델이 영문 프롬프트에서 더 정확하기 때문.

```
Photorealistic studio product photograph of Korean-style handmade dog treats:
bite-sized chicken breast balls coated in white homemade yogurt.

SUBJECT: 6 spherical bite-sized treats, each about 2cm across, coated in a
matte white yogurt shell with a natural, slightly uneven handmade surface —
not a glossy factory glaze. Arranged in a low, loose cluster resting directly
on the background surface. One or two balls have a cracked or partially
uncoated shell revealing the pale, fibrous shredded chicken breast inside,
so the viewer can tell what it is made of. Wholesome, freshly made, small-batch
kitchen quality.

BACKGROUND: seamless solid warm cream background, exact color #FFF8F2.
No gradient, no texture, no surface line, no props, no tablecloth.

CAMERA: 50mm lens, three-quarter view from approximately 35 degrees above the
subject — not a flat top-down, not a straight-on side view. No lens distortion.
Shallow depth of field: the cluster is sharp, only the rearmost edge falls
softly out of focus.

LIGHTING: soft diffused natural window light from the upper left at 45 degrees,
gentle fill from the right. A very soft, short contact shadow to the lower right
of the cluster. No hard shadows, no spotlight, no dramatic contrast.

COMPOSITION: square 1:1 frame. The cluster occupies roughly 60-65% of the frame,
positioned slightly right of center and slightly below center, leaving the upper
left quadrant clean and empty. Generous negative space on all sides. Nothing
important near the four corners.

COLOR: natural white balance, warm but not yellow. Accurate, unsaturated,
true-to-life color. No HDR, no color grading.

STYLE: clean, honest, editorial food photography for a premium handmade pet
treat brand. Appetizing but restrained.

NEGATIVE: no text, no letters, no logo, no watermark, no packaging, no labels,
no human, no hands, no dog, no bowl, no plate, no utensils, no props, no
scattered crumbs or powder, no leaves, no wooden board, no marble, no fabric,
no background gradient, no vignette, no hard shadow, no glossy artificial
shine, no oversaturation, no HDR, no illustration, no cartoon, no 3D render,
no CGI, no chocolate, no sugar glaze.

OUTPUT: 1600x1600, square.
```

### 결과 확인 체크리스트

받은 이미지를 아래로 검수한다. 하나라도 어긋나면 8장 세트의 일관성이 깨진다.

- [ ] 배경이 `#FFF8F2` 단색인가 (스포이드로 확인)
- [ ] 좌상단이 비어 있어 배지를 얹을 수 있는가
- [ ] 그림자가 우하단에 옅게만 있는가
- [ ] 피사체가 프레임의 60~65%인가 (너무 크면 카드에서 답답해 보임)
- [ ] 글자·로고가 없는가
- [ ] 사람 간식이 아니라 반려견 간식으로 읽히는가
- [ ] 235px로 축소했을 때도 "요거트볼"로 식별되는가 ← **가장 중요**

마지막 항목이 핵심이다. 실제 표시 크기가 작으므로, 100%에서 아무리 훌륭해도 축소했을 때 뭉개지면 쓸 수 없다. 반드시 축소해서 확인할 것.

### 2~8번 진행 방법

1번이 통과하면 그 이미지를 **레퍼런스로 첨부**하고, 위 프롬프트에서 `SUBJECT:` 블록만 §4 표의 "피사체 묘사"로 교체한다. 나머지 블록(BACKGROUND / CAMERA / LIGHTING / COMPOSITION / COLOR / STYLE / NEGATIVE)은 **한 글자도 바꾸지 않는다.** 그래야 8장이 한 세트로 보인다.

3↔4번, 5↔6번은 짝끼리 연속으로 생성해 색·질감 차이만 남기고 나머지를 맞춘다.
