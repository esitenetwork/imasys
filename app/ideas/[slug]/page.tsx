import { getIdeaBySlug, getAllIdeas } from '@/lib/mdx'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const ideas = await getAllIdeas()
  return ideas.map((idea) => ({
    slug: idea.slug,
  }))
}

export default async function IdeaDetailPage({ params }: Props) {
  // Next.js 15ではparamsがPromiseなのでawaitする
  const { slug } = await params
  const idea = await getIdeaBySlug(slug)
  
  if (!idea) {
    notFound()
  }
  
  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="afterInteractive"
      />
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー部分 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-full">
                  {idea.category}
                </span>
                <span className="text-2xl font-bold text-blue-600">{idea.price}</span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{idea.title}</h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">{idea.description}</p>
              
              <div className="flex gap-2 flex-wrap mb-6">
                {idea.tags.map((tag) => (
                  <span key={tag} className="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="inline-flex items-center bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                構築期間: {idea.duration}
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div 
              className="prose prose-gray max-w-none 
                         prose-headings:text-gray-900 prose-headings:font-bold
                         prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                         prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-3
                         prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                         prose-ul:my-4 prose-li:text-gray-700 prose-li:mb-1
                         prose-strong:text-gray-900 prose-strong:font-semibold
                         prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                         prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:my-6
                         prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm"
              dangerouslySetInnerHTML={{ __html: idea.contentHtml }}
            />
          </div>

          {/* お問い合わせCTA */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">このアイデアで相談してみませんか？</h3>
            <p className="text-blue-100 mb-6">具体的な要件をお聞かせください。最適なシステムをご提案いたします。</p>
            <Link 
              href={`/contact?ideaSlug=${slug}&ideaTitle=${encodeURIComponent(idea.title)}`}
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              無料相談を申し込む
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}