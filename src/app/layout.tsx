import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeaderDynamic as Header } from "@/components/layout/HeaderDynamic";
import Script from "next/script";
import dynamic from "next/dynamic";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Lazy load Footer component (below-the-fold content)
const FooterServer = dynamic(() => import("@/components/layout/FooterServer"), {
  loading: () => <div className="h-96 bg-background border-t border-border" />
});

// Lazy load non-critical providers (Auth, Cart)
const ClientProviders = dynamic(() => import("@/components/providers/ClientProviders").then(mod => ({ default: mod.ClientProviders })), {
  ssr: true,
  loading: () => <div>Loading...</div>
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <ConfigProvider>
          <ClientProviders>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <FooterServer />
              <Toaster />
              <SonnerToaster />
            </div>
          </ClientProviders>
        </ConfigProvider>
      </body>
    </html>
  );
}
