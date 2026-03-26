import type { Metadata } from "next";
import { Ms_Madi, Give_You_Glory } from "next/font/google";
import "@fontsource/pretendard";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "꼬순박스 — 프리미엄 강아지 수제간식 구독",
  description: "강아지에게 맞춤 수제간식을 정기적으로 제공하는 프리미엄 패키지 구독 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`antialiased ${msMadi.variable} ${giveYouGlory.variable}`}>
        {children}
      </body>
    </html>
  );
}
