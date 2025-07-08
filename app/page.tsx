import { getPublishedIdeas } from '@/lib/supabase-ideas'
import ClientHomePage from './ClientHomePage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IMASYS（イマシス）| いまどきシステム導入ラボ',
  description: 'AI活用システムのアイデア・ギャラリー。従来のシステム開発コストの常識を覆す、自社専用オリジナルシステムの高速導入サービス。数百万円かかると思われていたシステムが、実はもっと短期間・適正価格で実現可能です。',
  keywords: 'AI活用, システム開発, 高速開発, 業務改善, DX, 自動化, カスタムシステム',
  openGraph: {
    title: 'IMASYS（イマシス）| いまどきシステム導入ラボ',
    description: '自社専用にカスタマイズされたオリジナルのシステムが早く！安く！導入できる！AI活用システムの豊富なアイデアから、あなたの業務に最適なソリューションを見つけてください。',
    url: 'https://imasys.jp',
    siteName: 'IMASYS',
    images: [
      {
        url: 'https://imasys.jp/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IMASYS（イマシス）- いまどきシステム導入ラボ'
      }
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IMASYS（イマシス）| いまどきシステム導入ラボ',
    description: '自社専用にカスタマイズされたオリジナルのシステムが早く！安く！導入できる！',
    images: ['https://imasys.jp/og-image.png'],
  },
  alternates: {
    canonical: 'https://imasys.jp'
  }
}

export default async function HomePage() {
  try {
    const ideas = await getPublishedIdeas()
    return <ClientHomePage ideas={ideas} />
  } catch (error) {
    console.error('Error in HomePage:', error)
    return <ClientHomePage ideas={[]} />
  }
}