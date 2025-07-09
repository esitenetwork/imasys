import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
      <Card className="h-52 flex flex-col hover:shadow-lg transition-all duration-200 group-hover:border-primary/60 group-hover:bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">
              {category}
            </Badge>
            <Badge variant="outline" className="text-emerald-700 border-emerald-600 bg-emerald-50 hover:bg-emerald-100">
              導入費用 {price}
            </Badge>
          </div>
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1" title={title}>
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-3 flex-grow">
          <CardDescription className="text-sm leading-relaxed line-clamp-2" title={description}>
            {description}
          </CardDescription>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex gap-1.5 items-center w-full">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200">
                #{tag}
              </Badge>
            ))}
            {remainingTagsCount > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                +{remainingTagsCount}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}