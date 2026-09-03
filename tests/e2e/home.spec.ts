import { test, expect } from "../helpers/fixtures";

/**
 * 메인 hero 영상(widgets/home/hero/ui/HeroSection.tsx) 기능 가드.
 *
 * 시각회귀(visual-regression-tablet.spec.ts)는 캡처 시점의 재생 위치가 실행마다 달라지는 문제 때문에
 * 영상을 정지·숨기고 그 아래 poster를 찍는다. 그래서 "영상이 통째로 사라졌다 / 파일을 못 불러왔다"는
 * 시각회귀로는 잡히지 않는다. 픽셀 비교 대신 로드·크기·소스만 여기서 확인해 그 구멍을 막는다.
 */

const HERO_VIDEO_SRC = "/videos/home-hero.mp4";
const HERO_POSTER_SRC = "/videos/home-hero-poster.webp";

test.describe("메인 hero 영상 (/)", () => {
  test("영상이 실제로 디코딩되고 hero 영역을 채운다", async ({ page }) => {
    await page.goto("/");

    const video = page.locator("video");
    await expect(video).toBeAttached();

    // 소스 경로 — 파일명 변경·오타로 엉뚱한 경로를 가리키는 경우를 잡는다.
    await expect(page.locator("video source")).toHaveAttribute("src", HERO_VIDEO_SRC);

    // videoWidth는 메타데이터가 실제로 디코딩돼야 0을 벗어난다. readyState 2(HAVE_CURRENT_DATA)까지
    // 확인해 404·코덱 실패로 영상이 안 나오는 상태를 잡는다.
    await expect
      .poll(
        () =>
          video.evaluate(
            (el: HTMLVideoElement) => el.videoWidth > 0 && el.readyState >= 2,
          ),
        { timeout: 15_000, message: "hero 영상이 로드되지 않았다(경로·코덱·파일 존재 확인)" },
      )
      .toBe(true);

    // 화면을 채우는지 — `absolute inset-0`이 깨져 0px로 접히는 회귀를 잡는다.
    const viewport = page.viewportSize();
    const box = await video.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual((viewport?.width ?? 0) * 0.9);
    expect(box!.height).toBeGreaterThan(0);
  });

  test("poster 이미지가 영상 아래에 로드돼 있다", async ({ page }) => {
    // 시각회귀 baseline은 영상을 숨긴 뒤 이 poster를 찍는다. poster가 깨지면 baseline의
    // 검증 대상 자체가 사라지므로 별도로 확인한다.
    await page.goto("/");

    await expect(page.locator("video")).toHaveAttribute("poster", HERO_POSTER_SRC);

    const poster = page.locator(`img[src="${HERO_POSTER_SRC}"]`);
    await expect(poster).toBeAttached();
    await expect
      .poll(() => poster.evaluate((el: HTMLImageElement) => el.naturalWidth), {
        timeout: 15_000,
        message: "hero poster 이미지가 로드되지 않았다",
      })
      .toBeGreaterThan(0);
  });
});
