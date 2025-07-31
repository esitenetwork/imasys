const BaseScraper = require('./base');
const logger = require('../utils/logger');

class IftttScraper extends BaseScraper {
  constructor() {
    super('ifttt');
  }

  async scrape() {
    try {
      logger.info('IFTTT: アプレット取得開始');
      
      // IFTTTの探索ページにアクセス
      await this.page.goto(this.platform.exploreUrl, { waitUntil: 'networkidle' });
      await this.delay(3000);
      
      // アプレットカードを取得
      const applets = await this.page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.applet-card, [data-testid="applet-card"]'));
        
        return cards.map(card => {
          // タイトルを取得
          const titleElement = card.querySelector('h3, .title, .applet-title, [data-testid="applet-title"]');
          const title = titleElement?.textContent?.trim() || '';
          
          // 説明を取得
          const descElement = card.querySelector('.description, .applet-description, p');
          const description = descElement?.textContent?.trim() || '';
          
          // URLを取得
          const linkElement = card.querySelector('a') || card;
          const href = linkElement.getAttribute('href') || '';
          const url = href.startsWith('http') ? href : `https://ifttt.com${href}`;
          
          // サービスを取得
          const serviceElements = card.querySelectorAll('.service-icon, img[alt]');
          const services = Array.from(serviceElements).map(service => {
            const serviceName = service.getAttribute('alt') || service.getAttribute('title');
            return serviceName;
          }).filter(Boolean);
          
          // カテゴリを取得
          const categoryElement = card.querySelector('.category, .tag');
          const category = categoryElement?.textContent?.trim() || services[0] || 'Applet';
          
          return {
            title,
            description,
            tools_tags: services,
            category,
            url
          };
        }).filter(applet => applet.title && applet.url);
      });
      
      logger.info(`IFTTT: ${applets.length}件のアプレットを発見`);
      
      // データを正規化
      const normalizedData = applets.map(applet => this.normalizeData(applet));
      
      logger.success(`IFTTT: スクレイピング完了 ${normalizedData.length}件`);
      return normalizedData;
      
    } catch (error) {
      logger.error('IFTTT: スクレイピングエラー', error);
      throw error;
    }
  }
}

module.exports = IftttScraper; 