const TERMS_SECTIONS = [
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
      "허위 정보를 입력한 경우",
      "기타 회사가 부적절하다고 판단한 경우",
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
      "회원의 귀책 사유로 발생한 문제",
      "불가항력적 사유로 인한 배송 지연",
    ],
  },
  {
    title: "제10조 (분쟁 해결)",
    content: "회사와 회원 간 분쟁은 관련 법령 및 상관례에 따릅니다.",
  },
] as const;

export default function TermsPage() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-content md:px-0 py-14 max-md:px-6 max-md:py-10">
        <h1 className="text-title-40-b max-md:text-title-28-b text-primary">이용약관</h1>
        <p className="mt-3 text-body-16-r max-md:text-body-14-r text-[var(--color-text-secondary)]">
          본 약관은 임시 게시본이며, 추후 서비스 정책에 따라 변경될 수 있습니다.
        </p>

        <div className="mt-10 space-y-7 max-md:mt-8">
          {TERMS_SECTIONS.map((section) => (
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
