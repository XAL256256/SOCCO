import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
  keywords: [
    "SACCO",
    "savings",
    "credit cooperative",
    "Uganda",
    "NBOOG",
    "financial logging",
  ],
  formatDetection: { email: false, address: false, telephone: false },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fef4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1917" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="font-body antialiased text-gray-900 bg-gray-50 selection:bg-primary-200">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "16px",
              background: "#1c1917",
              color: "#fff",
              fontFamily: "var(--font-body)",
              padding: "12px 18px",
              boxShadow:
                "0 10px 30px -10px rgba(236,90,46,0.25), 0 0 0 1px rgba(255,255,255,0.05)",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#dc2626", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
