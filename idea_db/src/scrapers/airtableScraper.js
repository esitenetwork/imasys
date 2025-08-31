const BaseScraper = require('./base');
const logger = require('../utils/logger');

class AirtableScraper extends BaseScraper {
  constructor() {
    super('airtable');
  }

  async scrape() {
    try {
      logger.info('Airtable: テンプレート取得開始');
      
      // Airtable Universeページにアクセス
      await this.page.goto(this.platform.universeUrl, { waitUntil: 'networkidle' });
      await this.delay(3000);
      
      // テンプレートカードを取得
      const templates = await this.page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.template-card, .universe-card, [data-testid="template-card"]'));
        
        return cards.map(card => {
          // タイトルを取得
          const titleElement = card.querySelector('h3, .title, .template-title, [data-testid="template-title"]');
          const title = titleElement?.textContent?.trim() || '';
          
          // 説明を取得
          const descElement = card.querySelector('.description, .template-description, .summary, p');
          const description = descElement?.textContent?.trim() || '';
          
          // URLを取得
          const linkElement = card.querySelector('a') || card;
          const href = linkElement.getAttribute('href') || '';
          const url = href.startsWith('http') ? href : `https://airtable.com${href}`;
          
          // カテゴリ/用途を取得
          const categoryElement = card.querySelector('.category, .tag, .use-case');
          const category = categoryElement?.textContent?.trim() || 'Database';
          
          // フィールド/機能を取得
          const featureElements = card.querySelectorAll('.feature, .field-type, .badge');
          const features = Array.from(featureElements).map(feature => feature.textContent?.trim()).filter(Boolean);
          
          return {
            title,
            description,
            tools_tags: [category, ...features, 'Airtable'].filter(Boolean),
            category,
            url
          };
        }).filter(template => template.title && template.url);
      });
      
      logger.info(`Airtable: ${templates.length}件のテンプレートを発見`);
      
      // データを正規化
      const normalizedData = templates.map(template => this.normalizeData(template));
      
      logger.success(`Airtable: スクレイピング完了 ${normalizedData.length}件`);
      return normalizedData;
      
    } catch (error) {
      logger.error('Airtable: スクレイピングエラー', error);
      throw error;
    }
  }
}

module.exports = AirtableScraper; 