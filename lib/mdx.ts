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
  targetUsers?: string[]  // オプショナルに
  source?: string  // sourceフィールドを追加（表示しないメタデータ）
  content: string
  contentHtml: string
}

// すべてのアイデアを取得
export async function getAllIdeas(): Promise<IdeaData[]> {
  const fileNames = fs.readdirSync(ideasDirectory)
  
  const allIdeas = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.mdx'))  // .mdxファイルのみ
      .map(async (fileName) => {
        const slug = fileName.replace(/\.mdx$/, '')
        const fullPath = path.join(ideasDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContents)
        
        // MarkdownをHTMLに変換
        const processedContent = await remark()
          .use(html)
          .process(content)
        const contentHtml = processedContent.toString()
        
        // データの検証と初期値設定
        return {
          slug,
          title: data.title || 'タイトル未設定',
          description: data.description || '',
          category: data.category || '未分類',
          tags: Array.isArray(data.tags) ? data.tags : [],  // 配列でない場合は空配列
          price: data.price || '',
          duration: data.duration || '',
          targetUsers: Array.isArray(data.targetUsers) ? data.targetUsers : undefined,
          source: data.source || undefined,  // sourceは内部情報として保持
          content,
          contentHtml,
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
    
    // データの検証と初期値設定
    return {
      slug,
      title: data.title || 'タイトル未設定',
      description: data.description || '',
      category: data.category || '未分類',
      tags: Array.isArray(data.tags) ? data.tags : [],  // 配列でない場合は空配列
      price: data.price || '',
      duration: data.duration || '',
      targetUsers: Array.isArray(data.targetUsers) ? data.targetUsers : undefined,
      source: data.source || undefined,  // sourceは内部情報として保持
      content,
      contentHtml,
    } as IdeaData
  } catch {
    return null
  }
}