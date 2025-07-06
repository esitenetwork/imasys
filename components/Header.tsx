import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b w-full">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-blue-600">
              IMASYS
            </Link>
            <span className="text-sm text-gray-600">
              いまどきシステム導入ラボ「イマシス」
            </span>
          </div>
          
          <nav className="flex gap-8 mr-4">
            <Link href="/about" className="flex flex-col items-center hover:text-blue-600 transition-colors">
              <span className="text-base font-medium">ABOUT</span>
              <span className="text-xs text-gray-500 mt-0.5" style={{fontSize: '10px'}}>イマシスとは</span>
            </Link>
            <Link href="/contact" className="flex flex-col items-center hover:text-blue-600 transition-colors">
              <span className="text-base font-medium">CONTACT</span>
              <span className="text-xs text-gray-500 mt-0.5" style={{fontSize: '10px'}}>お問い合わせ</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}