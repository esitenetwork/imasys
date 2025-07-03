import IdeaCard from '@/components/IdeaCard'
import { getPublishedIdeas } from '@/lib/supabase-ideas'

export const revalidate = 60 // 60秒ごとにキャッシュを更新

export default async function HomePage() {
  // Supabaseからアイデアを取得
  const ideas = await getPublishedIdeas()

  // カテゴリ別に集計
  const categories = ideas.reduce((acc, idea) => {
    acc[idea.category] = (acc[idea.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // タグを集計
  const allTags = ideas.flatMap(idea => idea.tags)
  const uniqueTags = [...new Set(allTags)]

  return (
    <div>
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI×業務改善アイデア集
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            中小企業の「こんなことできたらいいのに」を実現する、
            AIを活用した業務改善システムのアイデアを提案します
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

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            あなたの業務改善アイデアを実現します
          </h2>
          <p className="text-xl mb-8">
            気になるアイデアがありましたら、お気軽にご相談ください。
            御社に最適なシステムを高速開発でご提供します。
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100"
          >
            無料相談はこちら
          </a>
        </div>
      </section>
    </div>
  )
}