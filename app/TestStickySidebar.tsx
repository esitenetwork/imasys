'use client'

import { useEffect, useState } from 'react'

interface TestStickySidebarProps {
  ideas: any[]
}

export default function TestStickySidebar({ ideas }: TestStickySidebarProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [footerPushUp, setFooterPushUp] = useState(0)

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
        
        // フッターが近づく前から押し上げ開始（スムーズに）
        if (footerRect.top <= viewportHeight + 100) {
          const footerOverlap = Math.max(0, viewportHeight - footerRect.top)
          setFooterPushUp(footerOverlap)
        } else {
          setFooterPushUp(0)
        }
      } else {
        setFooterPushUp(0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSticky])

  const categories = ideas.reduce((acc, idea) => {
    acc[idea.category] = (acc[idea.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* ヘッダー分の余白 */}
      <div className="h-16"></div>

      {/* istockphoto風テストレイアウト */}
      <div className="flex min-h-screen">
        
        {/* 左カラム - テスト用 */}
        <div className="w-80 bg-red-500 text-white">
          <div 
            className={`w-80 h-screen p-4 ${
              isSticky 
                ? 'fixed top-0 left-0 z-10' 
                : 'float-left'
            }`}
            style={isSticky ? { 
              top: `${-footerPushUp}px`
            } : {}}
          >
            <h2>私は sticky です</h2>
            <p>スクロールしてテストしてください</p>
            <div className="space-y-2">
              <div>総アイデア数: {ideas.length}</div>
              <div>カテゴリ数: {Object.keys(categories).length}</div>
            </div>
          </div>
        </div>

        {/* メインカラム - 長いコンテンツ */}
        <div className={`flex-1 bg-blue-500 text-white p-4 ${isSticky ? 'ml-80' : 'ml-80'}`}>
          <h1>メインコンテンツ</h1>
          <div className="space-y-4">
            {[...Array(30)].map((_, i) => (
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
                <li>沿革</li>
                <li>アクセス</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サービス</h4>
              <ul className="space-y-2">
                <li>AI開発</li>
                <li>システム開発</li>
                <li>コンサルティング</li>
                <li>保守運用</li>
                <li>研修サービス</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2">
                <li>お問い合わせ</li>
                <li>よくある質問</li>
                <li>技術資料</li>
                <li>導入事例</li>
                <li>価格表</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">法的事項</h4>
              <ul className="space-y-2">
                <li>利用規約</li>
                <li>プライバシーポリシー</li>
                <li>特定商取引法</li>
                <li>免責事項</li>
                <li>著作権について</li>
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