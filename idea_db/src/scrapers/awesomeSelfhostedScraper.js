const BaseScraper = require('./base');
const axios = require('axios');
const logger = require('../utils/logger');

class AwesomeSelfhostedScraper extends BaseScraper {
  constructor() {
    super('awesomeSelfhosted');
  }

  async scrape() {
    try {
      logger.info('awesome-selfhosted: GitHubリポジトリから取得開始');
      
      // GitHub APIを使用してREADME.mdの内容を取得
      const apiUrl = 'https://api.github.com/repos/awesome-selfhosted/awesome-selfhosted/contents/README.md';
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'imasys-scraper',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      // Base64デコード
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      
      // Markdownをパース
      const tools = this.parseAwesomeList(content);
      
      logger.info(`awesome-selfhosted: ${tools.length}件のツールを発見`);
      
      // データを正規化
      const normalizedData = tools.map(tool => this.normalizeData(tool));
      
      logger.success(`awesome-selfhosted: スクレイピング完了 ${normalizedData.length}件`);
      return normalizedData;
      
    } catch (error) {
      logger.error('awesome-selfhosted: スクレイピングエラー', error);
      throw error;
    }
  }

  parseAwesomeList(markdown) {
    const tools = [];
    const lines = markdown.split('\n');
    let currentCategory = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // カテゴリの検出（## で始まる行）
      if (line.startsWith('## ') && !line.includes('Contents') && !line.includes('License')) {
        currentCategory = line.replace('## ', '').trim();
        continue;
      }
      
      // ツールの検出（- [name](url) - description 形式）
      const toolMatch = line.match(/^-\s*\[(.*?)\]\((.*?)\)\s*-\s*(.*?)(?:\s*`([^`]*)`)?/);
      if (toolMatch) {
        const [, name, url, description, license] = toolMatch;
        
        // 言語/技術スタックの検出
        const techMatch = description.match(/\b(PHP|JavaScript|Python|Go|Ruby|Java|C\+\+|Rust|TypeScript|Docker)\b/gi);
        const technologies = techMatch ? [...new Set(techMatch.map(t => t.toLowerCase()))] : [];
        
        tools.push({
          title: name.trim(),
          description: description.trim(),
          tools_tags: [currentCategory, ...technologies, license].filter(Boolean),
          category: currentCategory || 'Other',
          url: url.trim()
        });
      }
    }
    
    return tools;
  }
}

module.exports = AwesomeSelfhostedScraper; 