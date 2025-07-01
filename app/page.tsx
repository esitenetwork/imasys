import IdeaCard from '@/components/IdeaCard'
import { getAllIdeas } from '@/lib/mdx'

export default async function Home() {  // asyncを追加
  const ideas = await getAllIdeas()     // awaitを追加

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          今どきシステム導入ラボ「イマシス」
        </h1>
        <p className="text-center text-gray-600 mb-12">
          AIを活用した業務改善アイデアをご提案します
        </p>
        
        {/* アイデアギャラリー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <IdeaCard key={idea.slug} {...idea} />
          ))}
        </div>
      </div>
    </main>
  )
}