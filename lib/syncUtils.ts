// 自動同期ユーティリティ関数

// アイデア保存後の自動同期
export async function syncAfterSave(ideaData: any, operation: 'create' | 'update') {
  try {
    console.log(`Starting auto-sync after ${operation}:`, ideaData.title);
    
    // Supabase → Google Sheets の同期を実行
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        direction: 'supabase-to-sheets'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Auto-sync successful:', result);
      return {
        success: true,
        message: `${operation === 'create' ? '追加' : '更新'}とGoogle Sheetsへの同期が完了しました`
      };
    } else {
      console.error('Auto-sync failed:', result.error);
      return {
        success: false,
        message: `${operation === 'create' ? '追加' : '更新'}は完了しましたが、Google Sheetsへの同期に失敗しました`
      };
    }
  } catch (error) {
    console.error('Auto-sync error:', error);
    return {
      success: false,
      message: `${operation === 'create' ? '追加' : '更新'}は完了しましたが、Google Sheetsへの同期でエラーが発生しました`
    };
  }
}

// 同期結果の通知
export function showSyncResult(result: { success: boolean; message: string }) {
  if (result.success) {
    alert(result.message);
  } else {
    alert(`${result.message}\n\n手動で同期を実行してください: /admin/sync`);
  }
}