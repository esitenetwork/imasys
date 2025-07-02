'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface IdeaRow {
  id: string;
  createdAt: string;
  title: string;
  category: string;
  tags: string;
  priceRange: string;
  duration: string;
  source: string;
  status: string;
  slug: string;
  notes: string;
}

export default function AdminSheetsPage() {
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  // アイデア一覧を取得
  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sheets/ideas');
      const data = await response.json();
      
      if (data.success) {
        setIdeas(data.ideas);
      } else {
        setError('Failed to fetch ideas');
      }
    } catch (err) {
      setError('Error connecting to Google Sheets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  // ステータスを更新
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/sheets/ideas', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // 成功したらリストを更新
        await fetchIdeas();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // MDXファイルと同期（将来の実装用）
  const syncWithMDX = async () => {
    setSyncing(true);
    // TODO: MDXファイルとの同期処理
    setTimeout(() => {
      setSyncing(false);
      alert('同期機能は開発中です');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Google Sheets 連携</h1>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Google Sheets 連携</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={fetchIdeas}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Google Sheets 連携</h1>
        <div className="space-x-4">
          <button
            onClick={fetchIdeas}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            更新
          </button>
          <button
            onClick={syncWithMDX}
            disabled={syncing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {syncing ? '同期中...' : 'MDXと同期'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ideas.map((idea) => (
              <tr key={idea.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {idea.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/ideas/${idea.slug}`}
                    className="text-blue-600 hover:text-blue-800"
                    target="_blank"
                  >
                    {idea.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {idea.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={idea.status}
                    onChange={(e) => updateStatus(idea.id, e.target.value)}
                    className="text-sm rounded-md border-gray-300"
                  >
                    <option value="draft">下書き</option>
                    <option value="published">公開</option>
                    <option value="archived">アーカイブ</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {idea.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/admin/edit/${idea.slug}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {ideas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            アイデアがありません
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>合計: {ideas.length} 件のアイデア</p>
        <p className="mt-2">
          <a
            href={`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID || '12zYI6DhYg1Yw6xCw2cbBifwFu4_iMsql9DuNMXPN4DI'}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Google Sheetsで開く →
          </a>
        </p>
      </div>
    </div>
  );
}