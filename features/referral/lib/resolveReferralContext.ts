import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { getAuthUser, getServerToken } from "@/features/auth/lib/session";
import { probeSubscriptionHistory } from "@/features/subscription/api/queries";
import { fetchMyReferralCode, fetchReferralPage, fetchReferralValidation } from "../api/queries";
import { INVITE_CODE_COOKIE, INVITE_SLUG_COOKIE, isValidInviteCode } from "./inviteCodeCookie";
import { INERT_REFERRAL_CONTEXT, type ReferralContext } from "./referralContext";

/**
 * 초대코드(레퍼럴) 상태의 **단일 진실 공급원**.
 *
 * 이전에는 `app/(main)/layout.tsx`·`app/(main)/r/[slug]/page.tsx`·`app/(main)/order/page.tsx`,
 * 그리고 `ReferralProvider`의 클라이언트 자기감지까지 **네 곳이 각자** 구독 이력을 조회해
 * 적격 여부를 계산했다. 같은 요청 안에서도 답이 갈려 `/r/{slug}`는 24,565원,
 * `/subscribe`·`/order`는 28,900원을 보여주는 사고가 났다(2026-08-12).
 *
 * 서버가 확정하는 값과 프론트가 유도하는 값을 분리한다.
 *   - **서버(여기)**: 초대코드·slug·할인율·적격 여부
 *   - **프론트**: 위 값으로부터 표시 단가 (`features/referral/lib/referralPricing.ts`)
 */

/**
 * 요청의 초대 상태를 확정한다.
 *
 * @param landingSlug `/r/{slug}` 랜딩에서만 전달 — 쿠키보다 우선한다(방금 그 링크로 들어왔으므로).
 *
 * 적격 판정은 **fail-closed**다. 구독 이력을 확인하지 못하면(`null`) 할인을 적용하지 않는다.
 * 받을 수 없는 가격을 보여주고 결제 시점에 더 청구하는 쪽이, 받을 수 있는 할인을 잠시 못 보는
 * 쪽보다 훨씬 나쁘기 때문이다.
 */
export const resolveReferralContext = cache(
  async (landingSlug?: string): Promise<ReferralContext> => {
    // 우선순위: 방금 들어온 랜딩 → 랜딩으로 심어둔 slug 쿠키 → `?r=CODE`로 심어둔 코드 쿠키 →
    // 로그인 유저 본인이 인플루언서인 경우. 캡처된 초대가 자기 링크보다 앞선다.
    const slug = landingSlug ?? (await readSlugFromCookie());
    const code = slug ? null : await readCodeFromCookie();
    const ownSlug = slug || code ? null : await detectOwnSlug();

    // 초대 맥락이 전혀 없으면 여기서 끝낸다. 이 함수는 `(main)` layout에서 **모든 페이지**마다
    // 도는데, 아무 관련 없는 요청까지 구독 이력을 조회하면 렌더를 막는 왕복이 그대로 늘어난다.
    // (실제로 그렇게 만들었다가 이미지가 많은 상세 페이지의 시각회귀가 불안정해졌다.)
    if (!slug && !code && !ownSlug) return INERT_REFERRAL_CONTEXT;

    const token = await getServerToken();
    // 판정 불가(null)도 부적격으로 본다 — 위 fail-closed 설명 참고.
    const firstSubscriptionEligible = (await probeSubscriptionHistory(token)) === false;
    const base = { ...INERT_REFERRAL_CONTEXT, firstSubscriptionEligible };

    const resolvedSlug = slug ?? ownSlug;
    if (resolvedSlug) return fromSlug(resolvedSlug, base);

    // slug 없이 코드만 있는 경로(`?r=CODE`). 할인율·적용 가능 여부를 서버가 판정한다.
    //
    // 코드가 무효(400 → null)여도 `isReferral`은 유지한다. 캡처된 코드를 서버가 조용히
    // 버리면 초대 링크로 들어온 사용자에게 "왜 할인이 안 붙는지" 알릴 방법이 사라진다.
    // 주문서는 이 코드를 잠긴 입력으로 보여주고, 재검증 실패 메시지와 삭제 버튼으로 안내한다.
    const validation = await fetchReferralValidation(code!, token);
    return {
      ...base,
      refCode: code!,
      discountRate: validation?.discountRate ?? 0,
      isReferral: true,
      inviteEligible: firstSubscriptionEligible && (validation?.isApplicable ?? false),
    };
  },
);

/**
 * 주문서 전용 — 초대 맥락이 없어도 "이 계정이 초대코드를 쓸 수 있는지"까지 확정한다.
 * 주문서는 코드가 없는 사용자에게 입력칸을 열어줄지 판단해야 하는 유일한 화면이다.
 * 조회는 `probeSubscriptionHistory`(요청 단위 캐시)를 공유하므로 중복 호출이 되지 않는다.
 */
export const resolveOrderReferralContext = cache(async (): Promise<ReferralContext> => {
  const context = await resolveReferralContext();
  if (context.isReferral) return context;
  const token = await getServerToken();
  return {
    ...context,
    firstSubscriptionEligible: (await probeSubscriptionHistory(token)) === false,
  };
});

async function fromSlug(slug: string, base: ReferralContext): Promise<ReferralContext> {
  const page = await fetchReferralPage(slug);
  if (!page || !page.isActive) return base;
  return {
    ...base,
    // 쿠키에 담긴 코드가 이 slug의 코드와 다를 수 있으므로 페이지 응답을 신뢰한다.
    refCode: page.referralCode,
    slug,
    discountRate: page.discountRate,
    influencerName: page.displayName,
    profileImageUrl: page.profileImageUrl,
    isReferral: true,
    inviteEligible: base.firstSubscriptionEligible,
  };
}

async function readCodeFromCookie(): Promise<string | null> {
  const store = await cookies();
  const code = store.get(INVITE_CODE_COOKIE)?.value ?? null;
  return code && isValidInviteCode(code) ? code : null;
}

async function readSlugFromCookie(): Promise<string | null> {
  const store = await cookies();
  const slug = store.get(INVITE_SLUG_COOKIE)?.value ?? null;
  return slug && slug.length > 0 && slug.length <= 128 ? slug : null;
}

/**
 * 쿠키가 없는 로그인 유저가 **자기 초대 링크의 주인**인 경우를 서버에서 감지한다.
 * 예전에는 `ReferralProvider`가 클라이언트에서 하던 일인데, 그 경로만 적격 판정을
 * 따로 계산해 서버 값과 어긋났다. 판정을 한곳으로 모으기 위해 서버로 옮겼다.
 *
 * **`isInfluencer`로 먼저 거른다.** 레퍼럴 코드는 인플루언서만 가지므로 그 외 사용자에게
 * `/v1/referral/me`는 항상 403이다. 게이팅 없이 부르면 로그인 트래픽 전체가 레이아웃 렌더를
 * 막는 헛호출을 하나씩 더 하게 된다(같은 이유로 과거 클라이언트에서도 게이팅을 넣었다).
 */
async function detectOwnSlug(): Promise<string | null> {
  const user = await getAuthUser();
  if (!user?.isInfluencer) return null;
  const mine = await fetchMyReferralCode(await getServerToken());
  return mine?.slug ?? null;
}
