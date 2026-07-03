import { ScrollReveal } from "@/shared/ui";

const STATS = [
  {
    accent: "var(--color-stats-icon-blue)",
    caption: "100% 휴먼그레이드",
    label: "1:1 맞춤 케어",
    icon: (
      <svg
        className="max-md:size-6 md:size-10 lg:size-12 shrink-0"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.2549 6.70215C23.7401 6.5506 24.2599 6.5506 24.7451 6.70215L24.9844 6.79004L37.8994 12.3252C38.9232 12.7641 39.5336 13.8273 39.3955 14.9326L37.7822 27.8369C37.5463 29.7238 36.6024 31.4506 35.1416 32.668L25.6006 40.6191C24.6735 41.3917 23.3265 41.3917 22.3994 40.6191L12.8584 32.668C11.3976 31.4506 10.4537 29.7238 10.2178 27.8369L8.60449 14.9326C8.46643 13.8273 9.07681 12.7641 10.1006 12.3252L23.0156 6.79004L23.2549 6.70215Z"
          stroke="var(--color-stats-icon-blue)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M18 24L23.5687 29.5687C23.7918 29.7918 24.1633 29.7551 24.3383 29.4925L32 18"
          stroke="var(--color-stats-icon-blue)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    accent: "var(--color-text-discount)",
    caption: "매일 신선 배송",
    label: "정기 구독",
    icon: (
      <svg
        className="max-md:size-6 md:size-10 lg:size-12 shrink-0"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="34" r="4" stroke="var(--color-text-discount)" strokeWidth="3" />
        <circle cx="18" cy="34" r="4" stroke="var(--color-text-discount)" strokeWidth="3" />
        <path
          d="M40 22V18.4806C40 18.1768 39.8619 17.8895 39.6247 17.6998L30 10H22V24H10M22 10V14H8V32C8 33.1046 8.89543 34 10 34H14M34 14H32V22H40M40 22V32C40 33.1046 39.1046 34 38 34H36M28 34H22"
          stroke="var(--color-text-discount)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    accent: "var(--color-stats-icon-green)",
    caption: "인공첨가물 0%",
    label: "건강한 간식",
    icon: (
      <svg
        className="max-md:size-6 md:size-10 lg:size-12 shrink-0"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M35.5469 6.59766C35.8872 6.45624 36.3223 6.46327 36.6572 6.65527H36.6582C36.8156 6.74584 36.9512 6.89077 37.0469 7.02832C37.1193 7.13242 37.1939 7.26862 37.2373 7.42285L37.2695 7.58301V7.58398C37.7155 11.6345 37.5077 15.7851 36.7119 19.7568H36.7109C35.9054 23.7745 34.3166 27.7389 31.4854 30.7246L31.4805 30.7285C27.4032 34.9164 21.1434 36.3592 15.8086 34.0342C14.9923 35.7795 14.3992 37.6061 13.9609 39.5459C13.777 40.3593 12.979 40.6132 12.4287 40.4531V40.4521C12.0938 40.3551 11.8192 40.1462 11.6562 39.8486C11.4951 39.5543 11.4643 39.2133 11.5391 38.8818V38.8809C12.0492 36.626 12.7962 34.4902 13.7949 32.4131C12.471 29.4689 11.9242 26.2339 12.249 23.0117C12.6863 18.6815 14.9486 14.8489 18.4326 12.4707C21.4993 10.3411 24.7429 9.47563 28.2227 8.73926C30.8925 8.17428 33.0296 7.64571 35.5459 6.59766H35.5469ZM34.9424 9.55859C32.7757 10.3718 30.5771 10.8472 28.4053 11.2969L28.4043 11.2959C25.2552 11.9894 22.1874 12.8554 19.6182 14.7236C14.9905 18.0879 13.617 23.9822 15.3662 29.5078C17.4964 26.0529 20.1218 22.981 23.2012 20.3838C24.1923 19.5476 25.2028 18.8138 26.332 18.1904C26.6975 17.9889 27.0797 18.0505 27.3584 18.1992C27.6272 18.3427 27.8533 18.5906 27.9561 18.8789L27.9883 18.9834C28.0569 19.2288 28.0669 19.4981 27.9844 19.7588C27.8902 20.0557 27.6867 20.3047 27.3916 20.4717C26.2457 21.1855 25.2172 21.9389 24.2139 22.8281C21.3415 25.3734 18.9323 28.359 16.9609 31.7666C19.3051 32.7248 21.8426 32.8407 24.2812 32.1533C27.1079 31.3566 29.5009 29.61 31.1748 27.085L31.1777 27.0801C32.1389 25.6624 32.8406 24.1252 33.4004 22.4541C34.7303 18.482 35.1626 13.8555 34.9424 9.55859Z"
          fill="var(--color-stats-icon-green)"
          stroke="var(--color-stats-icon-green)"
        />
      </svg>
    ),
  },
];

export default function StatsBar() {
  return (
    <section className="relative z-20 -mt-8 max-md:-mt-6 md:-mt-10 lg:-mt-12">
      <div className="mx-auto max-w-content max-md:max-w-[343px] px-4 md:px-5 lg:px-0">
        <div className="flex items-center justify-between rounded-[24px] md:rounded-[32px] lg:rounded-[36px] bg-white shadow-[0px_4px_12px_3px_rgba(0,0,0,0.12)] max-md:gap-1 md:gap-4 lg:gap-0 max-md:px-3 max-md:py-4 md:px-8 md:py-6 lg:px-[72px] lg:py-8">
          {STATS.map((item, i) => (
            <ScrollReveal key={item.label} variant="fade-up" delay={i * 150} duration={500}>
              <div className="flex items-center max-md:gap-1 md:gap-3 lg:gap-4 lg:w-[192px]">
                {item.icon}
                <div className="flex flex-col">
                  <span className="max-md:text-body-11-sb md:text-body-13-sb lg:text-body-15-sb text-[var(--color-stats-caption)] tracking-[-0.02em] break-keep">
                    {item.caption}
                  </span>
                  <span
                    className="max-md:text-body-13-b md:text-body-16-b lg:text-body-18-b tracking-[-0.02em] break-keep"
                    style={{ color: item.accent }}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
