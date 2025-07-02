import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Google Sheets API の設定（後で実装）
// import { google } from 'googleapis'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // 1. スラッグの生成（タイトルから）
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // 2. MDXファイルの保存
    const ideasDir = path.join(process.cwd(), 'content/ideas')
    const filePath = path.join(ideasDir, `${slug}.mdx`)
    
    // ファイルが既に存在するかチェック
    try {
      await fs.access(filePath)
      return NextResponse.json(
        { error: '同じタイトルのアイデアが既に存在します' },
        { status: 400 }
      )
    } catch {
      // ファイルが存在しない場合は続行
    }

    // MDXファイルを保存
    await fs.writeFile(filePath, data.mdxContent, 'utf-8')

    // 3. データベースへの保存（将来的に実装）
    // await saveToDatabase(data)

    // 4. Google Sheetsへの保存
    // ここは環境変数の設定後に有効化します
    /*
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    const values = [[
      new Date().toISOString(),
      data.title,
      data.description,
      data.category,
      data.tags.join(', '),
      data.price,
      data.duration,
      data.targetUsers?.join(', ') || '',
      data.source,
      slug,
      '公開'
    ]]

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:K',
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    })
    */

    // 5. 成功レスポンス
    return NextResponse.json({
      success: true,
      slug,
      message: 'アイデアを保存しました'
    })

  } catch (error) {
    console.error('Error saving idea:', error)
    const errorMessage = error instanceof Error ? error.message : '保存中にエラーが発生しました'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}