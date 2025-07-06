import IdeaCard from '@/components/IdeaCard'
import { getPublishedIdeas } from '@/lib/supabase-ideas'
import { Metadata } from 'next'

export const revalidate = 60 // 60秒ごとにキャッシュを更新

export const metadata: Metadata = {
  title: "AI活用アイデア・ギャラリー｜こんなシステムが簡単に作れるようになった",
  description: "「AIって何ができるの？」「システム開発は高額？」そんな疑問をお持ちの経営者・担当者へ。実は1-3週間・50万円〜で様々なシステムが作れるようになりました。豊富なアイデア・ギャラリーで新しい可能性を発見してください。",
  keywords: ["AI活用", "システム開発アイデア", "高速開発", "中小企業システム", "AI導入", "カスタムシステム", "業務改善"],
  openGraph: {
    title: "AI活用アイデア・ギャラリー｜こんなシステムが簡単に作れるようになった",
    description: "「AIって何ができるの？」そんな疑問をお持ちの経営者・担当者へ。実は1-3週間・50万円〜で様々なシステムが作れるようになりました。",
    url: 'https://imasys.jp',
    images: [
      {
        url: '/og-image-home.jpg',
        width: 1200,
        height: 630,
        alt: 'IMASYS - AI活用アイデア・ギャラリー',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI活用アイデア・ギャラリー｜こんなシステムが簡単に作れるようになった",
    description: "「AIって何ができるの？」そんな疑問をお持ちの経営者・担当者へ。豊富なアイデア・ギャラリーで新しい可能性を発見。",
    images: ['/og-image-home.jpg'],
  },
  alternates: {
    canonical: 'https://imasys.jp',
  },
}

export default async function HomePage() {
  // Supabaseからアイデアを取得
  const ideas = await getPublishedIdeas()

  // カテゴリ別に集計
  const categories = ideas.reduce((acc, idea) => {
    acc[idea.category] = (acc[idea.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* 構造化データ（WebSite） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "IMASYS",
            "url": "https://imasys.jp",
            "description": "AI活用システムのアイデア・ギャラリーと高速開発サービス",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://imasys.jp/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "IMASYS"
            }
          })
        }}
      />

      {/* ヒーローセクション */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI×業務改善アイデア集
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            自社専用にカスタマイズされたオリジナルのシステムが早く！安く！導入できる！
          </p>
          <div className="flex gap-4 justify-center mb-8">
            <div className="bg-white rounded-lg shadow-sm px-6 py-3">
              <span className="text-3xl font-bold text-blue-600">{ideas.length}</span>
              <span className="text-gray-600 ml-2">個のアイデア</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm px-6 py-3">
              <span className="text-3xl font-bold text-blue-600">{Object.keys(categories).length}</span>
              <span className="text-gray-600 ml-2">カテゴリ</span>
            </div>
          </div>
        </div>
      </section>

      {/* フィルターセクション */}
      <section className="sticky top-0 bg-white shadow-sm z-10 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm">
              すべて ({ideas.length})
            </button>
            {Object.entries(categories).map(([category, count]) => (
              <button
                key={category}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
              >
                {category} ({count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* アイデア一覧 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                slug={idea.slug}
                title={idea.title}
                description={idea.description}
                category={idea.category}
                tags={idea.tags}
                price={idea.price}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}