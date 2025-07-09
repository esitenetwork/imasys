'use client'

import IdeaCard from '@/components/IdeaCard'
import { useEffect, useState, useRef } from 'react'

interface HomePageProps {
  ideas: any[]
}

export default function ClientHomePage({ ideas }: HomePageProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [footerPushUp, setFooterPushUp] = useState(0)
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['すべて'])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['すべて'])

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

  const categories = (ideas || []).reduce((acc, idea) => {
    if (idea && idea.category) {
      acc[idea.category] = (acc[idea.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="bg-background">
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

      {/* istockphoto風レイアウト */}
      <div className="flex min-h-screen">

        {/* 左カラム - 本番色適用 */}
        <div className="w-80 bg-card border-r border-border hidden lg:block">
          <div
            ref={leftColumnRef}
            className={`w-80 h-screen p-6 overflow-y-auto modern-scrollbar ${
              isSticky ? 'fixed top-0 left-0 z-10' : 'relative'
            }`}
            style={isSticky ? { top: `${-footerPushUp}px` } : {}}
          >
            {/* 業種フィルター */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-card-foreground">業種で絞り込み</h2>
              <div className="space-y-1">
                <label className="flex items-center px-2 py-1 text-foreground text-sm font-medium cursor-pointer hover:text-primary">
                  <input type="checkbox" defaultChecked className="mr-3 w-4 h-4" />
                  すべて
                </label>
                <label className="flex items-center px-2 py-1 text-foreground text-sm font-medium cursor-pointer hover:text-primary">
                  <input type="checkbox" className="mr-3 w-4 h-4" />
                  歯科
                </label>
                <label className="flex items-center px-2 py-1 text-foreground text-sm font-medium cursor-pointer hover:text-primary">
                  <input type="checkbox" className="mr-3 w-4 h-4" />
                  不動産
                </label>
              </div>
            </div>

            <hr className="border-border my-4" />

            {/* カテゴリフィルター */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-card-foreground">カテゴリで絞り込み</h2>
              <div className="space-y-1">
                <label className="flex items-center px-2 py-1 text-foreground text-sm font-medium cursor-pointer hover:text-primary">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes('すべて')}
                    onChange={() => handleCategoryChange('すべて')}
                    className="mr-3 w-4 h-4" 
                  />
                  すべて ({(ideas || []).length})
                </label>
                {Object.entries(categories).map((entry) => {
                  const [category, count] = entry as [string, number]
                  return (
                    <label key={category} className="flex items-center px-2 py-1 text-foreground text-sm font-medium cursor-pointer hover:text-primary">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="mr-3 w-4 h-4" 
                      />
                      {category} ({count})
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* メインカラム */}
        <main className="flex-1 w-full min-h-full bg-background">

          {/* ヒーローセクション */}
          <section className="bg-gradient-to-b from-primary/5 to-background py-12 pt-24">
            <div className="px-6 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                AI×業務改善アイデア集
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                自社専用にカスタマイズされたオリジナルのシステムが早く！安く！導入できる！
              </p>
            </div>
          </section>

          {/* タグフィルター */}
          <section className="px-6 py-6 bg-card">
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
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer border ${
                      selectedTags.includes(tag) 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground border-border'
                    }`}
                  >
                    #{tag} <span className="ml-1 text-xs">({tagCount})</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* アイデア一覧 */}
          <section className="p-6 pb-20 bg-background">
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