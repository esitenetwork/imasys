'use client'

import Link from 'next/link'
import { useState } from 'react'

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

interface AdminDashboardClientProps {
  ideasData: Idea[]
  categoryCounts: Record<string, number>
  topTags: [string, number][]
}

export default function AdminDashboardClient({ 
  ideasData, 
  categoryCounts, 
  topTags 
}: AdminDashboardClientProps) {
  const [isExecuting, setIsExecuting] = useState(false)

  const handleN8nTrigger = async () => {
    setIsExecuting(true)
    try {
      const response = await fetch('/api/n8n/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_type: 'お任せ（人気ソースから自動選択）',
          category_preference: 'お任せ（AI自動選択）',
          quality_level: 'お任せ（標準品質）',
          generation_count: 1
        })
      });
      
      if (response.ok) {
        // 成功メッセージを表示してから少し待つ
        alert('n8nワークフローが実行されました！');
        // 3秒後にページをリロード
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        const errorData = await response.json();
        alert('エラーが発生しました: ' + errorData.error);
        setIsExecuting(false)
      }
    } catch (error) {
      alert('エラーが発生しました: ' + error);
      setIsExecuting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-gray-600">アイデアの統計情報</p>
        </div>
        <button
          onClick={handleN8nTrigger}
          disabled={isExecuting}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isExecuting 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isExecuting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              実行中...
            </span>
          ) : (
            'n8nワークフロー実行'
          )}
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">総アイデア数</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{ideasData.length}</p>
          <p className="mt-1 text-sm text-gray-600">公開中のアイデア</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">カテゴリ数</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{Object.keys(categoryCounts).length}</p>
          <p className="mt-1 text-sm text-gray-600">種類のカテゴリ</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">目標達成率</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round((ideasData.length / 1000) * 100)}%</p>
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
                        style={{ width: `${(count / ideasData.length) * 100}%` }}
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
    </div>
  )
} 