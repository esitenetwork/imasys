import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "AI活用システム開発｜こんなことが簡単にできるようになった - IMASYS",
    template: "%s | IMASYS - AI活用システム開発"
  },
  description: "AIのすごさに気づいていない経営者・担当者へ。「実はこんなことが簡単にできるようになった」をテーマに、1-3週間・50万円〜で実現可能なAI活用システムのアイデアと高速開発サービスをご提供します。",
  keywords: ["AI活用", "システム開発", "業務改善", "高速開発", "中小企業", "AI導入", "カスタムシステム", "業務自動化"],
  authors: [{ name: "IMASYS" }],
  creator: "IMASYS",
  publisher: "IMASYS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://imasys.jp'),
  alternates: {
    canonical: 'https://imasys.jp',
  },
  openGraph: {
    title: "AI活用システム開発｜こんなことが簡単にできるようになった - IMASYS",
    description: "AIのすごさに気づいていない経営者・担当者へ。「実はこんなことが簡単にできるようになった」をテーマに、AI活用システムのアイデアと高速開発をご提供。",
    url: 'https://imasys.jp',
    siteName: 'IMASYS',
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IMASYS - AI活用システム開発',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI活用システム開発｜こんなことが簡単にできるようになった - IMASYS",
    description: "AIのすごさに気づいていない経営者・担当者へ。AI活用システムのアイデアと高速開発をご提供。",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '', // Google Search Console認証コード（設定時に追加）
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6STCDKZN7T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-6STCDKZN7T');
          `}
        </Script>
        
        {/* 構造化データ（JSON-LD） */}
        <Script id="structured-data" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "IMASYS",
              "alternateName": "今どきシステム導入ラボ「イマシス」",
              "url": "https://imasys.jp",
              "logo": "https://imasys.jp/logo.png",
              "description": "AI活用による業務改善・自動化システムの高速開発を行う専門企業",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://imasys.jp/contact"
              },
              "sameAs": [],
              "foundingDate": "2025",
              "industry": "Software Development",
              "numberOfEmployees": "1-10"
            }
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}