import { DELIVERY_INFO_SECTIONS } from "./deliveryInfo";

export default function ProductDeliveryInfo({ variant }: { variant: "mobile" | "desktop" }) {
  if (variant === "mobile") {
    return (
      <div className="px-6 py-10">
        <h3 className="text-[20px] font-semibold leading-6 tracking-[-0.04em] text-[var(--color-text-emphasis)]">
          배송정보
        </h3>
        <div className="mt-6 space-y-8 pl-2">
          {DELIVERY_INFO_SECTIONS.map((section) => (
            <section key={section.title}>
              <h4 className="text-[16px] font-semibold leading-5 tracking-[-0.04em] text-[var(--color-text-secondary)]">
                {section.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 text-[14px] font-medium leading-5 tracking-[-0.04em] text-[var(--color-text-secondary)]"
                  >
                    <span className="absolute left-0 top-[8px] h-1 w-1 rounded-full bg-[var(--color-text-secondary)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[815px] py-20 md:px-6 lg:px-0">
      <h3 className="text-body-20-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]">배송정보</h3>
      <div className="mt-8 space-y-10 pl-2">
        {DELIVERY_INFO_SECTIONS.map((section) => (
          <section key={section.title}>
            <h4 className="text-body-16-sb tracking-[-0.04em] text-[var(--color-text-secondary)]">{section.title}</h4>
            <ul className="mt-3 space-y-2.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="relative pl-4 text-body-14-m leading-5 tracking-[-0.04em] text-[var(--color-text-secondary)]"
                >
                  <span className="absolute left-0 top-[8px] h-1 w-1 rounded-full bg-[var(--color-text-secondary)]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
