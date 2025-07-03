'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        console.error('Error fetching idea:', error)
        alert('アイデアの取得に失敗しました')
        router.push('/admin/ideas')
        return
      }
      if (data) {
        setIdea({
          title: data.title || '',
          category: data.category || '',
          tags: data.tags || '',
          price_range: data.price_range || '',
          duration: data.duration || '',
          source: data.source || '',
          status: data.status || 'draft',
          slug: data.slug || '',
          notes: data.notes || '',
          mdx_content: data.mdx_content || ''
        })
      }
    } catch (error) {
      console.error('Error fetching idea:', error)
      alert('アイデアの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('ideas')
        .update({
          title: idea.title,
          category: idea.category,
          tags: idea.tags,
          price_range: idea.price_range,
          duration: idea.duration,
          source: idea.source,
          status: idea.status,
          notes: idea.notes,
          mdx_content: idea.mdx_content,
          updated_at: new Date().toISOString()
        })
        .eq('slug', slug)

      if (error) throw error

      alert('更新しました')
      router.push('/admin/ideas')
    } catch (error) {
      console.error('Error updating idea:', error)
      alert('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">読み込み中...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">アイデアを編集</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左カラム - MDXコンテンツ */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MDXコンテンツ
              </label>
              <textarea
                value={idea.mdx_content}
                onChange={(e) => setIdea({ ...idea, mdx_content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                rows={30}
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '更新する'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/ideas')}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
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
                <input
                  type="text"
                  value={idea.category}
                  onChange={(e) => setIdea({ ...idea, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
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
                <input
                  type="text"
                  value={idea.price_range}
                  onChange={(e) => setIdea({ ...idea, price_range: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="30万円〜"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  構築期間
                </label>
                <input
                  type="text"
                  value={idea.duration}
                  onChange={(e) => setIdea({ ...idea, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="2週間"
                />
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
                placeholder="n8n #949"
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