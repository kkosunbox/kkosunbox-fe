/* eslint-disable react-hooks/rules-of-hooks -- Playwright의 fixture 콜백 인자 `use`가
   React Hook으로 오인되어 오탐된다(테스트 인프라 파일, React 컴포넌트 아님). */
import { test as base, expect } from "@playwright/test";

/**
 * ChannelTalk(#ch-plugin)은 외부 CDN(cdn.channel.io)에서 로드되는 실사 상담 위젯이다.
 * 마케팅 팝업이 실제로 role="dialog"로 렌더되어 getByRole("dialog") 단정과 strict-mode
 * 충돌을 일으키고, 노출 타이밍이 우리 코드와 무관하게 매 실행 달라져 스크린샷 diff·인증
 * 부트스트랩 레이스에도 영향을 준다. 전 스펙 공통으로 이 스크립트 자체를 차단해
 * 화면을 완전히 결정론적으로 만든다(제품 코드 변경 없음).
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("https://cdn.channel.io/**", (route) => route.abort());
    await use(page);
  },
});

export { expect };
