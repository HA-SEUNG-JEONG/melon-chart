import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heavy Serenade — 멜론 차트",
  description: "엔믹스 Heavy Serenade 멜론 TOP100 순위 추적",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
