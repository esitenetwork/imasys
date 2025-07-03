'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// 型定義
interface IdeaData {
  id: number;
  slug: string;
  title: string;
  category?: string;
  price_range?: string;
  tags?: string;
  source?: string;
  status: string;
  created_at: string;
}

interface ProcessedIdea {
  id: number;
  slug: string;
  title: string;
  category: string;
  price: string;
  tags: string[];
  source?: string;
  status: string;
}

export default function AdminIdeasPage() {
  const [ideas, setIdeas] = useState<ProcessedIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  // アイデア一覧を取得
  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/admin/ideas')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.ideas) {
          // データを変換
          const processedIdeas: ProcessedIdea[] = data.ideas.map((ideaItem: IdeaData) => ({
            id: ideaItem.id,
            slug: ideaItem.slug,
            title: ideaItem.title,
            category: ideaItem.category || '',
            price: ideaItem.price_range || '',
            tags: ideaItem.tags ? ideaItem.tags.split(',').map((tagItem: string) => tagItem.trim()) : [],
            source: ideaItem.source,
            status: ideaItem.status
          }))
          setIdeas(processedIdeas)
        }
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  // 削除処理
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を削除してもよろしいですか？\n\nこの操作は取り消せません。`)) {
      return
    }

    setDeleting(id)

    try {
      const response = await fetch(`/api/admin/ideas/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // 成功: 一覧から削除
        setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id))
        alert(`「${title}」を削除しました。`)
      } else {
        alert(`削除に失敗しました: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除中にエラーが発生しました。')
    } finally {
      setDeleting(null)
    }
  }

  // 初期ロード
  useEffect(() => {
    fetchIdeas()
  }, [])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">アイデアを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
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
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                価格
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                タグ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ideas.map((ideaRow: ProcessedIdea) => (
              <tr key={ideaRow.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-left">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {ideaRow.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {ideaRow.slug}
                    </div>
                    <div className="text-xs text-gray-400">
                      元ネタ: {ideaRow.source || '未設定'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {ideaRow.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-900">
                  {ideaRow.price}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ideaRow.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ideaRow.status === 'published' ? '公開中' : '下書き'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {ideaRow.tags.slice(0, 3).map((tagElement: string) => (
                      <span
                        key={tagElement}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {tagElement}
                      </span>
                    ))}
                    {ideaRow.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{ideaRow.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/ideas/${ideaRow.slug}`}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                    >
                      表示
                    </Link>
                    <Link
                      href={`/admin/ideas/${ideaRow.slug}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(ideaRow.id, ideaRow.title)}
                      disabled={deleting === ideaRow.id}
                      className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {deleting === ideaRow.id ? (
                        <>
                          <div className="animate-spin w-3 h-3 border border-red-600 border-t-transparent rounded-full"></div>
                          削除中
                        </>
                      ) : (
                        '削除'
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ideas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">アイデアがまだ登録されていません。</p>
            <Link
              href="/admin/ideas/new"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              最初のアイデアを追加
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}