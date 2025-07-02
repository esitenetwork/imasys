'use client'

import { useState } from 'react'

type ExtractedData = {
  title: string
  description: string
  category: string
  tags: string[]
  price: string
  duration: string
  targetUsers?: string[]
  source: string
  content: string
}

export default function AdminImportPage() {
  const [mdxContent, setMdxContent] = useState('')
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const extractMetadata = (content: string): ExtractedData | null => {
    try {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (!frontmatterMatch) {
        throw new Error('メタデータが見つかりません')
      }

      const frontmatter = frontmatterMatch[1]
      const metadata: any = {}

      // タイトル
      const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/)
      metadata.title = titleMatch ? titleMatch[1] : ''

      // 説明
      const descMatch = frontmatter.match(/description:\s*"([^"]+)"/)
      metadata.description = descMatch ? descMatch[1] : ''

      // カテゴリ
      const categoryMatch = frontmatter.match(/category:\s*"([^"]+)"/)
      metadata.category = categoryMatch ? categoryMatch[1] : ''

      // 価格
      const priceMatch = frontmatter.match(/price:\s*"([^"]+)"/)
      metadata.price = priceMatch ? priceMatch[1] : ''

      // 期間
      const durationMatch = frontmatter.match(/duration:\s*"([^"]+)"/)
      metadata.duration = durationMatch ? durationMatch[1] : ''

      // 元ネタ
      const sourceMatch = frontmatter.match(/source:\s*"([^"]+)"/)
      metadata.source = sourceMatch ? sourceMatch[1] : ''

      // タグ（配列）
      const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]+)\]/)
      if (tagsMatch) {
        metadata.tags = tagsMatch[1].split(',').map(tag => 
          tag.trim().replace(/['"]/g, '')
        )
      } else {
        metadata.tags = []
      }

      // ターゲットユーザー（配列）
      const targetUsersMatch = frontmatter.match(/targetUsers:\s*\[([^\]]+)\]/)
      if (targetUsersMatch) {
        metadata.targetUsers = targetUsersMatch[1].split(',').map(user => 
          user.trim().replace(/['"]/g, '')
        )
      }

      // 本文
      metadata.content = content.replace(/^---[\s\S]*?---\n/, '')

      return metadata as ExtractedData
    } catch (error: any) {
      setStatus(`エラー: ${error.message}`)
      return null
    }
  }

  const handleExtract = () => {
    const data = extractMetadata(mdxContent)
    if (data) {
      setExtractedData(data)
      setStatus('メタデータを抽出しました')
    }
  }

  const handleSave = async () => {
    if (!extractedData) return

    setIsLoading(true)
    setStatus('保存中...')

    try {
      const response = await fetch('/api/admin/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...extractedData,
          mdxContent: mdxContent
        })
      })

      const result = await response.json()

      if (response.ok) {
        setStatus('✅ 保存完了！スプレッドシートも更新されました')
        // フォームをリセット
        setTimeout(() => {
          setMdxContent('')
          setExtractedData(null)
          setStatus('')
        }, 3000)
      } else {
        setStatus(`❌ エラー: ${result.error}`)
      }
    } catch (error: any) {
      setStatus(`❌ エラー: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">アイデア インポート</h1>
        <p className="mt-2 text-gray-600">ChatGPTで作成したMDXコンテンツを貼り付けて、自動保存します</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側: MDX入力 */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">MDXコンテンツ</h2>
            <textarea
              value={mdxContent}
              onChange={(e) => setMdxContent(e.target.value)}
              className="w-full h-[500px] p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`---
title: "アイデアのタイトル"
description: "説明文"
category: "カテゴリ"
tags: ["タグ1", "タグ2"]
price: "初期費用 30万円〜"
duration: "構築期間 2週間"
targetUsers: ["中小企業", "個人事業主"]
source: "元ネタ情報"
---

## 本文がここに入ります...`}
            />
            <button
              onClick={handleExtract}
              disabled={!mdxContent}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              メタデータを抽出
            </button>
          </div>
        </div>

        {/* 右側: 抽出結果 */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">抽出されたデータ</h2>
            
            {extractedData ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                  <div className="p-3 bg-gray-50 rounded-lg">{extractedData.title}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">{extractedData.description}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                    <div className="p-3 bg-gray-50 rounded-lg">{extractedData.category}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">価格</label>
                    <div className="p-3 bg-gray-50 rounded-lg">{extractedData.price}</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {extractedData.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">元ネタ（非公開）</label>
                  <div className="p-3 bg-yellow-50 rounded-lg text-sm font-mono">{extractedData.source}</div>
                </div>
                
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? '保存中...' : '保存してスプレッドシートを更新'}
                </button>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p>MDXコンテンツを貼り付けて</p>
                <p>「メタデータを抽出」をクリックしてください</p>
              </div>
            )}
          </div>

          {/* ステータス表示 */}
          {status && (
            <div className={`mt-4 p-4 rounded-lg ${
              status.includes('エラー') || status.includes('❌') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}