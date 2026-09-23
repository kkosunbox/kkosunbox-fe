import Link from "next/link";

function EmptyCartIcon() {
  return <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
    <rect width="88" height="88" rx="44" fill="var(--color-surface-light)" />
    <path d="M34.3335 42V32.3333C34.3335 26.9946 38.6614 22.6667 44.0002 22.6667C49.3389 22.6667 53.6668 26.9946 53.6668 32.3333V42" stroke="var(--color-profile-meta-empty)" strokeWidth="4" strokeLinecap="round" />
    <path d="M24.361 38.4178C24.5061 36.6769 24.5786 35.8065 25.1527 35.2782C25.7268 34.75 26.6003 34.75 28.3472 34.75H59.6528C61.3997 34.75 62.2732 34.75 62.8473 35.2782C63.4214 35.8065 63.4939 36.6769 63.639 38.4178L65.5695 61.5839C65.654 62.5974 65.6962 63.1042 65.3991 63.4271C65.102 63.75 64.5935 63.75 63.5764 63.75H24.4236C23.4065 63.75 22.898 63.75 22.6009 63.4271C22.3038 63.1042 22.346 62.5974 22.4305 61.5839L24.361 38.4178Z" stroke="var(--color-profile-meta-empty)" strokeWidth="4" strokeLinecap="round" />
  </svg>;
}

export function CartEmptyState() {
  return <div className="flex w-full flex-col items-center text-center">
    <EmptyCartIcon />
    <h2 className="mt-6 text-[24px] font-extrabold leading-[29px] tracking-[-0.04em] text-[var(--color-text)]">장바구니에 담긴 상품이 없습니다.</h2>
    <p className="mt-4 text-body-16-m text-[var(--color-text-secondary)]">원하는 상품을 장바구니에 담아보세요!</p>
    <Link href="/purchase" className="mt-12 inline-flex h-12 w-full max-w-[301px] items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-subtitle-16-sb text-white">쇼핑 계속하기</Link>
  </div>;
}
