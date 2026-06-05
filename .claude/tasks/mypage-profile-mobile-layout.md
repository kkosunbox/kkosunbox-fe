# 태스크: 마이페이지 모바일 프로필 영역 정보 배치 변경

## 목적

모바일 프로필 영역의 정보 배치를 재구성한다.  
현재는 화면 크기(초소형/일반)에 따라 분기되는 복잡한 구조인데,  
단일 레이아웃으로 단순화하면서 배치 순서를 바꾼다.

---

## 변경 전 / 변경 후

| 줄 | 변경 전 | 변경 후 |
|---|---|---|
| 1 | 이름 + 전환버튼 + MY포인트 + **견종(sm 이상)** | 이름 + 전환버튼 + MY포인트 |
| 2 | 생일 \| 성별 \| 몸무게 (sm 이상) / 견종 \| 생일 (max-sm) | **품종 \| 생일** |
| 3 | 성별 \| 몸무게 (max-sm만) | **성별 \| 몸무게** |
| 4 | 특징 | 특징 |

---

## 대상 파일

`widgets/mypage/ui/ProfileSection.tsx` — `ProfileSectionMobile` 함수 (line 294–447)

---

## 구체적인 변경 사항

### 1. 1번째 줄에서 견종 제거

현재 `ProfileSectionMobile` 1번째 줄(line 332~352)에서  
`sm 이상에서만` 견종을 인라인으로 표시하는 블록을 **제거**한다.

```tsx
// ❌ 제거 대상 (line 344~352)
{vm.hasProfile && (
  <Text
    variant="body-16-m"
    mobileVariant="body-13-r"
    className={[breedMetaClass, "max-sm:hidden"].join(" ")}
  >
    {vm.breedDisplay}
  </Text>
)}
```

### 2. hasProfile === true 시 메타 정보 줄 재구성

현재 초소형/일반을 이중으로 분기하는 구조(line 355~390)를  
모든 화면 크기에서 동일한 단일 구조로 교체한다.

```tsx
// ✅ 변경 후 (초소형·일반 구분 없이 동일)
<>
  {/* 2줄: 품종 | 생일 */}
  <div className="flex min-w-0 items-center gap-1">
    <Text variant="body-16-m" mobileVariant="body-13-r" className={breedMetaClass}>
      {vm.breedDisplay}
    </Text>
    <ProfileMetaDivider />
    <Text variant="body-16-m" mobileVariant="body-13-r" className={birthMetaClass}>
      {vm.birthEmpty ? "생년월일" : vm.birth}
    </Text>
  </div>
  {/* 3줄: 성별 | 몸무게 */}
  <div className="flex min-w-0 items-center gap-1">
    <Text variant="body-16-m" mobileVariant="body-13-r" className={genderMetaClass}>
      {vm.genderEmpty ? "성별" : vm.gender}
    </Text>
    <ProfileMetaDivider />
    <Text variant="body-16-m" mobileVariant="body-13-r" className={weightMetaClass}>
      {vm.weightEmpty ? "몸무게" : vm.weight}
    </Text>
  </div>
</>
```

### 3. hasProfile === false 시 플레이스홀더 줄도 동일하게 재구성

현재 line 393~425의 이중 분기를 단일 구조로 교체한다.

```tsx
// ✅ 변경 후
<>
  {/* 2줄: 견종 | 생년월일 */}
  <div className="flex min-w-0 items-center gap-1 text-[var(--color-text-placeholder)]">
    <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
      견종
    </Text>
    <ProfileMetaDivider />
    <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
      생년월일
    </Text>
  </div>
  {/* 3줄: 성별 | 몸무게 */}
  <div className="flex min-w-0 items-center gap-1 text-[var(--color-text-placeholder)]">
    <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
      성별
    </Text>
    <ProfileMetaDivider />
    <Text variant="body-16-m" mobileVariant="body-13-r" className="leading-[140%]">
      몸무게
    </Text>
  </div>
</>
```

---

## 주의 사항

- **데스크탑(`ProfileSectionDesktop`)은 변경하지 않는다.**  
  `lg:hidden` / `hidden lg:flex`로 이미 완전히 분리되어 있어 영향 없음.
- `max-sm:hidden`, `hidden max-sm:flex` 같은 초소형 분기 클래스가 제거되면서 코드가 단순해진다.
- 기존 `breedMetaClass`, `birthMetaClass`, `genderMetaClass`, `weightMetaClass` 변수는 그대로 재사용한다.

---

## 검증

작업 완료 후 반드시 수행:

1. `pnpm build` — 타입 에러 없음 확인
2. `pnpm lint` — ESLint 에러 없음 확인
3. 브라우저에서 `/mypage` 접속 후 확인:
   - 모바일(360px 이상): 4줄 배치 확인
   - 초소형(360px 미만): 동일하게 4줄 배치 확인
   - 데스크탑(1200px 이상): 기존 레이아웃 유지 확인
