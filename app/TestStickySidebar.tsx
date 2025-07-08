'use client'

import { useEffect, useState, useRef } from 'react'

interface HomePageProps {
  ideas: any[]
}

export default function TestStickySidebar({ ideas }: HomePageProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [footerPushUp, setFooterPushUp] = useState(0)
  const leftColumnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const headerHeight = 64
      
      // ヘッダー分スクロールしたら左カラムを固定
      if (scrollTop >= headerHeight) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }

      // フッター押し上げ処理
      const footer = document.querySelector('footer')
      if (footer && isSticky) {
        const footerRect = footer.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        
        if (footerRect.top <= viewportHeight) {
          const footerOverlap = Math.max(0, viewportHeight - footerRect.top)
          setFooterPushUp(footerOverlap)
        } else {
          setFooterPushUp(0)
        }
      } else {
        setFooterPushUp(0)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      const leftColumn = leftColumnRef.current
      if (!leftColumn || !isSticky) return

      // マウスが左カラム上にある場合のみ、左カラム内スクロールに限定
      const rect = leftColumn.getBoundingClientRect()
      const isMouseOverLeftColumn = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom

      if (isMouseOverLeftColumn) {
        e.preventDefault()
        leftColumn.scrollTop += e.deltaY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [isSticky])

  const categories = (ideas || []).reduce((acc, idea) => {
    if (idea && idea.category) {
      acc[idea.category] = (acc[idea.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* ヘッダー分の余白 */}
      <div className="h-16"></div>

      {/* istockphoto風レイアウト */}
      <div className="flex min-h-screen">
        
        {/* 左カラム */}
        <div className="w-80 bg-red-500 text-white">
          <div 
            ref={leftColumnRef}
            className={`w-80 h-screen p-4 overflow-y-auto modern-scrollbar ${
              isSticky ? 'fixed top-0 left-0 z-10' : 'relative'
            }`}
            style={isSticky ? { top: `${-footerPushUp}px` } : {}}
          >
            <h2>私は sticky です</h2>
            <p>スクロールしてテストしてください</p>
            
            {/* 統計情報 */}
            <div className="space-y-2 mb-6">
              <div>総アイデア数: {(ideas || []).length}</div>
              <div>カテゴリ数: {Object.keys(categories).length}</div>
            </div>

            {/* カテゴリフィルター */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">カテゴリで絞り込み</h3>
              <div className="space-y-2">
                <div className="px-3 py-2 bg-red-600 rounded text-sm">
                  すべて ({(ideas || []).length})
                </div>
                {Object.entries(categories).map((entry) => {
                  const [category, count] = entry as [string, number]
                  return (
                    <div key={category} className="px-3 py-2 bg-red-600 rounded text-sm">
                      {category} ({count})
                    </div>
                  )
                })}
              </div>
            </div>

            {/* タグフィルター */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">タグで絞り込み</h3>
              <div className="space-y-2">
                {['AI活用', '自動化', 'LINE連携'].map((tag) => {
                  const tagCount = (ideas || []).filter(idea => {
                    if (!idea || !idea.tags) return false
                    
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
                    <div key={tag} className="px-3 py-2 bg-red-600 rounded text-sm">
                      #{tag} ({tagCount})
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* メインカラム */}
        <div className="flex-1 bg-blue-500 text-white p-4">
          <h1>メインコンテンツ</h1>
          <div className="space-y-4">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="bg-blue-600 p-4 rounded">
                コンテンツ {i + 1} - スクロールしてstickyをテスト
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* テスト用フッター */}
      <footer className="bg-gray-800 text-white p-8">
        <div className="space-y-6">
          <h3 className="text-xl font-bold">フッターコンテンツ</h3>
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">会社情報</h4>
              <ul className="space-y-2">
                <li>会社概要</li>
                <li>代表者挨拶</li>
                <li>企業理念</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サービス</h4>
              <ul className="space-y-2">
                <li>AI開発</li>
                <li>システム開発</li>
                <li>コンサルティング</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2">
                <li>お問い合わせ</li>
                <li>よくある質問</li>
                <li>技術資料</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">法的事項</h4>
              <ul className="space-y-2">
                <li>利用規約</li>
                <li>プライバシーポリシー</li>
                <li>特定商取引法</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-6">
            <p>© 2025 IMASYS（イマシス）. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}