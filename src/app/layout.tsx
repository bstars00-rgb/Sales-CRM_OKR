import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sales CRM + OKR",
  description: "B2B 호텔/여행 세일즈 운영 OS — CRM + OKR + KPI + Weekly Brief",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
