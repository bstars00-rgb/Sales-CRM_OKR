import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastRoot } from "@/components/common/ToastContext";
import { ActivityWizardRoot } from "@/components/crm/ActivityWizard";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme";

export const metadata: Metadata = {
  title: "Sales CRM + OKR",
  description: "B2B 호텔/여행 세일즈 운영 OS — CRM + OKR + KPI + Weekly Brief",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="h-full antialiased">
        <ThemeProvider>
          <ToastRoot>
            <ActivityWizardRoot>{children}</ActivityWizardRoot>
          </ToastRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
