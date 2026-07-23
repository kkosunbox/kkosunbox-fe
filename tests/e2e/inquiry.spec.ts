import { test, expect } from "../helpers/fixtures";
import { loginAndGoTo } from "../helpers/auth";

// ─────────────────────────────────────────────────────────────────────────────
// 문의하기 (/inquiry)
//
// 연락처(contact) 필드는 선택사항이지만, 값을 입력하면 shared/lib/format의
// isValidKoreanPhone으로 형식을 검증한다 (onChange 자동 포맷 + onBlur 검증 +
// 제출 시 재검증). 폼은 데스크톱/모바일 DOM을 동시에 렌더링하므로(둘 다 항상
// 존재, CSS로만 숨김) 데스크톱 전용 id(#title, #content, #contact,
// #inquiry-agree-terms 등)를 사용해 strict mode 위반을 방지한다.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("문의하기 (/inquiry)", () => {
  test("미인증 접근 → /login 리다이렉트", async ({ page }) => {
    await page.goto("/inquiry");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
  });

  test.describe("인증 유저", () => {
    test.beforeEach(async ({ page }) => {
      await loginAndGoTo(page, "/inquiry");
      await expect(page.locator("#title")).toBeVisible({ timeout: 10_000 });
    });

    test("잘못된 연락처 입력 후 blur → 인라인 에러", async ({ page }) => {
      await page.locator("#contact").fill("asdf1234");
      await page.locator("#contact").blur();
      await expect(page.getByText("올바른 전화번호 형식이 아닙니다.")).toBeVisible();
    });

    test("숫자만 입력하면 자동으로 하이픈 포맷팅", async ({ page }) => {
      await page.locator("#contact").fill("01012345678");
      await expect(page.locator("#contact")).toHaveValue("010-1234-5678");
    });

    test("올바른 연락처 입력 후 blur → 에러 없음", async ({ page }) => {
      await page.locator("#contact").fill("01012345678");
      await page.locator("#contact").blur();
      await expect(page.getByText("올바른 전화번호 형식이 아닙니다.")).not.toBeVisible();
    });

    test("연락처를 비워둬도 제출 가능 (선택사항)", async ({ page }) => {
      await page.locator("#title").fill("연락처 없이 문의합니다");
      await page.locator("#content").fill("연락처 필드는 선택사항이라 비워도 제출돼야 합니다.");
      await page.getByText("이용약관에 동의합니다.", { exact: true }).first().click();
      await page.getByText("개인정보 제공 및 활용에 동의합니다.", { exact: true }).first().click();

      await page.getByRole("button", { name: "제출하기" }).first().click();
      await page.waitForURL("/support/history", { timeout: 10_000 });
    });

    // 체크박스로 포커스를 옮기는 순간 #contact가 자연스럽게 blur되어 즉시 에러가 뜨고
    // isSubmittable(!contactError 포함)이 false가 되어 제출 버튼이 비활성화된다 —
    // 즉 "제출 버튼을 눌러도 막힌다"가 아니라 "애초에 누를 수조차 없다"가 실제 동작.
    // handleSubmit 내부의 제출 시점 재검증은 이 disabled 우회 상황에 대한 방어선이다.
    test("잘못된 연락처 입력 → 제출 버튼이 비활성화됨", async ({ page }) => {
      await page.locator("#title").fill("잘못된 연락처로 문의합니다");
      await page.locator("#content").fill("연락처 형식이 틀렸을 때 제출이 막히는지 확인합니다.");
      await page.locator("#contact").fill("1234");
      await page.getByText("이용약관에 동의합니다.", { exact: true }).first().click();
      await page.getByText("개인정보 제공 및 활용에 동의합니다.", { exact: true }).first().click();

      await expect(page.getByText("올바른 전화번호 형식이 아닙니다.")).toBeVisible();
      await expect(page.getByRole("button", { name: "제출하기" }).first()).toBeDisabled();
      await expect(page).toHaveURL("/inquiry");
    });

    test("정상적인 연락처 포함 제출 → 문의내역으로 이동", async ({ page }) => {
      await page.locator("#title").fill("연락처 포함 문의입니다");
      await page.locator("#content").fill("올바른 형식의 연락처를 입력하고 제출합니다.");
      await page.locator("#contact").fill("01012345678");
      await page.getByText("이용약관에 동의합니다.", { exact: true }).first().click();
      await page.getByText("개인정보 제공 및 활용에 동의합니다.", { exact: true }).first().click();

      await page.getByRole("button", { name: "제출하기" }).first().click();
      await page.waitForURL("/support/history", { timeout: 10_000 });
    });
  });
});
