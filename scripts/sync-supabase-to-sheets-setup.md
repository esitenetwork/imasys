# Google Apps Script (GAS) でSupabaseとGoogle Sheetsを同期する

## 概要
n8nのGoogle Sheetsノードで問題が発生しているため、代替案としてGASを使用してSupabaseからデータを取得し、Google Sheetsに同期します。

## セットアップ手順

### 1. SupabaseのAnon Keyを取得
1. Supabaseダッシュボードにログイン
2. プロジェクトの「Settings」→「API」に移動
3. 「Project API keys」セクションの「anon」キーをコピー

### 2. Google Sheetsでスクリプトエディタを開く
1. Google Sheets（https://docs.google.com/spreadsheets/d/12zYI6DhYg1Yw6xCw2cbBifwFu4_iMsql9DuNMXPN4DI）を開く
2. メニューから「拡張機能」→「Apps Script」を選択

### 3. スクリプトをコピー
1. 既存のコードをすべて削除
2. `scripts/sync-supabase-to-sheets.gs`の内容をコピー＆ペースト
3. `SUPABASE_ANON_KEY`の値を実際のAnon Keyに置き換え

### 4. スクリプトを保存・実行
1. Ctrl+S（またはCmd+S）で保存
2. 「実行」ボタンをクリック
3. 初回実行時は権限の承認が必要

### 5. 使い方
スプレッドシートを開き直すと、メニューに「Supabase同期」が追加されます：
- **今すぐ同期**: 手動でSupabaseからデータを取得
- **自動同期を設定**: 1時間ごとに自動同期
- **自動同期を停止**: 自動同期を無効化

## データマッピング
| Google Sheets列 | Supabaseフィールド |
|----------------|-------------------|
| ID | id |
| 作成日 | created_at |
| タイトル | title |
| カテゴリ | category |
| タグ | tags |
| 元ネタ | source |
| ステータス | status |
| スラッグ | slug |
| 備考 | notes |
| 更新日 | updated_at |

## 注意事項
- 同期は全データを取得して上書きします（増分同期ではありません）
- Google Sheetsの1行目（ヘッダー）は保持されます
- 最終同期時刻はL1セル（12列目）に記録されます

## トラブルシューティング
- **エラー: 401 Unauthorized**: Anon Keyが正しくない
- **エラー: Network error**: SupabaseのURLが正しくない、またはネットワーク接続の問題
- **データが表示されない**: シート名が「ideas」になっているか確認 