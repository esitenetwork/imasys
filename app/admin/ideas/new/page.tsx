'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewIdeaPage() {
  const router = useRouter()
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9ぁ-んァ-ヶー一-龠]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setIdea({
      ...idea,
      title,
      slug: generateSlug(title)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // スラッグの重複チェック
      const { data: existing } = await supabase
        .from('ideas')
        .select('slug')
        .eq('slug', idea.slug)
        .single()

      if (existing) {
        alert('このスラッグは既に使用されています。タイトルを変更してください。')
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('ideas')
        .insert({
          title: idea.title,
          category: idea.category,
          tags: idea.tags,
          price_range: idea.price_range,
          duration: idea.duration,
          source: idea.source,
          status: idea.status,
          slug: idea.slug,
          notes: idea.notes,
          mdx_content: idea.mdx_content
        })

      if (error) throw error

      alert('アイデアを追加しました')
      router.push('/admin/ideas')
    } catch (error) {
      console.error('Error creating idea:', error)
      alert('追加に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">新規アイデアを追加</h1>
      
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
                onChange={(e) => setIdea({ ...idea, mdx_content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                rows={30}
                required
                placeholder={`---
title: "アイデアのタイトル"
category: "カテゴリ"
tags: ["タグ1", "タグ2"]
price: "30万円〜"
duration: "2週間"
---

## 解決できる課題

このシステムで解決できる課題を記述

## 解決策の概要

どのように課題を解決するかを記述

## 主な機能

- 機能1
- 機能2
- 機能3

## 導入効果

- 効果1
- 効果2
- 効果3

## 使用技術

- 技術1
- 技術2`}
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '追加中...' : '追加する'}
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
                onChange={(e) => handleTitleChange(e.target.value)}
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
                  <option value="10万円〜">10万円〜</option>
                  <option value="30万円〜">30万円〜</option>
                  <option value="50万円〜">50万円〜</option>
                  <option value="100万円〜">100万円〜</option>
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
                onChange={(e) => setIdea({ ...idea, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <p className="text-sm text-gray-500 mt-1">タイトルから自動生成されます。必要に応じて編集してください。</p>
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