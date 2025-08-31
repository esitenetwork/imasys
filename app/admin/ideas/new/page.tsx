'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { syncAfterSave, showSyncResult } from '@/lib/syncUtils'
import { parseMDXContent, generateSlugFromTitle } from '@/lib/mdxParser'

export default function NewIdeaPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [idea, setIdea] = useState({
    title: '',
    category: '',
    tags: '',
    source: '',
    status: 'draft',
    slug: '',
    notes: '',
    mdx_content: ''
  })

  // 英数字のみのスラッグ生成
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // 英数字以外を-に変換
      .replace(/^-+|-+$/g, '')      // 前後の-を削除
      .substring(0, 50)             // 長さ制限
  }

  const handleTitleChange = (title: string) => {
    setIdea({
      ...idea,
      title,
      slug: generateSlug(title)
    })
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
        source: parsedData.source || idea.source,
        slug: parsedData.slug || (parsedData.title ? generateSlugFromTitle(parsedData.title) : idea.slug),
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

  // フォーム送信処理（ステータス付き）
  const handleSubmit = async (status: 'draft' | 'published') => {
    if (status === 'draft') {
      setSavingDraft(true)
    } else {
      setSaving(true)
    }

    try {
      console.log('Submitting idea with data:', {
        title: idea.title,
        category: idea.category,
        tags: idea.tags,
        source: idea.source,
        status: status,
        slug: idea.slug,
        notes: idea.notes,
        mdx_content: idea.mdx_content ? idea.mdx_content.substring(0, 100) + '...' : ''
      })

      // API Route経由でアイデアを保存
      const insertData = {
        title: idea.title,
        category: idea.category,
        tags: idea.tags,
        source: idea.source,
        status: status,
        slug: idea.slug,
        notes: idea.notes,
        mdx_content: idea.mdx_content
      }

      console.log('Sending data to API:', insertData)

      const response = await fetch('/api/admin/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insertData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('API error:', result)
        throw new Error(result.error || 'API request failed')
      }

      console.log('API success:', result)

      // 自動同期を実行
      const syncResult = await syncAfterSave(idea, 'create')
      
      // 結果を通知
      showSyncResult(syncResult)
      
      // 一覧画面に戻る
      router.push('/admin/ideas')
    } catch (error) {
      console.error('Error creating idea:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`追加に失敗しました: ${errorMessage}`)
    } finally {
      setSaving(false)
      setSavingDraft(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">新規アイデアを追加</h1>
      
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
              placeholder={`---
title: "アイデアのタイトル"
description: "システムの説明"
category: "カテゴリ"
tags: ["タグ1", "タグ2"]
source: "n8n #949"
---

## こんなお悩みありませんか？

- 課題1
- 課題2

## 解決策

解決策の概要を記述

## 主な機能

- 機能1
- 機能2

## 導入効果

- 効果1
- 効果2`}
            />
          </div>
          
          {/* 保存ボタン */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={savingDraft || saving || !idea.title || !idea.mdx_content}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
            >
              {savingDraft && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              )}
              下書き保存
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={saving || savingDraft || !idea.title || !idea.mdx_content}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              )}
              公開する
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/ideas')}
              disabled={saving || savingDraft}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
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
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

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
              onChange={(e) => setIdea({ ...idea, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-sm text-gray-500 mt-1">英数字のみでタイトルから自動生成されます。必要に応じて編集してください。</p>
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
    </div>
  )
}