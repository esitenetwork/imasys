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
    <Link href={`/ideas/${slug}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 p-6 h-52 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {category}
          </span>
          <span className="text-sm font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
            導入費用 {price}
          </span>
        </div>
        
        {/* タイトル - 1行固定、省略表示 */}
        <h3 className="font-bold text-lg mb-2 truncate group-hover:text-blue-600 transition-colors" title={title}>
          {title}
        </h3>
        
        {/* サマリー - 2行固定、省略表示 */}
        <div 
          className="text-gray-600 text-sm mb-3 overflow-hidden leading-relaxed"
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
        <div className="flex gap-1.5 items-center">
          {visibleTags.map((tag) => (
            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap">
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

// CSS追加（globals.cssに追加が必要）
/*
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
*/