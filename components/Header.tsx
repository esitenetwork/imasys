import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            IMASYS
          </Link>
          
          <nav className="flex gap-6">
            <Link href="/" className="hover:text-blue-600">
              ホーム
            </Link>
            <Link href="/about" className="hover:text-blue-600">
              私たちについて
            </Link>
            <Link href="/contact" className="hover:text-blue-600">
              お問い合わせ
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}