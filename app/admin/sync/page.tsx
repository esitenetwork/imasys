'use client';

import { useState, useEffect } from 'react';

export default function SyncPage() {
  const [data, setData] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingSync, setIsLoadingSync] = useState(false);

  const fetchData = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await fetch('/api/sync');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const performSync = async (direction: string) => {
    setIsLoadingSync(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      });
      const result = await response.json();
      
      // 結果を分かりやすく表示
      if (result.success) {
        const message = `同期が完了しました！\n\n` +
          `新規追加: ${result.result?.inserted || 0}件\n` +
          `更新: ${result.result?.updated || 0}件`;
        alert(message);
        
        // 同期後に状況を更新
        await fetchData();
      } else {
        alert(`同期に失敗しました: ${result.error || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('同期中にエラーが発生しました');
    } finally {
      setIsLoadingSync(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">データ同期管理</h1>
      
      {/* 同期状況 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">同期状況</h2>
          <button
            onClick={fetchData}
            disabled={isLoadingStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoadingStatus && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            {isLoadingStatus ? '取得中...' : '状況を確認'}
          </button>
        </div>

        {isLoadingStatus && !data ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">データを取得しています...</span>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Google Sheets</div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.status?.sheetsCount || 0}件
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Supabase</div>
                <div className="text-2xl font-bold text-green-600">
                  {data.status?.supabaseCount || 0}件
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">最終確認</div>
                <div className="text-sm font-medium">
                  {data.status?.lastSync ? new Date(data.status.lastSync).toLocaleString('ja-JP') : '-'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            「状況を確認」ボタンをクリックしてください
          </div>
        )}
      </div>

      {/* 同期操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">同期操作</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Supabaseのデータをマスターデータ管理用のGoogle Sheetsに同期します
          </p>
        </div>
        <div className="max-w-md">
          <button
            onClick={() => performSync('supabase-to-sheets')}
            disabled={isLoadingSync}
            className="w-full p-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoadingSync && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            {isLoadingSync ? '同期中...' : 'Supabase → Google Sheets'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            データベースの内容をスプレッドシートに反映します
          </p>
        </div>
      </div>
    </div>
  );
}