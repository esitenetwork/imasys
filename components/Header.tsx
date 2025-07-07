'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // スクロール方向を判定
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 下スクロール & 100px以上スクロール済み → ヘッダーを隠す
        setIsVisible(false)
      } else {
        // 上スクロール → ヘッダーを表示
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    // パフォーマンス最適化のためにthrottleを適用
    let ticking = false
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', scrollListener, { passive: true })
    
    return () => window.removeEventListener('scroll', scrollListener)
  }, [lastScrollY])

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 
        bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              IMASYS
            </Link>
            <span className="text-sm text-gray-600 hidden md:block">
              いまどきシステム導入ラボ「イマシス」
            </span>
          </div>
          
          <nav className="flex gap-8 mr-4">
            <Link 
              href="/about" 
              className="flex flex-col items-center hover:text-blue-600 transition-colors group"
            >
              <span className="text-base font-medium">ABOUT</span>
              <span className="text-xs text-gray-500 mt-0.5 group-hover:text-blue-500 transition-colors" style={{fontSize: '10px'}}>
                イマシスとは
              </span>
            </Link>
            <Link 
              href="/contact" 
              className="flex flex-col items-center hover:text-blue-600 transition-colors group"
            >
              <span className="text-base font-medium">CONTACT</span>
              <span className="text-xs text-gray-500 mt-0.5 group-hover:text-blue-500 transition-colors" style={{fontSize: '10px'}}>
                お問い合わせ
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}