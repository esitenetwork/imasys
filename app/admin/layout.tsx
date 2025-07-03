import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 管理画面ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="font-bold text-xl text-gray-900">
                イマシス管理画面
              </Link>
              <nav className="flex space-x-4">
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  ダッシュボード
                </Link>
                <Link href="/admin/ideas" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  アイデア一覧
                </Link>
                <Link href="/admin/sheets" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Sheets連携
                </Link>
              </nav>
            </div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              サイトに戻る →
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="py-10">
        {children}
      </main>
    </div>
  )
}