import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { getServerThemeConfig, generateThemeStyles, generateThemeScript, generateCriticalCSS } from "@/lib/theme-preloader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | BookBharat - Your Knowledge Partner",
    default: "BookBharat - Your Knowledge Partner | Online Bookstore India",
  },
  description: "Discover millions of books online at BookBharat. India's leading bookstore with fiction, non-fiction, academic books and more. Fast delivery, secure payment, best prices.",
  keywords: ["books", "online bookstore", "india", "fiction", "non-fiction", "academic books", "bookbharat"],
  authors: [{ name: "BookBharat Team" }],
  creator: "BookBharat",
  publisher: "BookBharat",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "BookBharat - Your Knowledge Partner",
    description: "Discover millions of books online at BookBharat. India's leading bookstore.",
    siteName: "BookBharat",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookBharat - Your Knowledge Partner",
    description: "Discover millions of books online at BookBharat. India's leading bookstore.",
    creator: "@bookbharat",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch theme configuration on server-side
  const themeConfig = await getServerThemeConfig();
  const themeStyles = generateThemeStyles(themeConfig);
  const themeScript = generateThemeScript(themeConfig);
  const criticalCSS = generateCriticalCSS(themeConfig);

  return (
    <html lang="en" style={themeStyles}>
      <head>
        {/* Inject critical CSS to prevent flash */}
        {criticalCSS && (
          <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        )}
      </head>
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <Script id="logger-global" strategy="beforeInteractive">
          {`
            (function(){
              if (typeof window !== 'undefined' && typeof window.logger === 'undefined') {
                window.logger = {
                  log: console.log.bind(console),
                  error: console.error.bind(console),
                  warn: console.warn.bind(console),
                  info: console.info.bind(console)
                };
              }
            })();
          `}
        </Script>

        {/* Preload theme before any other JavaScript executes */}
        {themeScript && (
          <Script id="theme-preloader" strategy="beforeInteractive">
            {themeScript}
          </Script>
        )}

        <ConfigProvider initialTheme={themeConfig}>
          <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>

            <Footer />
            <MobileBottomNav />
          </div>
        </ConfigProvider>
      </body>
    </html>
  );
}
