import type { Metadata, Viewport } from "next";
import { Ms_Madi, Give_You_Glory, Gantari } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { headers } from "next/headers";
import "./globals.css";
import "./pretendard-subset.css";
import { AuthProvider } from "@/features/auth";
import { getAuthUser } from "@/features/auth/lib/session";
import { ProfileProvider } from "@/features/profile/ui/ProfileProvider";
import { ModalProvider, LoadingOverlayProvider, ChannelTalkProvider, GoogleAnalyticsTracker, JsonLd } from "@/shared/ui";
import { GA_ID } from "@/shared/lib/analytics";
import { SITE_URL, PRODUCTION_HOST, NOINDEX_METADATA } from "@/shared/lib/seo";

const msMadi = Ms_Madi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ms-madi",
});

const giveYouGlory = Give_You_Glory({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-give-you-glory",
});

const gantari = Gantari({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-gantari",
});

export const viewport: Viewport = {
  themeColor: "#F89602",
};

/**
 * dev.kkosunbox.com·preview·localhost 등 정식 호스트가 아닌 배포본은 검색 결과에서 제외한다.
 * proxy.ts가 응답 헤더(X-Robots-Tag)로 한 번 막고, 여기서 HTML <meta name="robots"> 태그로
 * 한 번 더 막는다 — 네이버 Yeti 등 HTTP 헤더 지시자 지원 여부가 불확실한 크롤러까지 커버하기 위함.
 * 루트 레이아웃은 getAuthUser()의 cookies() 호출로 이미 요청마다 동적 렌더링되므로
 * headers() 추가로 인한 정적 생성 손실은 없다.
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const isProductionHost = headersList.get("host") === PRODUCTION_HOST;

  return {
    metadataBase: new URL(SITE_URL),
    title: "꼬순박스 — 프리미엄 강아지 수제간식 구독",
    description: "강아지에게 맞춤 수제간식을 정기적으로 제공하는 프리미엄 패키지 구독 서비스",
    ...(isProductionHost ? {} : NOINDEX_METADATA),
    openGraph: {
      url: SITE_URL,
      siteName: "꼬순박스",
      type: "website",
      locale: "ko_KR",
      title: "꼬순박스 — 프리미엄 강아지 수제간식 구독",
      description: "강아지에게 맞춤 수제간식을 정기적으로 제공하는 프리미엄 패키지 구독 서비스",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "꼬순박스" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "꼬순박스 — 프리미엄 강아지 수제간식 구독",
      description: "강아지에게 맞춤 수제간식을 정기적으로 제공하는 프리미엄 패키지 구독 서비스",
      images: ["/og-image.png"],
    },
  };
}

// 브랜드/사이트 구조화 데이터. 검색엔진의 브랜드 인식·사이트링크 유도를 돕는다.
// (사이트 내 검색 기능이 없으므로 WebSite SearchAction은 의도적으로 제외)
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "꼬순박스",
  alternateName: ["kkosunbox", "꼬순 박스"],
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  sameAs: ["https://www.instagram.com/kkosunbox/"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "꼬순박스",
  alternateName: "kkosunbox",
  url: SITE_URL,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getAuthUser();

  return (
    <html lang="ko">
      <head>
        {/* 로그인·랜딩 등 Griun PolFairness 헤드라인의 FOUT(줄바꿈 깜빡임) 완화 */}
        <link
          rel="preload"
          href="/fonts/Griun_PolFairness-Rg.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`antialiased ${msMadi.variable} ${giveYouGlory.variable} ${gantari.variable}`}>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
        <Suspense>
          <GoogleAnalyticsTracker />
        </Suspense>
        <AuthProvider initialUser={initialUser}>
          <ProfileProvider>
            <LoadingOverlayProvider>
              <ModalProvider>
                <ChannelTalkProvider />
                {children}
              </ModalProvider>
            </LoadingOverlayProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
