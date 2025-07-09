import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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
    <div className="min-h-screen bg-background pt-16">
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
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            IMASYSとは
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            「AIって何ができるの？」という疑問をお持ちの<br />
            経営者・担当者への啓発プラットフォーム
          </p>
        </div>
      </section>

      {/* ミッション */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">私たちのミッション</h2>
          </div>
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center">
              <p className="text-xl text-muted-foreground leading-relaxed">
                「AIの可能性を知らない」「システム開発コストを過大評価している」<br />
                すべての経営者・担当者に対し、<br />
                「実はこんなことが簡単にできるようになった」という気づきと<br />
                具体的なアイデアを提供する
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 私たちの強み */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">私たちの3つの強み</h2>
            <p className="text-xl text-muted-foreground">他社では実現できない独自の価値提案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">圧倒的スピード</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  従来の受託開発を大幅に短縮。世界中の開発者が検証済みのアイデアをベースにした高速開発を実現。
                </p>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">実証済みアイデア</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  GitHub、n8n、Zapier等で公開されている「生きた情報源」から、市場で需要が証明されたアイデアを厳選して商用化。
                </p>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <CardTitle className="text-xl">適正価格</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  従来開発よりも大幅に低価格を実現。企業規模に関わらず手が届く価格で高品質なカスタムシステムをご提供。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* サービスの流れ */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">サービスの流れ</h2>
            <p className="text-xl text-muted-foreground">課題発見から納品まで、一貫したサポート</p>
          </div>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</Badge>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">課題ヒアリング</h3>
                <p className="text-muted-foreground">現在の業務フローを詳しくお聞きし、課題と改善ポイントを特定します。</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</Badge>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">最適なアイデア提案</h3>
                <p className="text-muted-foreground">豊富なアイデア・ギャラリーから、御社の課題に最適な解決策をご提案します。</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</Badge>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">高速開発・納品</h3>
                <p className="text-muted-foreground">短期間でシステムを開発し、買い切りでご提供。アフターサポートも充実。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* なぜIMASYSなのか */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">なぜIMASYSが選ばれるのか</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">項目</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-red-600 uppercase tracking-wider">従来の受託開発</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-primary uppercase tracking-wider">IMASYS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">開発期間</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant="destructive" className="text-xs">長期間</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">短期間</Badge>
                      </td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">費用</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant="destructive" className="text-xs">高額</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">適正価格</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">開発手法</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground text-center">要件定義から設計まで長期間</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground text-center">実証済みアイデアで高速開発</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">アイデア提案</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground text-center">アイデア出しも含めて有料</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="secondary" className="text-xs">無料</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              実際の納期や導入費用については、システム詳細ページをご確認いただき、相見積もりをとってみてください。
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            まずは無料相談から始めませんか？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            たくさんありすぎてどれが当てはまるのかわからないといった方は、御社にぴったりのシステムがいくらでどのくらいの期間で導入できるのかアドバイスさせていただきますので、お気軽にご相談ください。
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4">
            <Link href="/contact">
              無料相談はこちら
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}