'use client'

import IdeaCard from '@/components/IdeaCard'
import { useEffect, useState, useRef } from 'react'

interface HomePageProps {
  ideas: any[]
}

export default function ClientHomePage({ ideas }: HomePageProps) {
  // 状態管理
  const [isSticky, setIsSticky] = useState(false)
  const [footerPushUp, setFooterPushUp] = useState(0)
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['すべて'])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['すべて'])

  // スティッキーサイドバーの制御
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const headerHeight = 64
      
      if (scrollTop >= headerHeight) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }

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

      const rect = leftColumn.getBoundingClientRect()
      const isMouseOverLeftColumn = 
        e.clientX >= rect.left && 
        e.clientX <= rect.right && 
        e.clientY >= rect.top && 
        e.clientY <= rect.bottom

      if (isMouseOverLeftColumn) {
        const scrollTop = leftColumn.scrollTop
        const scrollHeight = leftColumn.scrollHeight
        const clientHeight = leftColumn.clientHeight
        const isAtTop = scrollTop === 0
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1

        if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
          e.preventDefault()
          leftColumn.scrollTop += e.deltaY
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [isSticky])

  // カテゴリ集計
  const categories = (ideas || []).reduce((acc, idea) => {
    if (idea && idea.category) {
      acc[idea.category] = (acc[idea.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // フィルタリング処理
  const handleCategoryChange = (category: string) => {
    if (category === 'すべて') {
      setSelectedCategories(['すべて'])
    } else {
      setSelectedCategories(prev => {
        const newCategories = prev.filter(c => c !== 'すべて')
        if (newCategories.includes(category)) {
          const filtered = newCategories.filter(c => c !== category)
          return filtered.length === 0 ? ['すべて'] : filtered
        } else {
          return [...newCategories, category]
        }
      })
    }
  }

  const handleTagChange = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleIndustryChange = (industry: string) => {
    if (industry === 'すべて') {
      setSelectedIndustries(['すべて'])
    } else {
      setSelectedIndustries(prev => {
        const newIndustries = prev.filter(i => i !== 'すべて')
        if (newIndustries.includes(industry)) {
          const filtered = newIndustries.filter(i => i !== industry)
          return filtered.length === 0 ? ['すべて'] : filtered
        } else {
          return [...newIndustries, industry]
        }
      })
    }
  }

  // アイデアフィルタリング
  const filteredIdeas = (ideas || []).filter(idea => {
    const categoryMatch = selectedCategories.includes('すべて') || 
                         selectedCategories.includes(idea.category)
    
    const tagMatch = selectedTags.length === 0 || selectedTags.some(selectedTag => {
      if (!idea.tags) return false
      
      if (Array.isArray(idea.tags)) {
        return idea.tags.some((tagItem: any) => {
          if (typeof tagItem === 'string') {
            return tagItem.toLowerCase().includes(selectedTag.toLowerCase())
          }
          return false
        })
      }
      
      if (typeof idea.tags === 'string') {
        return idea.tags.toLowerCase().includes(selectedTag.toLowerCase())
      }
      
      return false
    })
    
    return categoryMatch && tagMatch
  })

  return (
    <div>
      {/* 構造化データ */}
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

      {/* ヘッダー余白 */}
      <div className="h-16"></div>

      {/* メインレイアウト */}
      <div className="flex min-h-screen">
        
        {/* 左サイドバー */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 hidden lg:block">
          <div 
            ref={leftColumnRef}
            className={`w-80 h-screen p-6 space-y-6 overflow-y-auto modern-scrollbar ${
              isSticky ? 'fixed top-0 left-0 z-10 bg-gray-50 border-r border-gray-200' : 'relative'
            }`}
            style={isSticky ? { top: `${-footerPushUp}px` } : {}}
          >
            
            {/* 業種フィルター */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">業種で絞り込み</h2>
              <div className="space-y-2">
                <label className="flex items-center w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedIndustries.includes('すべて')}
                    onChange={() => handleIndustryChange('すべて')}
                    className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                  すべて
                </label>
                <label className="flex items-center w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedIndustries.includes('歯科')}
                    onChange={() => handleIndustryChange('歯科')}
                    className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                  歯科
                </label>
                <label className="flex items-center w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedIndustries.includes('不動産')}
                    onChange={() => handleIndustryChange('不動産')}
                    className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                  />
                  不動産
                </label>
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* カテゴリフィルター */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">カテゴリで絞り込み</h2>
              <div className="space-y-2">
                <label className="flex items-center w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes('すべて')}
                    onChange={() => handleCategoryChange('すべて')}
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
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="mr-3 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                      />
                      {category} ({count})
                    </label>
                  )
                })}
              </div>
            </div>
            
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 w-full min-h-full">
          
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

          {/* タグフィルター */}
          <section className="px-6 py-6 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap gap-2">
                {['AI活用', '自動化', 'LINE連携', 'PDF生成', 'メール送信', 'データ分析', 'リアルタイム', '情報一元化', 'Slack連携', 'Gmail連携', '画像認識', 'OCR', 'チャットボット', 'API連携', '在庫管理', '顧客管理'].map((tag) => {
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
                    <button 
                      key={tag}
                      onClick={() => handleTagChange(tag)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border ${
                        selectedTags.includes(tag) 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      #{tag} <span className="ml-1 text-xs">({tagCount})</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* アイデア一覧 */}
          <section className="p-6 pb-20">
            <div 
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))'
              }}
            >
              {filteredIdeas.map((idea) => (
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