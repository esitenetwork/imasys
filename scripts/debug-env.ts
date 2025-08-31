import { config } from 'dotenv'

// .env.localファイルを読み込み
config({ path: '.env.local' })

console.log('🔍 Debugging environment variables...')
console.log('')

console.log('NEW_SUPABASE_URL:', process.env.NEW_SUPABASE_URL)
console.log('NEW_SUPABASE_ANON_KEY:', process.env.NEW_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
console.log('NEW_SUPABASE_SERVICE_ROLE_KEY:', process.env.NEW_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')

console.log('')
console.log('All NEW_* environment variables:')
Object.keys(process.env).filter(key => key.startsWith('NEW_')).forEach(key => {
  console.log(`${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`)
})
