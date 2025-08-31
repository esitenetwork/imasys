const DataManager = require('./utils/dataManager');
const logger = require('./utils/logger');

// 各スクレイパーをインポート
const N8nScraper = require('./scrapers/n8nScraper');
const ZapierScraper = require('./scrapers/zapierScraper');
const MakeScraper = require('./scrapers/makeScraper');
const PowerAutomateScraper = require('./scrapers/powerAutomateScraper');
const AwesomeSelfhostedScraper = require('./scrapers/awesomeSelfhostedScraper');
const AwesomeN8nScraper = require('./scrapers/awesomeN8nScraper');
const IftttScraper = require('./scrapers/iftttScraper');
const AirtableScraper = require('./scrapers/airtableScraper');

class MainScraper {
  constructor() {
    this.dataManager = new DataManager();
    this.scrapers = [
      new N8nScraper(),
      new AwesomeSelfhostedScraper(), // APIベースなので安全
      new AwesomeN8nScraper(), // APIベースなので安全
      new ZapierScraper(),
      new MakeScraper(),
      new PowerAutomateScraper(),
      new IftttScraper(),
      new AirtableScraper()
    ];
    this.stats = {};
  }

  async run() {
    try {
      logger.info('🚀 イマシス アイデア収集システム開始');
      logger.info(`対象プラットフォーム: ${this.scrapers.length}個`);
      
      // 既存データを読み込み
      await this.dataManager.loadExistingData();
      
      // 各プラットフォームからデータを収集
      const allResults = [];
      
      for (const scraper of this.scrapers) {
        try {
          const results = await scraper.safeExecute();
          allResults.push(...results);
          
          this.stats[scraper.platformName] = {
            total: results.length,
            new: results.length,
            used: 0
          };
          
        } catch (error) {
          logger.error(`${scraper.platformName}: 実行エラー`, error);
          this.stats[scraper.platformName] = {
            total: 0,
            new: 0,
            used: 0
          };
        }
      }
      
      logger.info(`📊 収集完了: 合計 ${allResults.length}件`);
      
      // 重複除去
      const { newData, duplicates } = this.dataManager.filterNewData(allResults);
      logger.info(`🔍 重複チェック: 新規 ${newData.length}件, 重複 ${duplicates.length}件`);
      
      if (newData.length > 0) {
        // CSVに保存
        await this.dataManager.saveToCSV(newData);
        
        // Google Sheetsに同期
        await this.dataManager.syncToGoogleSheets(newData);
        
        // 統計情報更新
        await this.dataManager.updateStatistics(this.stats);
        
        logger.success(`✅ データ保存完了: ${newData.length}件`);
      } else {
        logger.info('📝 新規データはありませんでした');
      }
      
      // 統計を表示
      logger.scrapingStats(this.stats);
      
      return {
        total: allResults.length,
        newData: newData.length,
        duplicates: duplicates.length,
        stats: this.stats
      };
      
    } catch (error) {
      logger.error('メインスクレイパーエラー:', error);
      throw error;
    }
  }

  // 特定のプラットフォームのみ実行
  async runSingle(platformName) {
    try {
      const scraper = this.scrapers.find(s => s.platformName === platformName);
      if (!scraper) {
        throw new Error(`プラットフォーム '${platformName}' が見つかりません`);
      }

      logger.info(`🎯 単一プラットフォーム実行: ${platformName}`);
      
      await this.dataManager.loadExistingData();
      const results = await scraper.safeExecute();
      
      const { newData, duplicates } = this.dataManager.filterNewData(results);
      
      if (newData.length > 0) {
        await this.dataManager.saveToCSV(newData);
        await this.dataManager.syncToGoogleSheets(newData);
      }
      
      logger.success(`✅ ${platformName} 完了: ${newData.length}件保存`);
      
      return {
        platform: platformName,
        total: results.length,
        newData: newData.length,
        duplicates: duplicates.length
      };
      
    } catch (error) {
      logger.error(`${platformName} 実行エラー:`, error);
      throw error;
    }
  }

  // テスト実行（データ保存なし）
  async runTest() {
    try {
      logger.info('🧪 テスト実行開始（データ保存なし）');
      
      // 全てのスクレイパーでテスト
      const testScrapers = this.scrapers;
      
      for (const scraper of testScrapers) {
        logger.info(`テスト実行: ${scraper.platformName}`);
        const results = await scraper.safeExecute();
        logger.info(`結果: ${results.length}件`);
        
        // 最初の2件のサンプルを表示
        if (results.length > 0) {
          logger.info('サンプルデータ:', results.slice(0, 2));
        }
      }
      
      logger.success('🧪 テスト完了');
      
    } catch (error) {
      logger.error('テスト実行エラー:', error);
      throw error;
    }
  }

  async runZapierOnly() {
    try {
      logger.info('🌟 Zapier専用実行開始');
      
      // Zapierスクレイパーのみを実行
      const zapierScraper = new ZapierScraper();
      
      // 簡易版スクレイピング実装
      zapierScraper.scrapeViaWeb = async function() {
        await this.initialize();
        const page = await this.browser.newPage();
        
        await page.goto('https://zapier.com/templates', { 
          waitUntil: 'networkidle',
          timeout: 60000 
        });
        
        await this.delay(5000);
        
        const templates = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/templates/"]'));
          return links.slice(0, 30).map((link, i) => ({
            title: link.textContent?.trim() || `Zapier Template ${i + 1}`,
            description: 'Zapier automation template for workflow automation',
            url: link.href,
            tags: ['zapier', 'automation', 'workflow']
          }));
        });
        
        await page.close();
        return templates;
      };
      
      const results = await zapierScraper.safeExecute();
      
      if (results.length > 0) {
        // データ保存
        await this.dataManager.loadExistingData();
        const { newData, duplicates } = this.dataManager.filterNewData(results);
        
        if (newData.length > 0) {
          await this.dataManager.saveToCSV(newData);
          await this.dataManager.syncToGoogleSheets(newData);
          
          // 統計更新
          const stats = {
            zapier: {
              total: newData.length
            }
          };
          await this.dataManager.updateStatistics(stats);
        }
        
        logger.success(`Zapier取得完了: ${results.length}件 (新規: ${newData.length}件)`);
      }
      
    } catch (error) {
      logger.error('Zapier実行エラー:', error);
    }
  }
}

module.exports = MainScraper;

// コマンドライン実行時
if (require.main === module) {
  const scraper = new MainScraper();
  
  const command = process.argv[2];
  const platform = process.argv[3];
  
  switch (command) {
    case 'test':
      scraper.runTest();
      break;
    case 'single':
      if (!platform) {
        console.log('使用法: node scraper.js single [platform-name]');
        console.log('利用可能なプラットフォーム:', scraper.scrapers.map(s => s.platformName).join(', '));
      } else {
        scraper.runSingle(platform);
      }
      break;
    default:
      scraper.run();
      break;
  }
} 