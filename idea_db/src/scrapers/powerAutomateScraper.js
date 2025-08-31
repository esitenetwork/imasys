const BaseScraper = require('./base');
const logger = require('../utils/logger');

class PowerAutomateScraper extends BaseScraper {
  constructor() {
    super('powerAutomate');
  }

  async scrape() {
    try {
      logger.info('Power Automate: テンプレート取得開始');
      
      // Power Automateのテンプレートページにアクセス
      await this.page.goto(this.platform.templatesUrl, { waitUntil: 'networkidle' });
      await this.delay(3000);
      
      // テンプレートカードを取得
      const templates = await this.page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.template-card, [data-testid="template-card"]'));
        
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
          const url = href.startsWith('http') ? href : `https://powerautomate.microsoft.com${href}`;
          
          // サービス/コネクタを取得
          const connectorElements = card.querySelectorAll('.connector-icon, .service-icon, img[alt]');
          const connectors = Array.from(connectorElements).map(connector => {
            const connectorName = connector.getAttribute('alt') || connector.getAttribute('title') || connector.textContent?.trim();
            return connectorName;
          }).filter(Boolean);
          
          // カテゴリを取得
          const categoryElement = card.querySelector('.category, .tag');
          const category = categoryElement?.textContent?.trim() || connectors[0] || 'Flow';
          
          return {
            title,
            description,
            tools_tags: connectors,
            category,
            url
          };
        }).filter(template => template.title && template.url);
      });
      
      logger.info(`Power Automate: ${templates.length}件のテンプレートを発見`);
      
      // データを正規化
      const normalizedData = templates.map(template => this.normalizeData(template));
      
      logger.success(`Power Automate: スクレイピング完了 ${normalizedData.length}件`);
      return normalizedData;
      
    } catch (error) {
      logger.error('Power Automate: スクレイピングエラー', error);
      throw error;
    }
  }
}

module.exports = PowerAutomateScraper; 