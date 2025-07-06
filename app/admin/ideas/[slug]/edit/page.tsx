'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { syncAfterSave, showSyncResult } from '@/lib/syncUtils'
import { parseMDXContent } from '@/lib/mdxParser'

type Params = {
  params: Promise<{
    slug: string
  }>
}

export default function EditIdeaPage({ params }: Params) {
  const router = useRouter()
  const { slug } = use(params)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [idea, setIdea] = useState({
    title: '',
    category: '',
    tags: '',
    price_range: '',
    duration: '',
    source: '',
    status: 'draft',
    slug: '',
    notes: '',
    mdx_content: ''
  })

  useEffect(() => {
    fetchIdea()
  }, [slug])

  const fetchIdea = async () => {
    try {
      const response = await fetch('/api/admin/ideas')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.ideas) {
          const foundIdea = data.ideas.find((item: any) => item.slug === slug)
          if (foundIdea) {
            setIdea({
              title: foundIdea.title || '',
              category: foundIdea.category || '',
              tags: foundIdea.tags || '',
              price_range: foundIdea.price_range || '',
              duration: foundIdea.duration || '',
              source: foundIdea.source || '',
              status: foundIdea.status || 'draft',
              slug: foundIdea.slug || '',
              notes: foundIdea.notes || '',
              mdx_content: foundIdea.mdx_content || ''
            })
          } else {
            alert('アイデアが見つかりません')
            router.push('/admin/ideas')
          }
        }
      } else {
        alert('アイデアの取得に失敗しました')
        router.push('/admin/ideas')
      }
    } catch (error) {
      console.error('Error fetching idea:', error)
      alert('アイデアの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // MDXコンテンツが変更されたときの処理
  const handleMDXContentChange = (mdxContent: string) => {
    try {
      // MDXフロントマターを解析
      const parsedData = parseMDXContent(mdxContent)
      
      // 解析したデータで右側のフィールドを更新
      setIdea({
        ...idea,
        mdx_content: mdxContent,
        title: parsedData.title || idea.title,
        category: parsedData.category || idea.category,
        tags: parsedData.tags || idea.tags,
        price_range: parsedData.price || idea.price_range,
        duration: parsedData.duration || idea.duration,
        source: parsedData.source || idea.source,
        notes: parsedData.description || idea.notes
      })
    } catch (error) {
      console.error('MDX parsing error:', error)
      // エラーの場合はMDXコンテンツのみ更新
      setIdea({
        ...idea,
        mdx_content: mdxContent
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      console.log('Updating idea via API:', idea)

      // API Route経由でアイデアを更新
      const response = await fetch('/api/admin/ideas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(idea)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('API error:', result)
        throw new Error(result.error || 'API request failed')
      }

      console.log('API success:', result)

      // 自動同期を実行
      const syncResult = await syncAfterSave(idea, 'update')
      
      // 結果を通知
      showSyncResult(syncResult)
      
      // 一覧画面に戻る
      router.push('/admin/ideas')
    } catch (error) {
      console.error('Error updating idea:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`更新に失敗しました: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">読み込み中...</div>

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">アイデアを編集</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左カラム - MDXコンテンツ */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MDXコンテンツ <span className="text-red-500">*</span>
              </label>
              <textarea
                value={idea.mdx_content}
                onChange={(e) => handleMDXContentChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                rows={30}
                required
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || !idea.title}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                )}
                {saving ? '保存中...' : '更新する'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/ideas')}
                disabled={saving}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
            
            {saving && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span>API経由で更新中...</span>
                </div>
                <div className="mt-2">更新完了後、Google Sheetsに自動同期します</div>
              </div>
            )}
          </div>

          {/* 右カラム - その他の情報 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={idea.title}
                onChange={(e) => setIdea({ ...idea, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ
                </label>
                <select
                  value={idea.category}
                  onChange={(e) => setIdea({ ...idea, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">選択してください</option>
                  <option value="営業・販売">営業・販売</option>
                  <option value="経理・会計">経理・会計</option>
                  <option value="在庫・物流">在庫・物流</option>
                  <option value="顧客管理">顧客管理</option>
                  <option value="マーケティング">マーケティング</option>
                  <option value="人事・労務">人事・労務</option>
                  <option value="製造・生産">製造・生産</option>
                  <option value="カスタマーサポート">カスタマーサポート</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  value={idea.status}
                  onChange={(e) => setIdea({ ...idea, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="draft">下書き</option>
                  <option value="published">公開</option>
                  <option value="archived">アーカイブ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タグ（カンマ区切り）
              </label>
              <input
                type="text"
                value={idea.tags}
                onChange={(e) => setIdea({ ...idea, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="AI活用, 自動化, リアルタイム"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  価格帯
                </label>
                <select
                  value={idea.price_range}
                  onChange={(e) => setIdea({ ...idea, price_range: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">選択してください</option>
                  <option value="30万円">30万円</option>
                  <option value="50万円">50万円</option>
                  <option value="80万円">80万円</option>
                  <option value="100万円">100万円</option>
                  <option value="150万円">150万円</option>
                  <option value="要相談">要相談</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  構築期間
                </label>
                <select
                  value={idea.duration}
                  onChange={(e) => setIdea({ ...idea, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">選択してください</option>
                  <option value="1週間">1週間</option>
                  <option value="2週間">2週間</option>
                  <option value="3週間">3週間</option>
                  <option value="1ヶ月">1ヶ月</option>
                  <option value="2ヶ月">2ヶ月</option>
                  <option value="要相談">要相談</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                元ネタ（内部用）
              </label>
              <input
                type="text"
                value={idea.source}
                onChange={(e) => setIdea({ ...idea, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="n8n #949, Zapier template, GitHub project等"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スラッグ（URL用） <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={idea.slug}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">スラッグは変更できません</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                備考
              </label>
              <textarea
                value={idea.notes}
                onChange={(e) => setIdea({ ...idea, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}