const BaseScraper = require('./base');
const logger = require('../utils/logger');

class MakeScraper extends BaseScraper {
  constructor() {
    super('make');
  }

  async scrape() {
    try {
      logger.info('Make: テンプレート取得開始');
      
      // Makeのテンプレートページにアクセス
      await this.page.goto(this.platform.templatesUrl, { waitUntil: 'networkidle' });
      await this.delay(3000);
      
      // テンプレートカードを取得
      const templates = await this.page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.template-card, .scenario-card, [data-testid="template"]'));
        
        return cards.map(card => {
          // タイトルを取得
          const titleElement = card.querySelector('h3, .title, .template-title, .scenario-title');
          const title = titleElement?.textContent?.trim() || '';
          
          // 説明を取得
          const descElement = card.querySelector('.description, .template-description, .scenario-description, p');
          const description = descElement?.textContent?.trim() || '';
          
          // URLを取得
          const linkElement = card.querySelector('a') || card;
          const href = linkElement.getAttribute('href') || '';
          const url = href.startsWith('http') ? href : `https://www.make.com${href}`;
          
          // アプリ/サービスを取得
          const serviceElements = card.querySelectorAll('.service-icon, .app-icon, img[alt]');
          const services = Array.from(serviceElements).map(service => {
            const serviceName = service.getAttribute('alt') || service.getAttribute('title') || service.textContent?.trim();
            return serviceName;
          }).filter(Boolean);
          
          // カテゴリを取得
          const categoryElement = card.querySelector('.category, .tag, .badge');
          const category = categoryElement?.textContent?.trim() || services[0] || 'Automation';
          
          return {
            title,
            description,
            tools_tags: services,
            category,
            url
          };
        }).filter(template => template.title && template.url);
      });
      
      logger.info(`Make: ${templates.length}件のテンプレートを発見`);
      
      // データを正規化
      const normalizedData = templates.map(template => this.normalizeData(template));
      
      logger.success(`Make: スクレイピング完了 ${normalizedData.length}件`);
      return normalizedData;
      
    } catch (error) {
      logger.error('Make: スクレイピングエラー', error);
      throw error;
    }
  }
}

module.exports = MakeScraper; 