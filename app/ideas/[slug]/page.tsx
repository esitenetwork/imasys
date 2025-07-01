import { getIdeaBySlug } from '@/lib/mdx'
import { notFound } from 'next/navigation'

export default async function IdeaDetail({ params }: { params: { slug: string } }) {
  const idea = await getIdeaBySlug(params.slug)
  
  if (!idea) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー部分 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
              {idea.category}
            </span>
            <span className="text-2xl font-bold text-green-600">{idea.price}</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{idea.title}</h1>
          <p className="text-gray-600 mb-6">{idea.description}</p>
          
          <div className="flex gap-2 flex-wrap mb-6">
            {idea.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                #{tag}
              </span>
            ))}
          </div>
          
          <p className="text-gray-500">開発期間の目安: {idea.duration}</p>
        </div>

        {/* コンテンツ部分 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-p:text-gray-600 prose-ul:list-disc prose-ul:ml-6 prose-li:text-gray-600">
            <div dangerouslySetInnerHTML={{ __html: idea.contentHtml }} />
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-50 rounded-lg p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold mb-4">このシステムに興味がありますか？</h2>
          <p className="mb-6">お客様の業務に合わせてカスタマイズいたします</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            お問い合わせはこちら
          </button>
        </div>
      </div>
    </main>
  )
}