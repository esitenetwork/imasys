import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const ideasDirectory = path.join(process.cwd(), 'content/ideas')

export type IdeaData = {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  price: string
  duration: string
  content: string
  contentHtml: string  // 追加
}

// すべてのアイデアを取得
export async function getAllIdeas(): Promise<IdeaData[]> {
  const fileNames = fs.readdirSync(ideasDirectory)
  
  const allIdeas = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.mdx$/, '')
      const fullPath = path.join(ideasDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)
      
      // MarkdownをHTMLに変換
      const processedContent = await remark()
        .use(html)
        .process(content)
      const contentHtml = processedContent.toString()
      
      return {
        slug,
        content,
        contentHtml,
        ...data,
      } as IdeaData
    })
  )
  
  return allIdeas
}

// 特定のアイデアを取得
export async function getIdeaBySlug(slug: string): Promise<IdeaData | null> {
  try {
    const fullPath = path.join(ideasDirectory, `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // MarkdownをHTMLに変換
    const processedContent = await remark()
      .use(html)
      .process(content)
    const contentHtml = processedContent.toString()
    
    return {
      slug,
      content,
      contentHtml,
      ...data,
    } as IdeaData
  } catch {
    return null
  }
}