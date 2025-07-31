const fs = require('fs').promises;
const path = require('path');
const logger = require('./utils/logger');

async function setup() {
  try {
    console.log(`
╔══════════════════════════════════════════╗
║     イマシス アイデア収集システム         ║
║            初期セットアップ              ║
╚══════════════════════════════════════════╝
    `);

    // 1. 環境変数ファイルの確認
    await checkEnvironmentFile();
    
    // 2. ディレクトリ構造の確認
    await checkDirectoryStructure();
    
    // 3. CSVファイルの初期化
    await initializeCSVFiles();
    
    // 4. 権限の確認
    await checkPermissions();
    
    console.log(`
✅ セットアップ完了！

🚀 次のステップ:
  1. .env ファイルに Google Sheets の認証情報を設定
  2. npm run scrape test でテスト実行
  3. npm start で本格実行

📖 詳細は README.md をご確認ください。
    `);

  } catch (error) {
    logger.error('セットアップエラー:', error);
    process.exit(1);
  }
}

async function checkEnvironmentFile() {
  const envPath = path.join(__dirname, '../.env');
  const envExamplePath = path.join(__dirname, '../env.example');
  
  try {
    await fs.access(envPath);
    logger.info('✅ .env ファイルが存在します');
  } catch {
    try {
      const exampleContent = await fs.readFile(envExamplePath, 'utf8');
      await fs.writeFile(envPath, exampleContent);
      logger.info('✅ .env ファイルを作成しました（env.example からコピー）');
      console.log('⚠️  .env ファイルを編集して認証情報を設定してください');
    } catch (error) {
      logger.warn('⚠️  .env ファイルの作成に失敗しました:', error.message);
    }
  }
}

async function checkDirectoryStructure() {
  const requiredDirs = [
    'src/scrapers',
    'src/utils',
    'logs',
    'data'
  ];

  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, '..', dir);
    try {
      await fs.access(dirPath);
      logger.info(`✅ ディレクトリ存在確認: ${dir}`);
    } catch {
      try {
        await fs.mkdir(dirPath, { recursive: true });
        logger.info(`✅ ディレクトリ作成: ${dir}`);
      } catch (error) {
        logger.warn(`⚠️  ディレクトリ作成失敗: ${dir}`, error.message);
      }
    }
  }
}

async function initializeCSVFiles() {
  const csvFiles = [
    {
      name: 'raw_data.csv',
      headers: 'id,platform,title,description,tools_tags,category,url,scraped_date,is_new'
    },
    {
      name: 'imasys_ideas.csv', 
      headers: 'id,raw_id,industry,challenge,jp_title,jp_description,source,status,created_date'
    },
    {
      name: 'statistics.csv',
      headers: 'platform,total,new_this_month,used,unused'
    }
  ];

  for (const file of csvFiles) {
    const filePath = path.join(__dirname, '..', file.name);
    try {
      await fs.access(filePath);
      logger.info(`✅ CSVファイル存在確認: ${file.name}`);
    } catch {
      try {
        await fs.writeFile(filePath, file.headers + '\n');
        logger.info(`✅ CSVファイル作成: ${file.name}`);
      } catch (error) {
        logger.warn(`⚠️  CSVファイル作成失敗: ${file.name}`, error.message);
      }
    }
  }
}

async function checkPermissions() {
  try {
    // 書き込み権限のテスト
    const testFile = path.join(__dirname, '..', '.test-write');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    logger.info('✅ ファイル書き込み権限確認');
  } catch (error) {
    logger.warn('⚠️  ファイル書き込み権限に問題があります:', error.message);
  }
}

// バージョン情報の表示
function showVersionInfo() {
  const packageJson = require('../package.json');
  console.log(`
📦 システム情報:
  - バージョン: ${packageJson.version}
  - Node.js: ${process.version}
  - プラットフォーム: ${process.platform}
  - アーキテクチャ: ${process.arch}
  `);
}

if (require.main === module) {
  showVersionInfo();
  setup();
}

module.exports = { setup }; 