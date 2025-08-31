import { supabase } from '@/lib/supabase'
import type { IdeaRecord } from '@/lib/supabase'
import { remark } from 'remark'
import html from 'remark-html'
import matter from 'gray-matter'

export type IdeaData = {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  price: string
  duration: string
  targetUsers?: string[]
  source?: string
  content: string
  contentHtml: string
}

// すべてのアイデアを取得（Supabaseから）
export async function getAllIdeas(): Promise<IdeaData[]> {
  try {
    if (!supabase) return []
    
    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ideas:', error)
      return []
    }

    if (!ideas) return []

    // Supabaseのデータを IdeaData 形式に変換
    const allIdeas = await Promise.all(
      ideas.map(async (idea: IdeaRecord) => {
        // MDXコンテンツをHTMLに変換（フロントマター除去）
        let contentHtml = ''
        if (idea.mdx_content) {
          try {
            // gray-matterでフロントマターを除去
            const { content } = matter(idea.mdx_content)
            const processedContent = await remark()
              .use(html)
              .process(content)
            contentHtml = processedContent.toString()
          } catch (error) {
            console.error('Error processing MDX content:', error)
            contentHtml = idea.mdx_content || ''
          }
        }

        return {
          slug: idea.slug,
          title: idea.title || 'タイトル未設定',
          description: idea.notes || '',
          category: idea.category || '未分類',
          tags: idea.tags ? idea.tags.split(',').map((tag: string) => tag.trim()) : [],
          price: '',
          duration: '',
          source: idea.source || undefined,
          content: idea.mdx_content || '',
          contentHtml,
        } as IdeaData
      })
    )

    return allIdeas
  } catch (error) {
    console.error('Error in getAllIdeas:', error)
    return []
  }
}

// 特定のアイデアを取得（Supabaseから）
export async function getIdeaBySlug(slug: string): Promise<IdeaData | null> {
  try {
    if (!supabase) return null
    
    const { data: idea, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !idea) {
      console.error('Error fetching idea:', error)
      return null
    }

    // MDXコンテンツをHTMLに変換（フロントマター除去）
    let contentHtml = ''
    if (idea.mdx_content) {
      try {
        // gray-matterでフロントマターを除去
        const { content } = matter(idea.mdx_content)
        const processedContent = await remark()
          .use(html)
          .process(content)
        contentHtml = processedContent.toString()
      } catch (error) {
        console.error('Error processing MDX content:', error)
        contentHtml = idea.mdx_content || ''
      }
    }

    return {
      slug: idea.slug,
      title: idea.title || 'タイトル未設定',
      description: idea.notes || '',
      category: idea.category || '未分類',
      tags: idea.tags ? idea.tags.split(',').map((tag: string) => tag.trim()) : [],
      price: '',
      duration: '',
      source: idea.source || undefined,
      content: idea.mdx_content || '',
      contentHtml,
    } as IdeaData
  } catch (error) {
    console.error('Error in getIdeaBySlug:', error)
    return null
  }
}