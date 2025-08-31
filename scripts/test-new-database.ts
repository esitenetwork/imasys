import { config } from 'dotenv'
import { getNewSupabase, getNewSupabaseAdmin } from '../lib/supabase-new'

// .env.localファイルを読み込み
config({ path: '.env.local' })

async function testNewDatabase() {
  console.log('🔍 Testing new Supabase database connection...')
  
  // デバッグ情報を表示
  console.log('Environment variables:')
  console.log('NEW_SUPABASE_URL:', process.env.NEW_SUPABASE_URL ? 'SET' : 'NOT SET')
  console.log('NEW_SUPABASE_ANON_KEY:', process.env.NEW_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
  console.log('NEW_SUPABASE_SERVICE_ROLE_KEY:', process.env.NEW_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
  console.log('')
  
  try {
    // 新しいデータベースの接続テスト
    const newSupabase = getNewSupabase()
    if (!newSupabase) {
      console.error('❌ New Supabase client is not initialized')
      console.log('URL:', process.env.NEW_SUPABASE_URL)
      console.log('Anon Key length:', process.env.NEW_SUPABASE_ANON_KEY?.length || 0)
      return
    }

    console.log('✅ New Supabase client initialized successfully')
    
    // テーブル一覧を取得してテスト
    const { data: tables, error: tablesError } = await newSupabase
      .from('ideas')
      .select('*')
      .limit(1)

    if (tablesError) {
      console.error('❌ Error accessing ideas table:', tablesError.message)
      return
    }

    console.log('✅ Successfully connected to new database')
    console.log(`📊 Found ${tables?.length || 0} records in ideas table`)
    
    // 管理者クライアントのテスト
    const newSupabaseAdmin = getNewSupabaseAdmin()
    if (newSupabaseAdmin) {
      console.log('✅ Admin client also available')
    } else {
      console.warn('⚠️ Admin client not available')
    }

    console.log('🎉 New database connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error testing new database:', error)
  }
}

// スクリプトを実行
testNewDatabase()
