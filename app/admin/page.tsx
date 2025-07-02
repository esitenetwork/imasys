import { getAllIdeas } from '@/lib/mdx'

export default async function AdminDashboard() {
  const ideas = await getAllIdeas()
  
  // カテゴリ別の集計
  const categoryCounts = ideas.reduce((acc, idea) => {
    acc[idea.category] = (acc[idea.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // タグの集計
  const tagCounts = ideas.reduce((acc, idea) => {
    idea.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-2 text-gray-600">アイデアの統計情報</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">総アイデア数</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{ideas.length}</p>
          <p className="mt-1 text-sm text-gray-600">公開中のアイデア</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">カテゴリ数</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{Object.keys(categoryCounts).length}</p>
          <p className="mt-1 text-sm text-gray-600">種類のカテゴリ</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">目標達成率</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round((ideas.length / 1000) * 100)}%</p>
          <p className="mt-1 text-sm text-gray-600">1,000個目標</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* カテゴリ別 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">カテゴリ別アイデア数</h2>
          <div className="space-y-3">
            {Object.entries(categoryCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-700">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / ideas.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-10 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 人気タグ */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">人気のタグ TOP10</h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag} ({count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/import"
            className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow text-center"
          >
            <div className="text-blue-600 font-semibold">新規アイデアをインポート</div>
            <p className="text-sm text-gray-600 mt-1">ChatGPTで作成したMDXを追加</p>
          </a>
          
          <a
            href="/admin/ideas"
            className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow text-center"
          >
            <div className="text-blue-600 font-semibold">アイデア一覧を見る</div>
            <p className="text-sm text-gray-600 mt-1">すべてのアイデアを管理</p>
          </a>
          
          <a
            href="/"
            target="_blank"
            className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow text-center"
          >
            <div className="text-blue-600 font-semibold">公開サイトを確認</div>
            <p className="text-sm text-gray-600 mt-1">実際の表示を確認</p>
          </a>
        </div>
      </div>
    </div>
  )
}