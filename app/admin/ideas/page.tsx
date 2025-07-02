import { getAllIdeas } from '@/lib/mdx'
import Link from 'next/link'

export default async function AdminIdeasPage() {
  const ideas = await getAllIdeas()
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">アイデア一覧</h1>
          <p className="mt-2 text-gray-600">現在 {ideas.length} 個のアイデアが登録されています</p>
        </div>
        <Link
          href="/admin/import"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新規追加
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                価格
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タグ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ideas.map((idea) => (
              <tr key={idea.slug} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {idea.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {idea.slug}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {idea.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {idea.price}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {idea.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{idea.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/ideas/${idea.slug}`}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    表示
                  </Link>
                  <button
                    className="text-gray-400 cursor-not-allowed"
                    disabled
                    title="編集機能は準備中です"
                  >
                    編集
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 元ネタ情報（管理画面のみ表示） */}
      <div className="mt-8 bg-yellow-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">元ネタ情報（内部用）</h2>
        <div className="space-y-2 text-sm">
          {ideas.map((idea) => (
            <div key={idea.slug} className="flex">
              <span className="font-medium w-1/3">{idea.title}:</span>
              <span className="text-gray-600">{idea.source || '未設定'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}