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
  // 表示するタグ数を制限
  const maxTagsToShow = 2
  const visibleTags = tags.slice(0, maxTagsToShow)
  const remainingTagsCount = tags.length - maxTagsToShow

  return (
    <Link href={`/ideas/${slug}`} className="block">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-52 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {category}
          </span>
          <span className="text-sm text-gray-500">{price}</span>
        </div>
        
        {/* タイトル - 1行固定、省略表示 */}
        <h3 className="font-bold text-lg mb-2 truncate" title={title}>
          {title}
        </h3>
        
        {/* サマリー - 2行固定、省略表示 */}
        <div 
          className="text-gray-600 text-sm mb-3 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.4em',
            height: '2.8em'
          }}
          title={description}
        >
          {description}
        </div>

        {/* スペーサー - 残りの空間を埋める */}
        <div className="flex-grow"></div>
        
        {/* タグ - 1行固定、省略表示 */}
        <div className="flex gap-2 items-center">
          {visibleTags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded whitespace-nowrap">
              #{tag}
            </span>
          ))}
          {remainingTagsCount > 0 && (
            <span className="text-xs text-gray-500 font-medium">
              +{remainingTagsCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}