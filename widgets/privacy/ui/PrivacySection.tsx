import Image from "next/image";
import privacyTitle from "../assets/privacy-title.webp";

const PRIVACY_SECTIONS = [
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
      "예: 전자상거래 기록 및 계약/청약철회 기록 5년",
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
    items: ["• 담당자: ", "• 이메일: "],
  },
  {
    title: "9. 정책 변경",
    content: "본 방침은 법령 또는 서비스 변경에 따라 수정될 수 있습니다.",
  },
] as const;

export default function PrivacySection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-content py-14 md:px-0 max-md:px-6 max-md:py-10">
        <Image
          src={privacyTitle}
          alt="개인정보처리방침"
          width={privacyTitle.width}
          height={privacyTitle.height}
          priority
          className="h-auto w-full max-w-[217px]"
        />
        <p className="mt-5 text-body-16-r max-md:text-body-14-r text-[var(--color-text-secondary)]">
          본 방침은 임시 게시본이며, 추후 서비스 정책에 따라 변경될 수 있습니다.
        </p>

        <div className="mt-10 space-y-7 max-md:mt-8">
          {PRIVACY_SECTIONS.map((section) => (
            <article key={section.title} className="space-y-3">
              <h2 className="text-subtitle-24-b max-md:text-subtitle-20-b text-primary">
                {section.title}
              </h2>
              {"content" in section && (
                <p className="text-body-16-r max-md:text-body-14-r leading-[1.9] text-[var(--color-text)]">
                  {section.content}
                </p>
              )}
              {"items" in section && (
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-body-16-r max-md:text-body-14-r leading-[1.9] text-[var(--color-text)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
