import type { Metadata, Viewport } from "next";
import { Ms_Madi, Give_You_Glory, Gantari } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/features/auth";
import { getAuthUser } from "@/features/auth/lib/session";
import { ProfileProvider } from "@/features/profile/ui/ProfileProvider";
import { ModalProvider, LoadingOverlayProvider, ChannelTalkProvider, GoogleAnalyticsTracker } from "@/shared/ui";
import { GA_ID } from "@/shared/lib/analytics";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#F89602",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "꼬순박스 — 프리미엄 강아지 수제간식 구독",
  description: "강아지에게 맞춤 수제간식을 정기적으로 제공하는 프리미엄 패키지 구독 서비스",
  openGraph: {
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
          href="/fonts/PretendardVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Griun_PolFairness-Rg.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`antialiased ${msMadi.variable} ${giveYouGlory.variable} ${gantari.variable}`}>
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
