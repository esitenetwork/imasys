// 環境変数を読み込む
import dotenv from 'dotenv'
import path from 'path'

// .env.localファイルのパスを明示的に指定
const envPath = path.resolve(process.cwd(), '.env.local')
console.log('Loading env from:', envPath)
dotenv.config({ path: envPath })

// 環境変数の確認
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set')

// 環境変数を設定した後でインポート
import { getAllIdeas } from '../lib/mdx'
import fs from 'fs'

// Supabaseを直接初期化
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function migrateMDXToSupabase() {
  console.log('Starting migration from MDX to Supabase...')
  
  // Supabaseクライアントの確認
  if (!supabaseAdmin) {
    console.error('Supabase client is not initialized. Check your environment variables.')
    return
  }
  
  try {
    // 1. MDXファイルからアイデアを取得
    const ideas = await getAllIdeas()
    console.log(`Found ${ideas.length} ideas to migrate`)

    // 2. 各アイデアをSupabaseに挿入
    for (const idea of ideas) {
      console.log(`Migrating: ${idea.title}`)
      
      // MDXファイルの内容を読み込む
      const mdxPath = path.join(process.cwd(), 'content', 'ideas', `${idea.slug}.mdx`)
      const mdxContent = fs.readFileSync(mdxPath, 'utf-8')
      
      // Supabaseに挿入するデータ
      const record = {
        title: idea.title,
        category: idea.category,
        tags: idea.tags.join(','), // 配列を文字列に変換
        price_range: idea.price,
        duration: idea.duration,
        source: idea.source,
        status: 'published', // 既存のものは公開済みとする
        slug: idea.slug,
        notes: '', // 空でOK
        mdx_content: mdxContent,
        created_at: new Date().toISOString()
      }

      // Supabaseに挿入
      const { data, error } = await supabaseAdmin
        .from('ideas')
        .insert(record)
        .select()

      if (error) {
        console.error(`Error migrating ${idea.title}:`, error)
      } else {
        console.log(`✓ Successfully migrated: ${idea.title}`)
      }
    }

    // 3. 移行結果の確認
    const { count, error: countError } = await supabaseAdmin
      .from('ideas')
      .select('*', { count: 'exact', head: true })

    if (!countError) {
      console.log(`\nMigration complete! Total ideas in Supabase: ${count}`)
    }

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// スクリプトを実行
migrateMDXToSupabase()