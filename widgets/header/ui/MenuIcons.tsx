import { useId } from "react";

// 프로필 드롭다운·모바일 드로워 공용 아웃라인 아이콘 (Figma Icon/Outline/*).
// 색상은 stroke="currentColor"로 받아 호출부의 text-* 클래스로 제어한다.
function OutlineIcon({ d, round = true }: { d: string; round?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap={round ? "round" : undefined}
        strokeLinejoin={round ? "round" : undefined}
      />
    </svg>
  );
}

export function MenuUserCircleIcon() {
  return <OutlineIcon d="M5.12104 17.8037C7.15267 16.6554 9.4998 16 12 16C14.5002 16 16.8473 16.6554 18.879 17.8037M15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />;
}

export function MenuCreditCardIcon() {
  return <OutlineIcon d="M3 10H21M7 15H8M12 15H13M6 19H18C19.6569 19 21 17.6569 21 16V8C21 6.34315 19.6569 5 18 5H6C4.34315 5 3 6.34315 3 8V16C3 17.6569 4.34315 19 6 19Z" />;
}

export function MenuClipboardCheckIcon() {
  return <OutlineIcon d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 14L11 16L15 12" />;
}

export function MenuDocumentTextIcon() {
  return <OutlineIcon d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" />;
}

export function MenuHomeIcon() {
  return <OutlineIcon d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" />;
}

export function MenuBookmarkIcon() {
  return <OutlineIcon d="M16 4V16L12 14L8 16V4M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" />;
}

export function MenuShoppingBagIcon() {
  return <OutlineIcon d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z" />;
}

export function MenuShoppingCartIcon() {
  return <OutlineIcon d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z" />;
}

export function MenuChatIcon() {
  return <OutlineIcon d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z" />;
}

export function MenuDatabaseIcon() {
  return <OutlineIcon round={false} d="M4 7V17C4 19.2091 7.58172 21 12 21C16.4183 21 20 19.2091 20 17V7M4 7C4 9.20914 7.58172 11 12 11C16.4183 11 20 9.20914 20 7M4 7C4 4.79086 7.58172 3 12 3C16.4183 3 20 4.79086 20 7M20 12C20 14.2091 16.4183 16 12 16C7.58172 16 4 14.2091 4 12" />;
}

export function MenuLogoutIcon() {
  return <OutlineIcon d="M17 8L21 12L17 16M21 12L7 12M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" />;
}

/** 아바타 우하단 24px 연필 배지 아이콘 (Figma 5945:35752) — 원형 배경은 호출부 버튼이 담당 */
export function MenuPencilIcon() {
  // mask id는 드롭다운·드로워가 동시에 렌더돼도 충돌하지 않도록 인스턴스마다 고유하게 만든다.
  const maskId = useId();
  const pencil = "M13.9997 7.79961L8.39142 13.4079C8.19677 13.6025 8.09945 13.6999 8.03247 13.8182C7.9655 13.9364 7.93211 14.07 7.86535 14.337L7.40182 16.1912C7.31156 16.5522 7.26643 16.7327 7.36652 16.8328C7.46661 16.9329 7.64713 16.8878 8.00816 16.7975L9.86228 16.334C10.1293 16.2672 10.2629 16.2338 10.3812 16.1668C10.4994 16.0999 10.5968 16.0025 10.7914 15.8079L16.3997 10.1996C16.8607 9.73865 17.0911 9.50817 17.1573 9.2353C17.1949 9.08042 17.1949 8.9188 17.1573 8.76392C17.0911 8.49105 16.8607 8.26057 16.3997 7.79961C15.9388 7.33865 15.7083 7.10817 15.4354 7.042C15.2805 7.00443 15.1189 7.00443 14.964 7.042C14.6911 7.10817 14.4607 7.33865 13.9997 7.79961Z";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <mask id={maskId} maskUnits="userSpaceOnUse" x="5.2" y="4.6" width="14" height="14" fill="black">
        <rect fill="white" x="5.2" y="4.6" width="14" height="14" />
        <path d={pencil} />
      </mask>
      <path d={pencil} stroke="currentColor" strokeWidth="3" strokeLinecap="round" mask={`url(#${maskId})`} />
      <path d="M13.1997 7.80117L15.5997 6.20117L17.9997 8.60117L16.3997 11.0012L13.1997 7.80117Z" fill="currentColor" />
    </svg>
  );
}
