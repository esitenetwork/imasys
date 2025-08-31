'use client'

import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import Link from 'next/link'

// 型定義
interface IdeaData {
  id: number;
  slug: string;
  title: string;
  category?: string;
  tags?: string;
  source?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  sheets_id?: string; // Google Sheets ID
}

interface ProcessedIdea {
  id: number;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  source?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  sheets_id?: string; // Google Sheets ID
}

export default function AdminIdeasPage() {
  const [ideas, setIdeas] = useState<ProcessedIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const [newIdeas, setNewIdeas] = useState<Set<number>>(new Set())
  const [placeholderIdeas, setPlaceholderIdeas] = useState<Set<string>>(new Set())
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)

  // アイデア一覧を取得
  const fetchIdeas = async (detectNewIdeas = false) => {
    try {
      const response = await fetch('/api/admin/ideas')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.ideas) {
          // データを変換
          const processedIdeas: ProcessedIdea[] = data.ideas.map((ideaItem: IdeaData) => {
            const processed = {
              id: ideaItem.id,
              slug: ideaItem.slug,
              title: ideaItem.title,
              category: ideaItem.category || '',
              tags: ideaItem.tags ? ideaItem.tags.split(',').map((tagItem: string) => tagItem.trim()) : [],
              source: ideaItem.source,
              status: ideaItem.status,
              created_at: ideaItem.created_at,
              updated_at: ideaItem.updated_at,
              sheets_id: ideaItem.sheets_id
            }
            
            // デバッグ用：ステータスをログ出力
            if (ideaItem.title && ideaItem.status !== 'published') {
              console.log(`アイデア「${ideaItem.title}」のステータス:`, ideaItem.status)
            }
            return processed
          })
          
          // 新しいアイデアを検出
          if (detectNewIdeas) {
            const currentIdeaCount = ideas.length
            const newIdeaCount = processedIdeas.length
            
            if (newIdeaCount > currentIdeaCount) {
              // 新しいアイデアが追加された
              const newIdeaIds = new Set<number>()
              const newestIdeas = processedIdeas.slice(0, newIdeaCount - currentIdeaCount)
              
              newestIdeas.forEach(idea => {
                newIdeaIds.add(idea.id)
                console.log('新しいアイデアを検出:', idea.title, idea.id)
              })
              
              setNewIdeas(newIdeaIds)
              
              // 5秒後にアニメーションを削除
              setTimeout(() => {
                setNewIdeas(new Set())
              }, 5000)
              
              // 新しいアイデアが見つかったので通知
              if (typeof window !== 'undefined') {
                const notification = new Notification('新しいアイデアが生成されました！', {
                  body: newestIdeas.map(idea => idea.title).join(', '),
                  icon: '/favicon.ico'
                })
                setTimeout(() => notification.close(), 5000)
              }
            }
          }
          
          setIdeas(processedIdeas)
          setLastFetchTime(new Date())
        }
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  // プレースホルダーアイデアを生成
  const createPlaceholder = () => {
    const placeholderId = `placeholder-${Date.now()}`
    const placeholder: ProcessedIdea = {
      id: Date.now(),
      slug: placeholderId,
      title: '新しいアイデアを生成中...',
      category: 'AI自動生成',
      tags: ['生成中'],
      source: 'AI生成システム',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sheets_id: undefined
    }
    return { placeholderId, placeholder }
  }

  // n8nワークフロー実行処理
  const handleN8nTrigger = useCallback(async () => {
    // 即座にプレースホルダーを追加
    const { placeholderId, placeholder } = createPlaceholder()
    setPlaceholderIdeas(prev => new Set([...prev, placeholderId]))
    setIdeas(prev => [placeholder, ...prev])

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
      })
      
      // React 18自動バッチングを無効化して即座に更新
      flushSync(() => {
        // プレースホルダー追加済みなので何もしない
      })
      
      // タイムアウトエラーでもn8nは実行されている可能性があるため、自動チェックを開始
      console.log('🚀 n8nワークフローを実行しました！バックグラウンドで処理中です。')
      
      // 定期的に新しいアイデアをチェック
      let checkCount = 0
      const maxChecks = 30 // 最大約5分間（10秒間隔 × 30回）
      const currentIdeaCount = ideas.length // 現在のアイデア数を記録
      
              const checkForNewIdeas = () => {
          checkCount++
          console.log(`🔍 新しいアイデアをチェック中... (${checkCount}/${maxChecks}) - 現在のアイデア数: ${currentIdeaCount}`)
          
          // 新しいアイデアをチェック
          fetch('/api/admin/ideas')
            .then(response => response.json())
            .then(data => {
              if (data.success && data.ideas) {
                const newIdeaCount = data.ideas.length
                console.log(`📊 現在のアイデア数: ${newIdeaCount} (開始時: ${currentIdeaCount})`)
                
                if (newIdeaCount > currentIdeaCount) {
                  console.log('🎉 新しいアイデアを検出！プレースホルダーを実データに置換します。')
                  
                  // 新しい実データを取得
                  const newRealData = data.ideas.slice(0, newIdeaCount - currentIdeaCount)
                  
                  // プレースホルダーを実データに置換
                  console.log('🔄 プレースホルダー置換処理開始')
                  console.log('新しい実データ:', newRealData)
                  console.log('現在のプレースホルダー:', Array.from(placeholderIdeas))
                  
                  // データをすぐに再取得して画面を更新
                  fetchIdeas(false)
                  
                  // プレースホルダーをクリア
                  setPlaceholderIdeas(new Set())
                  
                  // 新しいアイデアをハイライト
                  const newIdeaIds = new Set<number>()
                  newRealData.forEach((idea: any) => {
                    newIdeaIds.add(idea.id)
                  })
                  setNewIdeas(newIdeaIds)
                  
                  // 5秒後にハイライト解除
                  setTimeout(() => {
                    setNewIdeas(new Set())
                  }, 5000)
                  
                  return // チェック終了
                }
              }
              
                          // 新しいアイデアがない場合は継続チェック
            if (checkCount < maxChecks) {
              console.log(`⏳ 新しいアイデアはまだありません。5秒後に再チェックします...`)
              setTimeout(checkForNewIdeas, 5000) // 5秒後に再チェック（短縮）
            } else {
              console.log('🏁 自動チェック終了。手動でページを更新してください。')
            }
            })
            .catch(error => {
              console.log(`❌ アイデアチェックエラー: ${error.message}`)
              if (checkCount < maxChecks) {
                setTimeout(checkForNewIdeas, 5000) // 5秒後に再チェック（短縮）
              }
            })
        }
      
              // 5秒後から開始（より早くチェック開始）
        console.log('⏱️ 5秒後に自動チェックを開始します...')
        console.log('🎯 現在のアイデア数（ベースライン）:', currentIdeaCount)
        console.log('📍 プレースホルダーID:', placeholderId)
        setTimeout(checkForNewIdeas, 5000)
      
      if (response.ok) {
        console.log('✅ n8nワークフロー実行成功')
      } else {
        // タイムアウトエラーは想定内なので、詳細ログは出力しない
        console.log('⏰ n8nワークフロー呼び出しタイムアウト（実行は継続中）')
      }
    } catch (error) {
      flushSync(() => {
        // ローディング状態削除
      })
      console.log('⏰ n8nワークフロー呼び出しタイムアウト（実行は継続中）')
    }
  }, [ideas.length, placeholderIdeas])

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
    
    // 通知権限を要求
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [])

  // 日付をフォーマットする関数
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '未設定'
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 日付のみをフォーマットする関数
  const formatDate = (dateString: string) => {
    if (!dateString) return '未設定'
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

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
      <style jsx global>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px);
            background-color: #fef3c7;
          }
          50% {
            background-color: #fcd34d;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            background-color: transparent;
          }
        }
        
        .new-idea-animation {
          animation: slideIn 2s ease-out;
        }
        
        .existing-row-slide {
          transition: transform 0.5s ease-out;
        }
        
        .placeholder-row {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
          opacity: 0.7;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .placeholder-text {
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">アイデア一覧</h1>
          <p className="mt-2 text-gray-600">現在 {ideas.length} 個のアイデアが登録されています</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleN8nTrigger}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            AI自動生成
          </button>
          <Link
            href="/admin/ideas/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            手動で追加
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                管理ID
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                作成日時
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                タイトル
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                カテゴリ
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                ステータス
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                タグ
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ideas.map((ideaRow: ProcessedIdea) => (
              <tr 
                key={ideaRow.id} 
                            className={`hover:bg-gray-50 ${
              newIdeas.has(ideaRow.id) 
                ? 'new-idea-animation' 
                : placeholderIdeas.has(ideaRow.slug)
                ? 'placeholder-row'
                : 'existing-row-slide'
            }`}
              >
                <td className="px-4 py-4 text-center">
                  <div className="text-sm font-mono text-gray-900">
                    {ideaRow.sheets_id || ideaRow.id}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="text-sm text-gray-900">
                    {formatDate(ideaRow.created_at)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateTime(ideaRow.created_at).split(' ')[1]}
                  </div>
                </td>
                <td className="px-4 py-4 text-left">
                  <div className="max-w-xs">
                    <div className={`text-sm font-medium truncate ${
                      placeholderIdeas.has(ideaRow.slug) 
                        ? 'placeholder-text' 
                        : 'text-gray-900'
                    }`}>
                      {ideaRow.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {ideaRow.slug}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      元ネタ: {ideaRow.source || '未設定'}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {ideaRow.category}
                  </span>
                </td>

                <td className="px-4 py-4 text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ideaRow.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : placeholderIdeas.has(ideaRow.slug)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ideaRow.status === 'published' 
                      ? '公開中' 
                      : placeholderIdeas.has(ideaRow.slug)
                      ? '生成中'
                      : '下書き'
                    }
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {ideaRow.tags.slice(0, 3).map((tagElement: string) => (
                      <span
                        key={tagElement}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                      >
                        {tagElement}
                      </span>
                    ))}
                    {ideaRow.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                        +{ideaRow.tags.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <Link
                      href={`/ideas/${ideaRow.slug}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      target="_blank"
                    >
                      表示
                    </Link>
                    <Link
                      href={`/admin/ideas/${ideaRow.slug}/edit`}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(ideaRow.id, ideaRow.title)}
                      disabled={deleting === ideaRow.id}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      {deleting === ideaRow.id ? '削除中...' : '削除'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ideas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">まだアイデアが登録されていません。</p>
            <div className="mt-4">
              <button
                onClick={handleN8nTrigger}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                AIでアイデアを生成する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}