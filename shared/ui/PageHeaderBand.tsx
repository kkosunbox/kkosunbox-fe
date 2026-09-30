import type { ReactNode } from "react";

interface PageHeaderBandProps {
  title: string;
  description: string;
  backControl: ReactNode;
}

/** 장바구니·주문 화면에서 공통으로 사용하는 148px 아이보리 상단 띠. */
export default function PageHeaderBand({ title, description, backControl }: PageHeaderBandProps) {
  return (
    <header className="bg-[var(--color-page-header-bg)]">
      <div className="mx-auto flex h-[148px] w-full max-w-[1240px] flex-col justify-center max-xl:px-6 xl:px-0">
        <div className="flex items-center gap-1">
          {backControl}
          <h1 className="max-md:text-[20px] max-md:leading-6 text-[24px] font-bold leading-[29px] tracking-[-0.04em] text-[var(--color-text)]">
            {title}
          </h1>
        </div>
        <p className="ml-7 max-md:mt-2 md:mt-3 max-md:text-[13px] max-md:leading-5 text-[16px] font-medium leading-[19px] tracking-[-0.114286px] text-[var(--color-page-header-description)]">
          {description}
        </p>
      </div>
    </header>
  );
}
