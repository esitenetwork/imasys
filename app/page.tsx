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

      {/* 2カラムレイアウト */}
      <div className="flex">
        {/* 左カラム - 固定サイドバー */}
        <aside 
          className="w-80 bg-gray-50 border-r border-gray-200 p-6 fixed left-0 top-16 h-full overflow-y-auto custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'transparent transparent',
            paddingBottom: '50px'
          }}
        >
          <div className="space-y-8">
            {/* 統計情報 */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">統計情報</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">総アイデア数</span>
                  <span className="text-lg font-bold text-blue-600">{ideas.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">カテゴリ数</span>
                  <span className="text-lg font-bold text-blue-600">{Object.keys(categories).length}</span>
                </div>
              </div>
            </div>

            {/* 区切り線 */}
            <hr className="border-gray-300" />

            {/* カテゴリフィルター */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">カテゴリで絞り込み</h2>
              <div className="space-y-2">
                <label className="flex items-center w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                  すべて ({ideas.length})
                </label>
                {Object.entries(categories).map(([category, count]) => (
                  <label 
                    key={category}
                    className="flex items-center w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                    {category} ({count})
                  </label>
                ))}
              </div>
            </div>

            {/* 区切り線 */}
            <hr className="border-gray-300" />

            {/* タグフィルター */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">タグで絞り込み</h2>
              <div className="space-y-2">
                {/* よく使われるタグを表示 */}
                {['AI活用', '自動化', 'LINE連携', 'PDF生成', 'メール送信', 'データ分析', 'リアルタイム', '情報一元化'].map((tag) => {
                  // そのタグを持つアイデアの数を計算
                  const tagCount = ideas.filter(idea => {
                    if (!idea.tags) return false;
                    
                    // tagsが配列の場合
                    if (Array.isArray(idea.tags)) {
                      return idea.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()));
                    }
                    
                    // tagsが文字列の場合
                    if (typeof idea.tags === 'string') {
                      return idea.tags.toLowerCase().includes(tag.toLowerCase());
                    }
                    
                    return false;
                  }).length;
                  
                  if (tagCount === 0) return null;
                  
                  return (
                    <label 
                      key={tag}
                      className="flex items-center w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <input 
                        type="checkbox" 
                        className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                      />
                      #{tag} ({tagCount})
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* メインカラム */}
        <main className="flex-1 ml-80">
          {/* ヒーローセクション - メインカラム内 */}
          <section className="bg-gradient-to-b from-blue-50 to-white py-12">
            <div className="px-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                AI×業務改善アイデア集
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                自社専用にカスタマイズされたオリジナルのシステムが早く！安く！導入できる！
              </p>
            </div>
          </section>

          {/* アイデア一覧セクション - メインカラム内 */}
          <section className="p-6">
            <div 
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
              }}
            >
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
          </section>
        </main>
      </div>
    </div>
  )
}