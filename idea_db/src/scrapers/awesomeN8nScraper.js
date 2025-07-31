const BaseScraper = require('./base');
const axios = require('axios');
const logger = require('../utils/logger');

class AwesomeN8nScraper extends BaseScraper {
  constructor() {
    super('awesomeN8n');
  }

  async scrape() {
    try {
      logger.info('awesome-n8n: GitHubリポジトリから取得開始');
      
      // awesome-n8nリポジトリが存在しないため、n8nの公式テンプレートページから取得
      const page = await this.browser.newPage();
      await page.goto('https://n8n.io/workflows/', { 
        waitUntil: 'networkidle',
        timeout: this.config.scraping.timeout 
      });
      
      await this.delay(3000);
      
      const workflows = await page.$$eval('article, [data-testid="workflow-card"], .workflow-card', (cards) => {
        return cards.map(card => {
          const title = card.querySelector('h3, h2, .title, [data-testid="workflow-title"]')?.textContent?.trim();
          const description = card.querySelector('p, .description, [data-testid="workflow-description"]')?.textContent?.trim();
          const link = card.querySelector('a')?.href;
          
          if (title && link) {
            return {
              title: title,
              description: description || '',
              tools_tags: ['n8n', 'workflow', 'automation'],
              category: 'Workflow Template',
              url: link
            };
          }
          return null;
        }).filter(Boolean);
      });
      
      await page.close();
      
      logger.info(`awesome-n8n: ${workflows.length}件のワークフローを発見`);
      
      // データを正規化
      const normalizedData = workflows.map(workflow => this.normalizeData(workflow));
      
      logger.success(`awesome-n8n: スクレイピング完了 ${normalizedData.length}件`);
      return normalizedData;
      
    } catch (error) {
      logger.error('awesome-n8n: スクレイピングエラー', error);
      throw error;
    }
  }

  parseAwesomeN8nList(markdown) {
    const workflows = [];
    const lines = markdown.split('\n');
    let currentCategory = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // カテゴリの検出（## で始まる行）
      if (line.startsWith('## ') && !line.includes('Contents') && !line.includes('License')) {
        currentCategory = line.replace('## ', '').trim();
        continue;
      }
      
      // ワークフローの検出（- [name](url) - description 形式）
      const workflowMatch = line.match(/^-\s*\[(.*?)\]\((.*?)\)\s*-?\s*(.*?)$/);
      if (workflowMatch) {
        const [, name, url, description] = workflowMatch;
        
        // n8nノード/サービスの検出
        const nodeMatch = description.match(/\b(Slack|Gmail|Trello|Notion|Discord|Telegram|GitHub|Google|Microsoft|Dropbox|Zapier)\b/gi);
        const nodes = nodeMatch ? [...new Set(nodeMatch.map(n => n.toLowerCase()))] : [];
        
        workflows.push({
          title: name.trim(),
          description: description.trim() || `${currentCategory} workflow`,
          tools_tags: [currentCategory, ...nodes, 'n8n'].filter(Boolean),
          category: currentCategory || 'Workflow',
          url: url.trim()
        });
      }
    }
    
    return workflows;
  }
}

module.exports = AwesomeN8nScraper; 