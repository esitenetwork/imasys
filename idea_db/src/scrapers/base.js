const { chromium } = require('playwright');
const config = require('../config');
const logger = require('../utils/logger');

class BaseScraper {
  constructor(platformName) {
    this.platformName = platformName;
    this.platform = config.platforms[platformName];
    this.browser = null;
    this.page = null;
    this.results = [];
  }

  async initialize() {
    try {
      logger.debug(`${this.platformName}: ブラウザ初期化中...`);
      
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });

      this.page = await this.browser.newPage({
        userAgent: config.scraping.userAgent
      });

      // リクエスト間隔の制御
      this.page.on('response', () => {
        this.delay(config.scraping.delayBetweenRequests);
      });

      logger.debug(`${this.platformName}: ブラウザ初期化完了`);
    } catch (error) {
      logger.error(`${this.platformName}: ブラウザ初期化エラー`, error);
      throw error;
    }
  }

  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
        logger.debug(`${this.platformName}: ブラウザクリーンアップ完了`);
      }
    } catch (error) {
      logger.error(`${this.platformName}: クリーンアップエラー`, error);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 各プラットフォームで実装する必要があるメソッド
  async scrape() {
    throw new Error('scrape()メソッドを実装してください');
  }

  // データの正規化
  normalizeData(rawData) {
    return {
      id: this.generateId(),
      platform: this.platformName,
      source_app: this.cleanText(rawData.source_app || ''),
      title: this.cleanText(rawData.title || ''),
      description: this.cleanText(rawData.description || ''),
      tools_tags: this.normalizeTags(rawData.tools_tags || []),
      category: this.cleanText(rawData.category || ''),
      url: rawData.url || '',
      scraped_date: new Date().toISOString().split('T')[0],
      is_new: true
    };
  }

  generateId() {
    return `${this.platformName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  cleanText(text) {
    return text.toString()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]/g, ' ')
      .substring(0, 500); // 長すぎるテキストをカット
  }

  normalizeTags(tags) {
    if (Array.isArray(tags)) {
      return tags.join(',');
    }
    return tags.toString();
  }

  // 重複チェック用のキーを生成
  generateDuplicateKey(data) {
    return `${data.platform}_${data.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  }

  // エラーハンドリング付きの実行
  async safeExecute() {
    try {
      logger.platformStart(this.platformName);
      
      if (!this.platform.enabled) {
        logger.warn(`${this.platformName}: 無効化されています`);
        return [];
      }

      await this.initialize();
      const results = await this.scrape();
      
      logger.platformComplete(this.platformName, results.length);
      return results;
      
    } catch (error) {
      logger.platformError(this.platformName, error);
      return [];
    } finally {
      await this.cleanup();
    }
  }
}

module.exports = BaseScraper; 