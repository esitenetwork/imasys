import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "IMASYSとは｜AI活用の可能性を伝える専門企業",
  description: "IMASYSは、「AIって何ができるの？」「システム開発は高額？」という疑問をお持ちの経営者・担当者に、AI活用の可能性と高速開発技術をお伝えする専門企業です。従来の常識を覆す1-3週間・50万円〜のシステム開発をご提案します。",
  keywords: ["IMASYS", "イマシス", "AI活用", "システム開発 会社", "高速開発", "AI導入支援"],
  openGraph: {
    title: "IMASYSとは｜AI活用の可能性を伝える専門企業",
    description: "「AIって何ができるの？」という疑問をお持ちの経営者・担当者に、AI活用の可能性と高速開発技術をお伝えする専門企業です。",
    url: 'https://imasys.jp/about',
    type: 'website',
  },
  alternates: {
    canonical: 'https://imasys.jp/about',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 構造化データ（AboutPage） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "IMASYSとは",
            "description": "AI活用で中小企業の業務改善を支援する専門家集団",
            "url": "https://imasys.jp/about",
            "mainEntity": {
              "@type": "Organization",
              "name": "IMASYS",
              "alternateName": "今どきシステム導入ラボ「イマシス」",
              "description": "AI活用による業務改善・自動化システムの高速開発を行う専門企業",
              "foundingDate": "2025",
              "founder": {
                "@type": "Person",
                "name": "中村"
              },
              "knowsAbout": [
                "AI業務改善",
                "システム開発",
                "業務自動化",
                "中小企業DX"
              ],
              "serviceArea": {
                "@type": "Country",
                "name": "Japan"
              }
            }
          })
        }}
      />

      {/* ヒーローセクション */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            IMASYSとは
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            「AIって何ができるの？」という疑問をお持ちの<br />
            経営者・担当者への啓発プラットフォーム
          </p>
        </div>
      </section>

      {/* ミッション */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">私たちのミッション</h2>
          </div>
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <p className="text-xl text-gray-700 leading-relaxed">
              「AIの可能性を知らない」「システム開発コストを過大評価している」<br />
              すべての経営者・担当者に対し、<br />
              「実はこんなことが簡単にできるようになった」という気づきと<br />
              具体的なアイデアを提供する
            </p>
          </div>
        </div>
      </section>

      {/* 私たちの強み */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">私たちの3つの強み</h2>
            <p className="text-xl text-gray-600">他社では実現できない独自の価値提案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">圧倒的スピード</h3>
              <p className="text-gray-600 leading-relaxed">
                従来の受託開発（3-6ヶ月）を1-3週間に短縮。世界中の開発者が検証済みのアイデアをベースにした高速開発を実現。
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">実証済みアイデア</h3>
              <p className="text-gray-600 leading-relaxed">
                GitHub、n8n、Zapier等で公開されている「生きた情報源」から、市場で需要が証明されたアイデアを厳選して商用化。
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">適正価格</h3>
              <p className="text-gray-600 leading-relaxed">
                従来開発の1/3-1/5の価格（50万円〜）を実現。中小企業でも手が届く価格で高品質なカスタムシステムをご提供。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* サービスの流れ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">サービスの流れ</h2>
            <p className="text-xl text-gray-600">課題発見から納品まで、一貫したサポート</p>
          </div>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">課題ヒアリング</h3>
                <p className="text-gray-600">現在の業務フローを詳しくお聞きし、課題と改善ポイントを特定します。</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">最適なアイデア提案</h3>
                <p className="text-gray-600">豊富なアイデア・ギャラリーから、御社の課題に最適な解決策をご提案します。</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">高速開発・納品</h3>
                <p className="text-gray-600">1-3週間でシステムを開発し、買い切りでご提供。アフターサポートも充実。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* なぜIMASYSなのか */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">なぜIMASYSが選ばれるのか</h2>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">従来の受託開発</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    開発期間：3-6ヶ月
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    費用：200-500万円
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    要件定義から設計まで長期間
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    アイデア出しも含めて有料
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">IMASYS</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    開発期間：1-3週間
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    費用：50万円〜
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    実証済みアイデアで高速開発
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    アイデア提案は無料
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            まずは無料相談から始めませんか？
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Excel業務の限界を感じているなら、AIで解決できる可能性があります。<br />
            お気軽にご相談ください。
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            無料相談はこちら
          </Link>
        </div>
      </section>
    </div>
  )
}