import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NBOOG SACCO — Where Every Shilling Tells a Story",
    template: "%s · NBOOG SACCO",
  },
  description:
    "A premium, secure SACCO logging platform for tracking member contributions, savings, attendance and receipts.",
  applicationName: "NBOOG SACCO",
  authors: [{ name: "NBOOG SACCO" }],
  keywords: ["SACCO", "savings", "credit cooperative", "Uganda", "NBOOG", "financial logging"],
  formatDetection: { email: false, address: false, telephone: false },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0D0F14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} dark`}
    >
      <body className="font-dm antialiased bg-bg text-txt selection:bg-gold-dim selection:text-gold">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(20% 0.014 250)",
              border: "1px solid oklch(30% 0.02 250 / 0.5)",
              color: "oklch(94% 0.005 250)",
              fontFamily: "var(--font-dm)",
              fontSize: "13px",
              borderRadius: "4px",
            },
          }}
        />
      </body>
    </html>
  );
}
