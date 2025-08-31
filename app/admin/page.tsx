import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import AdminDashboardClient from './AdminDashboardClient'

// 動的レンダリングを強制（プリレンダリングを無効化）
export const dynamic = 'force-dynamic'

// Supabaseから取得するアイデアの型定義
interface Idea {
  id: number
  created_at: string
  title: string
  category: string | null
  tags: string | null
  price_range: string | null
  duration: string | null
  source: string | null
  status: string
  slug: string
  notes: string | null
  mdx_content: string
  updated_at: string
}

export default async function AdminDashboard() {
  // Supabaseクライアントが利用できない場合の対応
  if (!supabase) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-red-600">Supabaseクライアントが利用できません</div>
      </div>
    )
  }

  // Supabaseからアイデアを取得
  const { data: ideas, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ideas:', error)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-red-600">エラーが発生しました: {error.message}</div>
      </div>
    )
  }

  const ideasData: Idea[] = ideas || []
  
  // カテゴリ別の集計
  const categoryCounts: Record<string, number> = {}
  ideasData.forEach(idea => {
    if (idea.category) {
      categoryCounts[idea.category] = (categoryCounts[idea.category] || 0) + 1
    }
  })

  // タグの集計
  const tagCounts: Record<string, number> = {}
  ideasData.forEach(idea => {
    if (idea.tags) {
      const tags = idea.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return (
    <AdminDashboardClient 
      ideasData={ideasData}
      categoryCounts={categoryCounts}
      topTags={topTags}
    />
  )
}