"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── 서비스 이용약관 ─── */
const TERMS_CONTENT = [
  {
    title: "제1조 (목적)",
    content:
      "이 약관은 꼬순박스(이하 “회사”)가 제공하는 애견 수제 간식 구독 서비스(이하 “서비스”)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.",
  },
  {
    title: "제2조 (정의)",
    items: [
      "“회원”이란 회사에 회원가입을 하고 서비스를 이용하는 자를 의미합니다.",
      "“구독 서비스”란 정기적으로 애견 간식을 배송하는 서비스를 의미합니다.",
      "“결제”란 구독 서비스 이용을 위해 회원이 회사에 비용을 지불하는 행위를 의미합니다.",
    ],
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    items: [
      "본 약관은 회원이 동의함으로써 효력이 발생합니다.",
      "회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있습니다.",
      "변경된 약관은 적용일자 및 변경 사유를 명시하여 공지합니다.",
    ],
  },
  {
    title: "제4조 (회원가입)",
    items: [
      "회원은 회사가 정한 절차에 따라 가입할 수 있습니다.",
      "회사는 다음과 같은 경우 가입을 제한할 수 있습니다.",
      "- 허위 정보를 입력한 경우",
      "- 기타 회사가 부적절하다고 판단한 경우",
    ],
  },
  {
    title: "제5조 (서비스 제공)",
    items: [
      "회사는 회원에게 애견 간식 구독 서비스를 제공합니다.",
      "배송 주기 및 구성은 회사 정책에 따라 변경될 수 있습니다.",
      "천재지변, 물류 문제 등으로 배송이 지연될 수 있습니다.",
    ],
  },
  {
    title: "제6조 (결제 및 구독)",
    items: [
      "구독 서비스는 정기결제 방식으로 운영됩니다.",
      "회원은 언제든지 구독을 해지할 수 있습니다.",
      "결제 완료 후 제작이 시작된 상품은 환불이 제한될 수 있습니다.",
    ],
  },
  {
    title: "제7조 (환불 및 취소)",
    items: [
      "배송 전 취소는 전액 환불 가능합니다.",
      "단순 변심에 의한 환불은 배송 완료 후 제한될 수 있습니다.",
      "제품 하자 시 교환 또는 환불이 가능합니다.",
    ],
  },
  {
    title: "제8조 (회원의 의무)",
    items: [
      "회원은 정확한 정보를 제공해야 합니다.",
      "서비스 이용 시 관련 법령 및 약관을 준수해야 합니다.",
    ],
  },
  {
    title: "제9조 (회사의 책임 제한)",
    items: [
      "회사는 다음의 경우 책임을 지지 않습니다.",
      "- 회원의 귀책 사유로 발생한 문제",
      "- 불가항력적 사유로 인한 배송 지연",
    ],
  },
  {
    title: "제10조 (분쟁 해결)",
    content: "회사와 회원 간 분쟁은 관련 법령 및 상관례에 따릅니다.",
  },
];

/* ─── 개인정보처리방침 ─── */
const PRIVACY_CONTENT = [
  {
    title: "1. 수집하는 개인정보 항목",
    items: [
      "회사는 다음의 정보를 수집합니다.",
      "- 필수: 이름, 이메일, 휴대전화번호, 배송지 주소",
      "- 선택: 반려견 정보(이름, 나이, 알러지 등)",
      "- 결제 정보: 카드 정보는 결제 대행사를 통해 처리되며 회사는 저장하지 않습니다.",
    ],
  },
  {
    title: "2. 개인정보 수집 및 이용 목적",
    items: [
      "- 회원 식별 및 서비스 제공",
      "- 상품 배송",
      "- 결제 처리",
      "- 고객 문의 대응",
      "- 서비스 개선 및 마케팅(동의한 경우)",
    ],
  },
  {
    title: "3. 개인정보 보관 기간",
    items: [
      "- 회원 탈퇴 시까지 보관합니다.",
      "- 단, 관련 법령에 따라 일정 기간 보관할 수 있습니다.",
      "- 예: 전자상거래 기록 및 계약/청약철회 기록 5년",
    ],
  },
  {
    title: "4. 개인정보 제3자 제공",
    items: [
      "회사는 다음의 경우에만 개인정보를 제공합니다.",
      "- 배송 업체: 상품 배송 목적",
      "- 결제 대행사: 결제 처리 목적",
    ],
  },
  {
    title: "5. 개인정보 처리 위탁",
    items: [
      "회사는 서비스 운영을 위해 업무를 외부에 위탁할 수 있습니다.",
      "- 결제 처리: PG사",
      "- 배송: 택배사",
    ],
  },
  {
    title: "6. 이용자의 권리",
    content: "회원은 언제든지 개인정보 조회, 수정, 삭제를 요청할 수 있습니다.",
  },
  {
    title: "7. 개인정보 보호 조치",
    items: [
      "회사는 개인정보 보호를 위해 다음과 같은 조치를 취합니다.",
      "- 데이터 암호화",
      "- 접근 제한",
      "- 보안 시스템 운영",
    ],
  },
  {
    title: "8. 개인정보 보호 책임자",
    items: ["• 담당자: (추후 기재)", "• 이메일: (추후 기재)"],
  },
  {
    title: "9. 정책 변경",
    content: "본 방침은 법령 또는 서비스 변경에 따라 수정될 수 있습니다.",
  },
];

