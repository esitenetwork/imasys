'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'

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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="afterInteractive"
      />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            お問い合わせ
          </h1>
          <p className="text-xl text-gray-600">
            AI業務改善システムの導入について、お気軽にご相談ください
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              お問い合わせありがとうございます。24時間以内にご返信いたします。
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              送信に失敗しました。しばらく経ってから再度お試しください。
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 件名セクション - 一番上に配置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                件名
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">件名を選択してください</option>
                <option value="一般的なお問い合わせ">一般的なお問い合わせ</option>
                <option value="システム導入について">システム導入について</option>
                <option value="サービス全般について">サービス全般について</option>
                <option value="料金について">料金について</option>
                <option value="その他">その他</option>
              </select>
            </div>

            {formData.subject === 'システム導入について' && (
              <div>
                <label htmlFor="systemCategory" className="block text-sm font-medium text-gray-700 mb-2">
                  詳細カテゴリ
                </label>
                <select
                  id="systemCategory"
                  name="systemCategory"
                  value={formData.systemCategory}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">カテゴリを選択してください</option>
                  <option value="特定のシステムについて">特定のシステムについて</option>
                  <option value="システム全般について">システム全般について</option>
                  <option value="新しいシステムについての相談">新しいシステムについての相談</option>
                </select>
              </div>
            )}
          </div>

          {formData.systemCategory === '特定のシステムについて' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    特定のシステムに関するお問い合わせは、各システム詳細ページの「無料相談を申し込む」ボタンからお問い合わせください。
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      システム一覧を見る
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.ideaTitle && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対象システム
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-bold">
                {formData.ideaTitle}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                会社名
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：株式会社サンプル"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                担当者名
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：田中 太郎"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例：tanaka@example.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              相談内容
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="現在の課題や実現したいことを具体的にお書きください"
            />
          </div>

          {/* reCAPTCHA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              認証
            </label>
            <div className="g-recaptcha" data-sitekey="6LftNXkrAAAAAPx5h79s1sWUZiOjssmB-bISFKYR"></div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || (formData.systemCategory === '特定のシステムについて' && !formData.ideaTitle)}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '送信中...' : '送信'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-16 text-center">Loading...</div>}>
      <ContactForm />
    </Suspense>
  )
}