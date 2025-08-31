// Supabase設定
const SUPABASE_URL = 'https://ynqoyysstfqftibgmcbk.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ここにAnon Keyを設定
const SPREADSHEET_ID = '12zYI6DhYg1Yw6xCw2cbBifwFu4_iMsql9DuNMXPN4DI';
const SHEET_NAME = 'ideas';

/**
 * メニューに同期ボタンを追加
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Supabase同期')
    .addItem('今すぐ同期', 'syncSupabaseData')
    .addItem('自動同期を設定', 'setupAutoSync')
    .addItem('自動同期を停止', 'stopAutoSync')
    .addToUi();
}

/**
 * Supabaseからデータを取得してGoogle Sheetsに同期
 */
function syncSupabaseData() {
  try {
    // Supabaseからデータを取得
    const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/ideas?order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const ideas = JSON.parse(response.getContentText());
    
    // スプレッドシートを取得
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // ヘッダー行を保持して、データをクリア
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
    
    // データを変換して書き込み
    const rows = ideas.map(idea => [
      idea.id,
      formatDate(idea.created_at),
      idea.title,
      idea.category || '',
      idea.tags || '',
      idea.source || '',
      idea.status || 'draft',
      idea.slug,
      idea.notes || '',
      formatDate(idea.updated_at)
    ]);
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 10).setValues(rows);
    }
    
    // 最終同期時刻を記録
    const now = new Date();
    sheet.getRange(1, 12).setValue(`最終同期: ${formatDateTime(now)}`);
    
    SpreadsheetApp.getUi().alert(`同期完了: ${rows.length}件のアイデアを更新しました`);
    
  } catch (error) {
    console.error('同期エラー:', error);
    SpreadsheetApp.getUi().alert('エラーが発生しました: ' + error.toString());
  }
}

/**
 * 日付をフォーマット
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return Utilities.formatDate(date, 'JST', 'yyyy-MM-dd');
}

/**
 * 日時をフォーマット
 */
function formatDateTime(date) {
  return Utilities.formatDate(date, 'JST', 'yyyy-MM-dd HH:mm:ss');
}

/**
 * 自動同期を設定（1時間ごと）
 */
function setupAutoSync() {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncSupabaseData') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // 新しいトリガーを作成（1時間ごと）
  ScriptApp.newTrigger('syncSupabaseData')
    .timeBased()
    .everyHours(1)
    .create();
    
  SpreadsheetApp.getUi().alert('自動同期を設定しました（1時間ごと）');
}

/**
 * 自動同期を停止
 */
function stopAutoSync() {
  const triggers = ScriptApp.getProjectTriggers();
  let count = 0;
  
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncSupabaseData') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  
  if (count > 0) {
    SpreadsheetApp.getUi().alert('自動同期を停止しました');
  } else {
    SpreadsheetApp.getUi().alert('自動同期は設定されていません');
  }
} 