# イマシス アイデアマスターDB スクレイピングシステム

> 8つの主要プラットフォームから自動化テンプレートを収集し、中小企業向けの高品質なソリューション提案を生成するシステム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40+-blue.svg)](https://playwright.dev/)

## 📋 概要

イマシスアイデアマスターDBスクレイピングシステムは、以下の8つのプラットフォームから自動化テンプレートとツール情報を自動収集し、日本の中小企業向けに最適化されたソリューション提案データベースを構築するシステムです。

### 🎯 目標
- **年間1,000件以上**の高品質ソリューション提案の生成
- **約20,000件**のアイデアシードの収集
- **月次自動更新**による最新情報の維持

## 🌐 対象プラットフォーム

| プラットフォーム | 収集対象 | 期待件数 | 状況 |
|----------------|----------|----------|------|
| **n8n.io** | ワークフローテンプレート | ~3,900件 | ✅ API対応 |
| **Zapier** | 自動化テンプレート | ~5,000件 | 🔧 開発中 |
| **Make (Integromat)** | シナリオテンプレート | ~2,000件 | 🔧 開発中 |
| **Power Automate** | フローテンプレート | ~1,500件 | 🔧 開発中 |
| **awesome-selfhosted** | オープンソースツール | ~1,200件 | ✅ 動作確認済み |
| **awesome-n8n** | n8n関連リソース | ~200件 | 🔧 修正中 |
| **IFTTT** | アプレット | ~3,000件 | 🔧 開発中 |
| **Airtable Universe** | テンプレート | ~800件 | 🔧 開発中 |

## 🏗️ システム構成

```
idea_db/
├── src/
│   ├── scrapers/           # プラットフォーム別スクレイパー
│   │   ├── base.js         # ベーススクレイパークラス
│   │   ├── n8nScraper.js   # n8n.io スクレイパー
│   │   ├── zapierScraper.js
│   │   ├── makeScraper.js
│   │   └── ...
│   ├── utils/
│   │   ├── logger.js       # ログ管理
│   │   └── dataManager.js  # データ管理・永続化
│   ├── config.js           # 設定管理
│   ├── scraper.js          # メインオーケストレーター
│   └── index.js            # エントリーポイント
├── .github/workflows/
│   └── scraping.yml        # GitHub Actions自動実行
├── data/                   # 収集データ（CSV形式）
├── logs/                   # ログファイル
└── config.env              # 環境変数設定
```

## 🚀 セットアップ

### 前提条件
- Node.js 18以上
- Google Sheets API アクセス権限
- 各プラットフォームへのアクセス権

### 1. 依存関係のインストール

```bash
cd idea_db
npm install
```

### 2. Playwrightブラウザのインストール

```bash
npx playwright install
```

### 3. 環境変数の設定

`config.env`ファイルを作成し、以下を設定：

```env
# Google Sheets API設定
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"

# スクレイピング設定
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
DELAY_BETWEEN_REQUESTS=2000
MAX_CONCURRENT_REQUESTS=3

# デバッグ設定
DEBUG_MODE=true
LOG_LEVEL=info
```

### 4. Google Spreadsheetsの準備

以下の3つのシートを含むスプレッドシートを作成：
- `raw_data`: 生データ
- `imasys_ideas`: イマシス用アイデア
- `statistics`: 統計情報

## 📖 使用方法

### 基本的な実行コマンド

```bash
# 全プラットフォームのスクレイピング実行
npm start

# テスト実行（データ保存なし）
npm run test

# 特定プラットフォームのみ実行
npm run scrape single n8n
npm run scrape single zapier

# ヘルプ表示
npm run scrape help
```

### 実行オプション

| コマンド | 説明 | 実行例 |
|----------|------|--------|
| `npm start` | 全プラットフォーム実行 | すべてのスクレイパーを順次実行 |
| `npm run test` | テストモード | データ保存せずに動作確認 |
| `npm run scrape single <platform>` | 単一プラットフォーム | 指定プラットフォームのみ実行 |

### プラットフォーム指定子

- `n8n` - n8n.io
- `zapier` - Zapier
- `make` - Make (Integromat)
- `powerAutomate` - Power Automate
- `awesomeSelfhosted` - awesome-selfhosted
- `awesomeN8n` - awesome-n8n
- `ifttt` - IFTTT
- `airtable` - Airtable Universe

## 📊 出力データ形式

### raw_data.csv
```csv
Title,Description,Used Tools/Tags,Category,URL,Scraped Date,Platform
"Slack通知自動化","Slackへの自動通知システム","Slack,Webhook,API","コミュニケーション","https://example.com","2025-01-27","n8n"
```

### statistics.csv
```csv
Platform,Total Count,Success Count,Error Count,Last Updated
n8n,3891,3750,141,2025-01-27 10:30:00
awesome-selfhosted,1122,1122,0,2025-01-27 10:35:00
```

## 🔧 設定詳細

### config.js 主要設定

```javascript
module.exports = {
  // Google Sheets設定
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY
  },
  
  // スクレイピング設定
  scraping: {
    userAgent: process.env.USER_AGENT,
    delay: parseInt(process.env.DELAY_BETWEEN_REQUESTS) || 2000,
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 3,
    timeout: 30000
  },
  
  // プラットフォーム設定
  platforms: {
    n8n: {
      name: 'n8n',
      enabled: true,
      apiUrl: 'https://api.n8n.io/templates/search',
      workflowsUrl: 'https://n8n.io/workflows/'
    }
    // ... 他のプラットフォーム
  }
};
```

## 🤖 自動実行（GitHub Actions）

### 月次自動実行
毎月1日の午前2時に自動実行されます。

### 手動実行
GitHub Actionsから手動で実行可能：
1. リポジトリの「Actions」タブを開く
2. 「イマシス アイデア収集システム」を選択
3. 「Run workflow」をクリック
4. オプションを選択して実行

### 実行オプション
- **プラットフォーム**: 特定プラットフォームのみ実行
- **テストモード**: データ保存なしで動作確認

## 📋 ログ機能

### ログレベル
- `error`: エラー情報
- `warn`: 警告情報
- `info`: 一般情報
- `debug`: デバッグ情報
- `success`: 成功情報

### ログ出力例
```
[2025-01-27 10:30:15] INFO n8n: API経由でのスクレイピング開始
[2025-01-27 10:30:16] INFO n8n: ページ1をリクエスト中...
[2025-01-27 10:30:17] INFO n8n: レスポンス受信 - ステータス: 200
[2025-01-27 10:30:17] INFO n8n: 抽出されたワークフロー数: 50
[2025-01-27 10:30:18] SUCCESS n8n: ページ1完了 (50件)
```

## 🚨 エラーハンドリング

### 主要なエラーケース
1. **APIレート制限**: 自動リトライと遅延調整
2. **ネットワークエラー**: タイムアウトとリトライ機能
3. **認証エラー**: 詳細なエラーログと対処法表示
4. **データ形式エラー**: スキップして処理継続

### エラー時の動作
- 個別スクレイパーエラー → 他のプラットフォーム継続
- 致命的エラー → 安全に処理停止
- 部分的成功 → 取得済みデータは保存

## 🔄 データフロー

```mermaid
graph TD
    A[開始] --> B[設定読み込み]
    B --> C[スクレイパー初期化]
    C --> D[既存データ読み込み]
    D --> E[各プラットフォーム実行]
    E --> F[データ正規化]
    F --> G[重複除去]
    G --> H[CSV保存]
    H --> I[Google Sheets同期]
    I --> J[統計更新]
    J --> K[完了]
```

## 📈 パフォーマンス

### 処理時間目安
- **n8n**: 約15分（3,900件）
- **awesome-selfhosted**: 約5分（1,200件）
- **全プラットフォーム**: 約60-90分

### リソース使用量
- **メモリ**: 200-500MB
- **CPU**: 軽度（Playwright実行時のみ中程度）
- **ネットワーク**: 平均50KB/秒

## 🛠️ 開発・拡張

### 新しいスクレイパーの追加

1. `src/scrapers/` に新しいスクレイパーを作成
2. `BaseScraper` を継承
3. `scrape()` メソッドを実装
4. `config.js` にプラットフォーム設定を追加

```javascript
// 例: newPlatformScraper.js
class NewPlatformScraper extends BaseScraper {
  async scrape() {
    // スクレイピングロジック
    return normalizedData;
  }
}
```

### デバッグモード

```bash
# 詳細ログ有効
DEBUG_MODE=true npm run test

# 特定プラットフォームのデバッグ
DEBUG_MODE=true npm run scrape single n8n
```

## 📞 サポート・トラブルシューティング

### よくある問題

**Q: n8nのAPIから空のデータが返される**
A: APIエンドポイントまたはレスポンス形式が変更された可能性があります。ログを確認してください。

**Q: Google Sheetsに同期されない**
A: Service Accountの権限とスプレッドシートの共有設定を確認してください。

**Q: Playwrightでブラウザが起動しない**
A: `npx playwright install` でブラウザを再インストールしてください。

### ログファイルの場所
- 一般ログ: `logs/scraping.log`
- エラーログ: `logs/error.log`
- デバッグログ: `logs/debug.log`

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. Pull Requestを作成

---

**開発者**: イマシス開発チーム  
**最終更新**: 2025年1月27日  
**バージョン**: 1.0.0 