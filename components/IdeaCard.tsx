import Link from 'next/link'

type IdeaCardProps = {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  price: string
}

export default function IdeaCard({ slug, title, description, category, tags, price }: IdeaCardProps) {
  return (
    <Link href={`/ideas/${slug}`} className="block">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {category}
          </span>
          <span className="text-sm text-gray-500">{price}</span>
        </div>
        
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}