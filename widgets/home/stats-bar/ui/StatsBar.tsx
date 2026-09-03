import { ScrollReveal } from "@/shared/ui";
import careIcon from "../assets/stats-care.svg";
import deliveryIcon from "../assets/stats-delivery.svg";
import healthyIcon from "../assets/stats-healthy.svg";

const STATS = [
  {
    accent: "var(--color-stats-icon-blue)",
    caption: "100% 휴먼그레이드",
    label: "1:1 맞춤 케어",
    icon: careIcon,
  },
  {
    accent: "var(--color-text-discount)",
    caption: "매일 신선 배송",
    label: "정기 구독",
    icon: deliveryIcon,
  },
  {
    accent: "var(--color-stats-icon-green)",
    caption: "인공첨가물 0%",
    label: "건강한 간식",
    icon: healthyIcon,
  },
];

export default function StatsBar() {
  return (
    <section className="relative z-20 bg-[var(--color-surface-light)]">
      <div className="mx-auto flex max-w-content items-center max-lg:justify-around max-md:h-[82px] max-md:px-4 md:h-[104px] md:max-lg:px-8 lg:justify-between lg:px-[72px]">
        {STATS.map((item, i) => (
          <ScrollReveal key={item.label} variant="fade-up" delay={i * 120} duration={500}>
            <div className="flex min-w-[82px] items-center max-md:flex-col max-md:gap-1 md:w-[192px] md:flex-row md:gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- exact supplied artwork */}
              <img
                src={item.icon.src}
                alt=""
                width={item.icon.width}
                height={item.icon.height}
                className="shrink-0 max-md:size-6 md:size-10 lg:size-12"
              />
              <div className="flex flex-col max-md:items-center md:items-start">
                <span className="max-md:hidden text-body-13-sb lg:text-body-15-sb text-[var(--color-stats-caption)] tracking-[-0.02em] break-keep">
                  {item.caption}
                </span>
                <span
                  className="text-[13px] font-bold leading-[160%] tracking-[-0.02em] break-keep md:text-body-16-b lg:text-body-18-b"
                  style={{ color: item.accent }}
                >
                  {item.label}
                </span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
