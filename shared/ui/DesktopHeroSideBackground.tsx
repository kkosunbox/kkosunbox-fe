/** 데스크톱 히어로 이미지 바깥의 초광폭 여백을 채우는 공용 배경 레이어 */
export default function DesktopHeroSideBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-[253px] w-full bg-support-hero-side-bg"
    />
  );
}
