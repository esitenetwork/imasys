'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from 'lucide-react'

function ContactForm() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    subject: '',
    systemCategory: '',
    ideaSlug: '',
    ideaTitle: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)

  // reCAPTCHAが読み込まれた時の処理
  const handleRecaptchaLoad = () => {
    setRecaptchaLoaded(true)
    // reCAPTCHAを手動でレンダリング
    renderRecaptcha()
  }

  // reCAPTCHAの手動レンダリング
  const renderRecaptcha = () => {
    const recaptchaElement = document.querySelector('.g-recaptcha')
    if ((window as any).grecaptcha && (window as any).grecaptcha.render && recaptchaElement) {
      // 既にレンダリング済みの場合はスキップ
      if (recaptchaElement.innerHTML.trim() === '') {
        try {
          (window as any).grecaptcha.render(recaptchaElement, {
            sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LftNXkrAAAAAPx5h79s1sWUZiOjssmB-bISFKYR'
          })
        } catch (error) {
          console.error('reCAPTCHA render error:', error)
        }
      }
    }
  }

  // reCAPTCHAの初期化チェック
  useEffect(() => {
    // 既にreCAPTCHAが利用可能な場合
    if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
      setRecaptchaLoaded(true)
      renderRecaptcha()
    }
  }, [])

  // recaptchaLoadedが変更された時にレンダリングを試行
  useEffect(() => {
    if (recaptchaLoaded) {
      // 少し遅延させてからレンダリング（DOM更新を待つ）
      setTimeout(() => {
        renderRecaptcha()
      }, 100)
    }
  }, [recaptchaLoaded])

  // URLパラメータから自動設定（システム詳細ページからのアクセス）
  useEffect(() => {
    const ideaSlug = searchParams.get('ideaSlug')
    const ideaTitle = searchParams.get('ideaTitle')
    
    if (ideaSlug && ideaTitle) {
      setFormData(prev => ({
        ...prev,
        subject: 'システム導入について',
        systemCategory: 'システム全般について', // 特定のシステムではなく全般に変更
        ideaSlug: ideaSlug,
        ideaTitle: ideaTitle,
        message: ''
      }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // reCAPTCHAトークンを取得
      const recaptchaResponse = (window as any).grecaptcha?.getResponse()
      if (!recaptchaResponse) {
        alert('reCAPTCHAを完了してください')
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: recaptchaResponse
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          company: '',
          name: '',
          email: '',
          subject: '',
          systemCategory: '',
          ideaSlug: '',
          ideaTitle: '',
          message: ''
        })
        // reCAPTCHAをリセット
        if ((window as any).grecaptcha) {
          (window as any).grecaptcha.reset()
        }
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      
      // 件名が変更された場合、systemCategoryをリセット
      if (name === 'subject' && value !== 'システム導入について') {
        newData.systemCategory = ''
        // 対象システム情報もクリア
        newData.ideaSlug = ''
        newData.ideaTitle = ''
      }
      
      return newData
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value }
      
      // 件名が変更された場合、systemCategoryをリセット
      if (name === 'subject' && value !== 'システム導入について') {
        newData.systemCategory = ''
        // 対象システム情報もクリア
        newData.ideaSlug = ''
        newData.ideaTitle = ''
      }
      
      return newData
    })
  }

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="afterInteractive"
        onLoad={handleRecaptchaLoad}
      />
      
      <div className="min-h-screen bg-background pt-16 pb-16">
        <div className="max-w-3xl mx-auto px-4 pt-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              お問い合わせ
            </h1>
            <p className="text-xl text-muted-foreground">
              AI業務改善システムの導入について、お気軽にご相談ください
            </p>
          </div>

          {submitStatus === 'success' && (
            <Alert className="mb-8 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                お問い合わせありがとうございます。24時間以内にご返信いたします。
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert className="mb-8 bg-red-50 text-red-800 border-red-200">
              <AlertDescription>
                送信に失敗しました。しばらく経ってから再度お試しください。
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>お問い合わせフォーム</CardTitle>
              <CardDescription>
                必要事項をご入力の上、送信してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 件名セクション - 一番上に配置 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">件名</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleSelectChange('subject', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="件名を選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="一般的なお問い合わせ">一般的なお問い合わせ</SelectItem>
                        <SelectItem value="システム導入について">システム導入について</SelectItem>
                        <SelectItem value="サービス全般について">サービス全般について</SelectItem>
                        <SelectItem value="料金について">料金について</SelectItem>
                        <SelectItem value="その他">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.subject === 'システム導入について' && (
                    <div className="space-y-2">
                      <Label htmlFor="systemCategory">詳細カテゴリ</Label>
                      <Select value={formData.systemCategory} onValueChange={(value) => handleSelectChange('systemCategory', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリを選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="特定のシステムについて">特定のシステムについて</SelectItem>
                          <SelectItem value="システム全般について">システム全般について</SelectItem>
                          <SelectItem value="新しいシステムについての相談">新しいシステムについての相談</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {formData.systemCategory === '特定のシステムについて' && (
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <div>
                        <p className="mb-3">
                          特定のシステムに関するお問い合わせは、各システム詳細ページの「無料相談を申し込む」ボタンからお問い合わせください。
                        </p>
                        <Button asChild variant="outline" size="sm">
                          <Link href="/">
                            システム一覧を見る
                          </Link>
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {formData.ideaTitle && (
                  <div className="space-y-2">
                    <Label>対象システム</Label>
                    <div className="px-4 py-3 bg-muted border border-border rounded-md text-foreground font-medium">
                      {formData.ideaTitle}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">会社名</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      placeholder="例：株式会社サンプル"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">担当者名</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="例：田中 太郎"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="例：tanaka@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">相談内容</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="現在の課題や実現したいことを具体的にお書きください"
                  />
                </div>

                {/* reCAPTCHA */}
                {recaptchaLoaded && (
                  <div className="g-recaptcha" data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LftNXkrAAAAAPx5h79s1sWUZiOjssmB-bISFKYR'}></div>
                )}

                <div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || (formData.systemCategory === '特定のシステムについて' && !formData.ideaTitle)}
                    size="lg"
                    className="px-8"
                  >
                    {isSubmitting ? '送信中...' : '送信'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  )
}