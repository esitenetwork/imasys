'use client'

import IdeaCard from '@/components/IdeaCard'
import { useEffect, useState } from 'react'

interface HomePageProps {
  ideas: any[]
}

export default function ClientHomePage({ ideas }: HomePageProps) {
  const categories = (ideas || []).reduce((acc, idea) => {
    if (idea && idea.category) {
      acc[idea.category] = (acc[idea.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="relative">
      {/* 構造化データ（WebSite） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "IMASYS",
            "url": "https://imasys.jp",
            "description": "AI活用システムのアイデア・ギャラリーと高速開発サービス",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://imasys.jp/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "IMASYS"
            }
          })
        }}
      />

      {/* ヘッダー分の余白 */}
      <div className="h-16"></div>

      {/* モダンなGrid Layout - 普通スクロール版 */}
      <div className="grid lg:grid-cols-[320px_1fr] min-h-[calc(100vh-4rem)]">
        
        {/* 左カラム - 普通スクロール */}
        <aside className="hidden lg:block">
          <div className="bg-gray-50 border-r border-gray-200">
            <div 
              className="p-6 space-y-8 custom-scrollbar"
              style={{
                position: 'sticky',
                top: '0px',
                height: '100vh',
                overflowY: 'auto'
              }}
            >
              
              {/* 統計情報 */}
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">統計情報</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">総アイデア数</span>
                    <span className="text-lg font-bold text-blue-600">{(ideas || []).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">カテゴリ数</span>
                    <span className="text-lg font-bold text-blue-600">{Object.keys(categories).length}</span>
                  </div>
                </div>
              </div>

              {/* 区切り線 */}
              <hr className="border-gray-300" />

              {/* カテゴリフィルター */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">カテゴリで絞り込み</h2>
                <div className="space-y-2">
                  <label className="flex items-center w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                    />
                    すべて ({(ideas || []).length})
                  </label>
                  {Object.entries(categories).map((entry) => {
                    const [category, count] = entry as [string, number]
                    return (
                      <label 
                        key={category}
                        className="flex items-center w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <input 
                          type="checkbox" 
                          className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        />
                        {category} ({count})
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* 区切り線 */}
              <hr className="border-gray-300" />

              {/* タグフィルター */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">タグで絞り込み</h2>
                <div className="space-y-2">
                  {['AI活用', '自動化', 'LINE連携', 'PDF生成', 'メール送信', 'データ分析', 'リアルタイム', '情報一元化'].map((tag) => {
                    const tagCount = (ideas || []).filter(idea => {
                      if (!idea.tags) return false
                      
                      if (Array.isArray(idea.tags)) {
                        return idea.tags.some((tagItem: any) => {
                          if (typeof tagItem === 'string') {
                            return tagItem.toLowerCase().includes(tag.toLowerCase())
                          }
                          return false
                        })
                      }
                      
                      if (typeof idea.tags === 'string') {
                        return idea.tags.toLowerCase().includes(tag.toLowerCase())
                      }
                      
                      return false
                    }).length
                    
                    if (tagCount === 0) return null
                    
                    return (
                      <label 
                        key={tag}
                        className="flex items-center w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <input 
                          type="checkbox" 
                          className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                        />
                        #{tag} ({tagCount})
                      </label>
                    )
                  })}
                </div>
              </div>
              
            </div>
          </div>
        </aside>

        {/* メインカラム */}
        <main className="w-full min-h-full">
          
          {/* ヒーローセクション */}
          <section className="bg-gradient-to-b from-blue-50 to-white py-12">
            <div className="px-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                AI×業務改善アイデア集
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                自社専用にカスタマイズされたオリジナルのシステムが早く！安く！導入できる！
              </p>
            </div>
          </section>

          {/* アイデア一覧セクション */}
          <section className="p-6 pb-20">
            <div 
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))'
              }}
            >
              {(ideas || []).map((idea) => (
                <IdeaCard 
                  key={idea.id} 
                  slug={idea.slug}
                  title={idea.title}
                  description={idea.description}
                  category={idea.category}
                  tags={idea.tags}
                  price={idea.price}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}