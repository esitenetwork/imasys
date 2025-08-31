import { createClient } from '@supabase/supabase-js'

// 新しいSupabaseデータベースの環境変数を取得する関数
function getNewSupabaseConfig() {
  const newSupabaseUrl = process.env.NEW_SUPABASE_URL
  const newSupabaseAnonKey = process.env.NEW_SUPABASE_ANON_KEY
  const newSupabaseServiceKey = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY

  // 環境変数のチェック（開発環境では警告のみ）
  if (!newSupabaseUrl || !newSupabaseAnonKey) {
    console.warn('New Supabase environment variables are not set')
    console.log('Debug - URL:', newSupabaseUrl)
    console.log('Debug - Anon Key:', newSupabaseAnonKey ? 'SET' : 'NOT SET')
    return { url: null, anonKey: null, serviceKey: null }
  }

  return { url: newSupabaseUrl, anonKey: newSupabaseAnonKey, serviceKey: newSupabaseServiceKey }
}

// 新しいデータベース用の公開クライアント（ブラウザでも使用可能）
export function getNewSupabase() {
  const config = getNewSupabaseConfig()
  return config.url && config.anonKey
    ? createClient(config.url, config.anonKey)
    : null
}

// 新しいデータベース用のサーバー専用クライアント（より高い権限）
export function getNewSupabaseAdmin() {
  const config = getNewSupabaseConfig()
  return config.url && config.serviceKey
    ? createClient(config.url, config.serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null
}

// 後方互換性のためのエクスポート
export const newSupabase = getNewSupabase()
export const newSupabaseAdmin = getNewSupabaseAdmin()

// データベースの型定義（実際のテーブル構造に合わせて修正）
export interface IdeaRecord {
  id?: number
  created_at?: string
  title: string
  category: string | null
  tags: string | null
  source: string | null
  status: string
  slug: string
  notes: string | null
  mdx_content: string | null
  updated_at?: string
}
