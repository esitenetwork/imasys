import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export default async function AdminIdeasPage() {
  // データ取得部分のみ変更
  const { data: ideasData } = await supabaseAdmin
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false })

  // MDXと同じ形式に変換
  const ideas = ideasData?.map(idea => ({
    slug: idea.slug,
    title: idea.title,
    category: idea.category || '',
    price: idea.price_range || '',
    tags: idea.tags ? idea.tags.split(',').map(t => t.trim()) : [],
    source: idea.source
  })) || []
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">アイデア一覧</h1>
          <p className="mt-2 text-gray-600">現在 {ideas.length} 個のアイデアが登録されています</p>
        </div>
        <Link
          href="/admin/ideas/new"
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
                    <div className="text-xs text-gray-400">
                      元ネタ: {idea.source || '未設定'}
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
                  <Link
                    href={`/admin/ideas/${idea.slug}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}