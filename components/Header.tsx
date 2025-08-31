'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 10) {
        // 最上部付近では常に表示
        setIsVisible(true)
      } else if (currentScrollY < lastScrollY) {
        // 上にスクロール：表示
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 下にスクロール（100px以上）：非表示
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // 管理ページでは通常のヘッダーを非表示
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <header 
      className={`bg-primary/80 shadow-sm border-b border-primary/40 w-full fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-white">
              IMASYS
            </Link>
            <span className="text-sm text-white/80">
              いまどきシステム導入ラボ「イマシス」
            </span>
          </div>
          
          <nav className="flex gap-8 mr-4">
            <Link href="/contact" className="hover:text-white/80 transition-colors">
              <span className="text-sm font-medium text-white">CONTACT</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}