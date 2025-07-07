export default function ReferencesPage() {
  const referenceCategories = [
    {
      title: "ギャラリー型プラットフォーム（国内）",
      description: "カード型レイアウト・カテゴリ分けの参考",
      sites: [
        { name: "Pinterest", url: "https://pinterest.jp/", description: "カード型レイアウトの王道" },
        { name: "BASE", url: "https://thebase.in/", description: "商品ギャラリー、カテゴリ分け" },
        { name: "minne", url: "https://minne.com/", description: "ハンドメイド作品ギャラリー" },
        { name: "Creema", url: "https://creema.jp/", description: "アイテム探索UI" },
        { name: "食べログ", url: "https://tabelog.com/", description: "条件絞り込み機能" }
      ]
    },
    {
      title: "ギャラリー型プラットフォーム（海外）",
      description: "デザイン・レイアウトの参考",
      sites: [
        { name: "Dribbble", url: "https://dribbble.com/", description: "デザイン作品ギャラリー" },
        { name: "Unsplash", url: "https://unsplash.com/", description: "美しい写真ギャラリー" },
        { name: "Product Hunt", url: "https://producthunt.com/", description: "プロダクト発見・探索" },
        { name: "Behance", url: "https://behance.net/", description: "プロジェクト紹介ギャラリー" }
      ]
    },
    {
      title: "検索・フィルタリング機能参考",
      description: "高度な絞り込み機能の参考",
      sites: [
        { name: "価格.com", url: "https://kakaku.com/", description: "詳細な条件絞り込み" },
        { name: "じゃらん", url: "https://jalan.net/", description: "カテゴリとフィルタの組み合わせ" },
        { name: "Amazon", url: "https://amazon.co.jp/", description: "複数条件での絞り込み" }
      ]
    },
    {
      title: "ビジネス系プラットフォーム",
      description: "企業・サービス紹介の参考",
      sites: [
        { name: "ココナラ", url: "https://coconala.com/", description: "スキルマーケットプレイス" },
        { name: "Wantedly", url: "https://wantedly.com/", description: "企業・プロジェクト紹介" }
      ]
    }
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">UI/UX参考サイト</h1>
        <p className="mt-2 text-gray-600">
          イマシスのUI/UXデザイン改善に役立つ参考サイト集です。各サイトの特徴的な機能やデザインを参考にしてください。
        </p>
      </div>

      <div className="space-y-8">
        {referenceCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h2>
              <p className="text-gray-600">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.sites.map((site, siteIndex) => (
                <div key={siteIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{site.name}</h3>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      訪問
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <p className="text-gray-600 text-sm">{site.description}</p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {site.url}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">使い方のコツ</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• 各サイトで「検索・フィルタリング」の使い勝手を確認</li>
          <li>• カード型レイアウトの余白・配置バランスをチェック</li>
          <li>• カテゴリ表示・ナビゲーションの見やすさを参考に</li>
          <li>• モバイル表示での使いやすさも確認</li>
          <li>• 色使い・フォント・アイコンのデザインを参考に</li>
        </ul>
      </div>
    </div>
  )
}