/* ─── 마케팅 정보 수신 동의 ─── */
const MARKETING_CONTENT = [
  {
    title: "마케팅 정보 수신 동의 안내",
    content:
      "꼬순박스(이하 “회사”)는 회원님께 유익한 마케팅 정보를 제공하기 위해 아래와 같이 개인정보를 활용합니다. 본 동의는 선택 사항이며, 동의하지 않으셔도 서비스 이용에 제한이 없습니다.",
  },
  {
    title: "수신 정보 유형",
    items: [
      "- 신상품 출시 및 이벤트·프로모션 안내",
      "- 할인 쿠폰 및 특별 혜택 정보",
      "- 서비스 업데이트 및 개선 사항 안내",
      "- 회원 맞춤형 상품 추천",
    ],
  },
  {
    title: "수신 채널",
    items: [
      "- 이메일",
      "- SMS / MMS",
      "- 카카오 알림톡 · 친구톡",
      "- 앱 푸시 알림(앱 출시 이후 적용)",
    ],
  },
  {
    title: "개인정보 이용 목적",
    items: [
      "- 회원 맞춤형 마케팅 정보 제공",
      "- 이벤트 참여 기회 제공",
      "- 서비스 홍보 및 광고",
    ],
  },
  {
    title: "보유 및 이용 기간",
    content:
      "마케팅 수신 동의일로부터 회원 탈퇴 또는 수신 거부 의사 표시 시까지 보유·이용합니다.",
  },
  {
    title: "수신 거부 방법",
    items: [
      "- 이메일: 수신된 이메일 하단의 '수신 거부' 링크를 클릭하시면 즉시 처리됩니다.",
      "- SMS: 수신된 문자에 안내된 무료 수신거부 번호로 연락하시면 됩니다.",
      "- 마이페이지 > 알림 설정에서도 언제든지 변경하실 수 있습니다.",
    ],
  },
  {
    title: "유의사항",
    content:
      "수신 거부 시에도 주문 확인, 배송 안내 등 거래 관련 정보는 관련 법령에 따라 계속 발송될 수 있습니다.",
  },
];

type AgreementKey = "terms" | "privacy" | "marketing";

const MODAL_TITLE: Record<AgreementKey, string> = {
  terms: "서비스 이용약관",
  privacy: "개인정보처리방침",
  marketing: "마케팅 정보 수신 동의",
};

type Section = { title: string; content?: string; items?: string[] };

const MODAL_CONTENT: Record<AgreementKey, Section[]> = {
  terms: TERMS_CONTENT,
  privacy: PRIVACY_CONTENT,
  marketing: MARKETING_CONTENT,
};

const SCROLL_THRESHOLD = 0.8;

interface Props {
  type: AgreementKey;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function TermsViewModal({ type, onClose, onConfirm }: Props) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false);

  const checkScroll = useCallback((el: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight || scrollTop + clientHeight >= scrollHeight * SCROLL_THRESHOLD) {
      setHasScrolledEnough(true);
    }
  }, []);

  useEffect(() => {
    const el = scrollBodyRef.current;
    if (!el) return;
    checkScroll(el);
    const handler = () => checkScroll(el);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [checkScroll]);

  useEffect(() => {
    confirmBtnRef.current?.focus();
  }, []);

  function handleConfirm() {
    if (hasScrolledEnough) onConfirm?.();
    onClose();
  }

  const sections = MODAL_CONTENT[type];
  const title = MODAL_TITLE[type];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Card */}
      <div className="relative z-10 flex flex-col w-full max-w-[480px] max-h-[80dvh] rounded-[20px] bg-white overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0"
          style={{ borderBottom: "1px solid var(--color-text-muted)" }}
        >
          <h2 className="text-subtitle-16-sb md:text-subtitle-18-sb text-[var(--color-text)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex items-center justify-center w-7 h-7 hover:opacity-70 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5"
                stroke="var(--color-text-secondary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div ref={scrollBodyRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="space-y-2">
              <h3 className="text-[13px] font-semibold leading-[1.6] text-[var(--color-text)]">
                {section.title}
              </h3>
              {section.content && (
                <p className="text-[12px] font-medium leading-[1.8] text-[var(--color-text-secondary)]">
                  {section.content}
                </p>
              )}
              {section.items && (
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-[12px] font-medium leading-[1.8] text-[var(--color-text-secondary)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-6 pb-6 pt-4 shrink-0"
          style={{ borderTop: "1px solid var(--color-text-muted)" }}
        >
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={handleConfirm}
            className="w-full h-[44px] rounded-full text-[14px] font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ background: "var(--color-text)" }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
