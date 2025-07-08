'use client'

import { useEffect, useState } from 'react'

interface HomePageProps {
  ideas: any[]
}

export default function TestStickySidebar({ ideas }: HomePageProps) {
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

      {/* istockphoto風シンプルレイアウト */}
      <div className="flex min-h-screen">
        
        {/* 左カラム - istockphoto風シンプルsticky */}
        <div className="w-80 bg-red-500 text-white">
          <div 
            className="w-80 p-4 custom-scrollbar"
            style={{
              position: 'sticky',
              top: '0px',
              height: '100vh',
              overflowY: 'auto'
            }}
          >
            <h2>私は sticky です</h2>
            <p>スクロールしてテストしてください</p>
            
            {/* 統計情報 */}
            <div className="space-y-2 mb-6">
              <div>総アイデア数: {(ideas || []).length}</div>
              <div>カテゴリ数: {Object.keys(categories).length}</div>
            </div>

            {/* カテゴリフィルター - 文字数増加 */}
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
                      {category} ({count}) - このカテゴリには様々なアイデアが含まれており、業務改善に役立つシステムが多数掲載されています
                    </div>
                  )
                })}
              </div>
            </div>

            {/* タグフィルター - 文字数増加 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">タグで絞り込み</h3>
              <div className="space-y-2">
                {['AI活用', '自動化', 'LINE連携', 'PDF生成', 'メール送信', 'データ分析', 'リアルタイム', '情報一元化'].map((tag) => {
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
                      #{tag} ({tagCount}) - この技術を活用したシステムにより、業務効率化と生産性向上を実現できます。導入により大幅な工数削減が期待できます
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 追加説明セクション - さらに文字数増加 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">システム導入のメリット</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-red-600 p-3 rounded">
                  <h4 className="font-semibold mb-2">業務効率化</h4>
                  <p>従来手作業で行っていた業務を自動化することで、大幅な時間短縮が可能です。毎日の繰り返し作業を削減し、より付加価値の高い業務に集中できるようになります。</p>
                </div>
                <div className="bg-red-600 p-3 rounded">
                  <h4 className="font-semibold mb-2">コスト削減</h4>
                  <p>人件費の削減だけでなく、ミスの減少による修正コストの削減、処理速度向上による機会損失の防止など、様々な面でコスト削減効果が期待できます。</p>
                </div>
                <div className="bg-red-600 p-3 rounded">
                  <h4 className="font-semibold mb-2">品質向上</h4>
                  <p>システムによる自動処理により、人的ミスを大幅に減らすことができます。一定の品質を保った処理が可能になり、顧客満足度の向上にもつながります。</p>
                </div>
                <div className="bg-red-600 p-3 rounded">
                  <h4 className="font-semibold mb-2">データ活用</h4>
                  <p>業務データの蓄積と分析により、今まで見えなかった課題や改善点を発見できます。データドリブンな意思決定により、より効果的な経営判断が可能になります。</p>
                </div>
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