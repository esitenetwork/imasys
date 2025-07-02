import { getIdeaBySlug, getAllIdeas } from '@/lib/mdx'
import { notFound } from 'next/navigation'

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
            {idea.category}
          </span>
          <span className="text-gray-600">{idea.price}</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{idea.title}</h1>
        <p className="text-lg text-gray-600 mb-4">{idea.description}</p>
        
        <div className="flex gap-2 flex-wrap mb-4">
          {idea.tags.map((tag) => (
            <span key={tag} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="text-sm text-gray-500">
          構築期間: {idea.duration}
        </div>
      </div>
      
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: idea.contentHtml }}
      />
    </div>
  )
}