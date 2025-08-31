import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // n8nワークフローのwebhook URL (Claude版)
    const n8nWebhookUrl = 'http://n8n.imasys.jp:5678/webhook/imasys-idea-generator'
    
    console.log('n8nワークフロー（ChatGPT版）を実行中...', { body, n8nWebhookUrl })
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          source_type: body.source_type || 'お任せ（人気ソースから自動選択）',
          category_preference: body.category_preference || 'お任せ（AI自動選択）',
          quality_level: body.quality_level || 'お任せ（標準品質）',
          generation_count: body.generation_count || 1
        }
      }),
      signal: AbortSignal.timeout(10000) // 10秒でタイムアウト
    })
    
    if (!response.ok) {
      throw new Error(`n8nワークフロー実行エラー: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('n8nワークフロー実行結果:', result)
    
    return NextResponse.json({ 
      success: true, 
      message: 'n8nワークフローが正常に実行されました',
      result 
    })
    
  } catch (error) {
    console.error('n8nワークフロー実行エラー:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 