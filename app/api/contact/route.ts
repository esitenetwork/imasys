import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend('re_Fq5bJGLh_Fi3dWabXy3eST548p5bUB3zk')

export async function POST(request: Request) {
  try {
    console.log('=== Contact API Started ===')
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    
    const body = await request.json()
    console.log('Request body:', body)
    const { company, name, email, ideaSlug, message } = body

    // バリデーション
    if (!company || !name || !email || !message) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    // メール送信
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'info@imasys.jp',
      subject: `【イマシス】お問い合わせ：${company} ${name}様`,
      html: `
        <h2>お問い合わせが届きました</h2>
        
        <h3>お客様情報</h3>
        <ul>
          <li><strong>会社名:</strong> ${company}</li>
          <li><strong>担当者名:</strong> ${name}</li>
          <li><strong>メールアドレス:</strong> ${email}</li>
          <li><strong>相談したいアイデア:</strong> ${ideaSlug || '未選択'}</li>
        </ul>

        <h3>相談内容</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>

        <hr>
        <p><small>このメールは https://imasys.jp のお問い合わせフォームから送信されました。</small></p>
      `,
    })

    // 自動返信メール
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: '【イマシス】お問い合わせありがとうございます',
      html: `
        <h2>${name}様</h2>
        
        <p>この度は、今どきシステム導入ラボ「イマシス」にお問い合わせいただき、ありがとうございます。</p>
        
        <p>以下の内容でお問い合わせを受け付けいたしました：</p>
        
        <h3>お問い合わせ内容</h3>
        <ul>
          <li><strong>会社名:</strong> ${company}</li>
          <li><strong>担当者名:</strong> ${name}</li>
          <li><strong>相談したいアイデア:</strong> ${ideaSlug || '未選択'}</li>
        </ul>
        
        <p><strong>相談内容:</strong><br>
        ${message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        
        <p>24時間以内に担当者よりご返信させていただきます。</p>
        <p>何かご不明な点がございましたら、お気軽にお問い合わせください。</p>
        
        <p>今後ともよろしくお願いいたします。</p>
        
        <p>今どきシステム導入ラボ「イマシス」<br>
        https://imasys.jp</p>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'お問い合わせを受け付けました'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'メール送信に失敗しました' },
      { status: 500 }
    )
  }
}