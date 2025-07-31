#!/usr/bin/env node

const MainScraper = require('./scraper');
const logger = require('./utils/logger');

async function main() {
  try {
    console.log(`
╔══════════════════════════════════════════╗
║       イマシス アイデア収集システム        ║
║    AI業務改善システム発見プラットフォーム   ║
╚══════════════════════════════════════════╝
    `);

    const scraper = new MainScraper();
    
    // コマンドライン引数の処理
    const args = process.argv.slice(2);
    const command = args[0];
    const platform = args[1];

    switch (command) {
      case 'test':
        logger.info('🧪 テストモードで実行します');
        await scraper.runTest();
        break;
        
      case 'single':
        if (!platform) {
          console.log('📋 使用可能なプラットフォーム:');
          scraper.scrapers.forEach((s, i) => {
            console.log(`  ${i + 1}. ${s.platformName}`);
          });
          console.log('\n使用法: npm run scrape single [platform-name]');
          console.log('例: npm run scrape single n8n');
          return;
        }
        
        logger.info(`🎯 ${platform} のみを実行します`);
        await scraper.runSingle(platform);
        break;
        
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
        
      default:
        logger.info('🚀 全プラットフォームを実行します');
        console.log('⚠️  この操作は8つのサイトにアクセスします。');
        console.log('⚠️  各サイトの利用規約を遵守し、適切な間隔でアクセスします。');
        console.log('');
        
        // 実行確認
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          rl.question('実行しますか？ (y/N): ', resolve);
        });
        rl.close();
        
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          logger.info('実行を中止しました');
          return;
        }
        
        const result = await scraper.run();
        
        console.log(`
╔══════════════════════════════════════════╗
║               実行結果                   ║
╠══════════════════════════════════════════╣
║ 総収集数: ${String(result.total).padStart(6)} 件             ║
║ 新規追加: ${String(result.newData).padStart(6)} 件             ║
║ 重複除外: ${String(result.duplicates).padStart(6)} 件             ║
╚══════════════════════════════════════════╝
        `);
        break;
    }
    
  } catch (error) {
    logger.error('システムエラー:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
📖 イマシス アイデア収集システム ヘルプ

🎯 使用方法:
  npm start                     - 全プラットフォーム実行
  npm run scrape test          - テスト実行（保存なし）
  npm run scrape single <name> - 単一プラットフォーム実行
  npm run scrape help          - このヘルプを表示

🌐 対象プラットフォーム:
  • n8n                - ワークフローテンプレート
  • zapier             - 統合テンプレート  
  • make               - シナリオテンプレート
  • powerAutomate      - フローテンプレート
  • awesomeSelfhosted  - セルフホストツール
  • awesomeN8n         - n8nワークフロー集
  • ifttt              - アプレット
  • airtable           - データベーステンプレート

📝 例:
  npm run scrape single n8n
  npm run scrape test
  npm start

⚙️  設定:
  env.example をコピーして .env を作成し、
  Google Sheets の認証情報を設定してください。
  `);
}

if (require.main === module) {
  main();
}

module.exports = { main }; 