import { supabase } from './supabase'
import matter from 'gray-matter'

export interface IdeaData {
  id: number
  title: string
  slug: string
  category: string
  tags: string[]
  price: string
  duration: string
  description: string
  features: string[]
  benefits: string[]
  technologies: string[]
  source?: string
}

// Supabaseから公開済みのアイデアを取得
export async function getPublishedIdeas(): Promise<IdeaData[]> {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ideas:', error)
    return []
  }

  if (!data) return []

  // データ形式を変換
  return data.map((record: any) => ({
    id: record.id!,
    title: record.title || '',
    slug: record.slug || '',
    category: record.category || '',
    tags: record.tags ? record.tags.split(',').map((t: string) => t.trim()) : [],
    price: record.price_range || '',
    duration: record.duration || '',
    // 複数の方法でdescriptionを取得
    description: extractDescription(record.mdx_content || '', record.notes || ''),
    features: extractFeatures(record.mdx_content || ''),
    benefits: extractBenefits(record.mdx_content || ''),
    technologies: extractTechnologies(record.mdx_content || ''),
    source: record.source
  }))
}

// カテゴリ別にアイデアを取得
export async function getIdeasByCategory(category: string): Promise<IdeaData[]> {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ideas by category:', error)
    return []
  }

  if (!data) return []

  return data.map((record: any) => ({
    id: record.id!,
    title: record.title || '',
    slug: record.slug || '',
    category: record.category || '',
    tags: record.tags ? record.tags.split(',').map((t: string) => t.trim()) : [],
    price: record.price_range || '',
    duration: record.duration || '',
    description: extractDescription(record.mdx_content || '', record.notes || ''),
    features: extractFeatures(record.mdx_content || ''),
    benefits: extractBenefits(record.mdx_content || ''),
    technologies: extractTechnologies(record.mdx_content || ''),
    source: record.source
  }))
}

// スラッグでアイデアを取得
export async function getIdeaBySlug(slug: string): Promise<IdeaData | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    console.error('Error fetching idea by slug:', error)
    return null
  }

  return {
    id: data.id!,
    title: data.title || '',
    slug: data.slug || '',
    category: data.category || '',
    tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
    price: data.price_range || '',
    duration: data.duration || '',
    description: extractDescription(data.mdx_content || '', data.notes || ''),
    features: extractFeatures(data.mdx_content || ''),
    benefits: extractBenefits(data.mdx_content || ''),
    technologies: extractTechnologies(data.mdx_content || ''),
    source: data.source
  }
}

// MDXコンテンツから説明を抽出（改良版）
function extractDescription(mdxContent: string, notes: string): string {
  if (!mdxContent) return notes || ''

  try {
    // フロントマターからdescriptionを抽出
    const { data } = matter(mdxContent)
    if (data.description) {
      return data.description
    }
  } catch (error) {
    console.warn('Error parsing frontmatter:', error)
  }

  // フロントマターがない場合は、MDXコンテンツから抽出を試みる
  const patterns = [
    /## 解決策\s*\n\n([\s\S]*?)(?=\n##|$)/,
    /## 解決策の概要\s*\n\n([\s\S]*?)(?=\n##|$)/,
    /## 概要\s*\n\n([\s\S]*?)(?=\n##|$)/
  ]

  for (const pattern of patterns) {
    const match = mdxContent.match(pattern)
    if (match) {
      // 最初の段落のみ取得（改行まで）
      const firstParagraph = match[1].trim().split('\n')[0]
      if (firstParagraph) {
        return firstParagraph
      }
    }
  }

  // 最終的にnotesを返す
  return notes || ''
}

// MDXコンテンツから機能を抽出
function extractFeatures(mdxContent: string): string[] {
  const match = mdxContent.match(/## 主な機能\s*\n\n([\s\S]*?)(?=\n##|$)/)
  if (!match) return []
  
  const features = match[1].match(/- (.+)/g)
  return features ? features.map((f: string) => f.replace('- ', '')) : []
}

// MDXコンテンツから導入効果を抽出
function extractBenefits(mdxContent: string): string[] {
  const match = mdxContent.match(/## 導入効果\s*\n\n([\s\S]*?)(?=\n##|$)/)
  if (!match) return []
  
  const benefits = match[1].match(/- (.+)/g)
  return benefits ? benefits.map((b: string) => b.replace('- ', '')) : []
}

// MDXコンテンツから使用技術を抽出
function extractTechnologies(mdxContent: string): string[] {
  const match = mdxContent.match(/## 使用技術\s*\n\n([\s\S]*?)(?=\n##|$)/)
  if (!match) return []
  
  const tech = match[1].match(/- (.+)/g)
  return tech ? tech.map((t: string) => t.replace('- ', '')) : []
}