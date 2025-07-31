const BaseScraper = require('./base');
const axios = require('axios');
const logger = require('../utils/logger');

class N8nScraper extends BaseScraper {
  constructor() {
    super('n8n');
  }

  async scrape() {
    try {
      logger.info('n8n: ワークフローテンプレート取得開始');
      
      // まずAPIを使用してテンプレートを取得
      const allWorkflows = await this.scrapeViaAPI();
      
      if (allWorkflows.length > 0) {
        logger.info(`n8n: API経由で${allWorkflows.length}件取得成功`);
        return allWorkflows.map(workflow => this.normalizeData(workflow));
      }
      
      // APIが失敗した場合はWebスクレイピングにフォールバック
      logger.warn('n8n: API取得失敗、Webスクレイピングにフォールバック');
      return await this.scrapeViaWeb();
    } catch (error) {
      logger.error('n8n: スクレイピングエラー', error);
      throw error;
    }
  }

  async scrapeViaAPI() {
    try {
      const axios = require('axios');
      const allWorkflows = [];
      let offset = 0;
      const limit = 100; // 一度に取得する件数を増やす
      
      logger.info('n8n: API経由でのスクレイピング開始');
      
      while (true) {
        try {
          logger.info(`n8n: offset ${offset}をリクエスト中...`);
          
          // 複数のAPIエンドポイントを試行
          const apiUrls = [
            'https://api.n8n.io/templates/search',
            'https://api.n8n.io/api/templates/search',
            'https://n8n.io/api/templates/search'
          ];
          
          let response = null;
          let apiUrl = '';
          
          for (const url of apiUrls) {
            try {
              apiUrl = url;
              logger.info(`n8n: ${url} を試行中...`);
              
              response = await axios.get(url, {
                params: {
                  offset: offset,
                  limit: limit,
                  // page形式も試行
                  page: Math.floor(offset / limit) + 1,
                  rows: limit
                },
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 30000
              });
              
              logger.info(`n8n: ${url} からレスポンス受信成功`);
              break;
            } catch (apiError) {
              logger.warn(`n8n: ${url} でエラー: ${apiError.message}`);
              continue;
            }
          }
          
          if (!response) {
            throw new Error('すべてのAPIエンドポイントでエラーが発生しました');
          }
          
          logger.info(`n8n: レスポンス受信 - ステータス: ${response.status}`);
          logger.info(`n8n: レスポンスデータ構造:`, {
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : [],
            dataType: typeof response.data
          });
          
          // レスポンスデータの詳細を出力
          if (response.data) {
            logger.info(`n8n: レスポンス詳細:`, JSON.stringify(response.data, null, 2));
          }
          
          const workflows = response.data.workflows || response.data.data || response.data || [];
          
          logger.info(`n8n: 抽出されたワークフロー数: ${workflows.length}`);
          
          if (workflows.length === 0) {
            logger.info('n8n: データが空のため処理終了');
            break; // これ以上データがない
          }
          
          // データを整形
          workflows.forEach((workflow, index) => {
            try {
              const processedWorkflow = {
                title: workflow.name || workflow.title || '',
                description: this.extractDescription(workflow),
                tools_tags: this.extractTags(workflow),
                category: this.extractCategory(workflow),
                url: `https://n8n.io/workflows/${workflow.id}/`
              };
              
              allWorkflows.push(processedWorkflow);
              
              // 最初の数件は詳細をログ出力
              if (index < 3) {
                logger.info(`n8n: ワークフロー${index + 1}:`, processedWorkflow);
              }
            } catch (processError) {
              logger.error(`n8n: ワークフロー${index + 1}の処理エラー:`, {
                error: processError.message,
                workflow: workflow
              });
            }
          });
          
          logger.info(`n8n: offset ${offset}完了 (${workflows.length}件)`);
          
          // これ以上データがない場合は終了
          if (workflows.length < limit) {
            logger.info(`n8n: 取得件数(${workflows.length})が制限値(${limit})未満のため処理終了`);
            break;
          }
          
          // 次のoffsetへ
          offset += limit;
          await this.delay(2000); // レート制限対策を強化
          
          // 安全装置：最大10,000件まで
          if (offset >= 10000) {
            logger.warn('n8n: 最大件数に到達、処理終了');
            break;
          }
          
          logger.info(`n8n: 累計取得件数: ${allWorkflows.length}件`);
          
        } catch (pageError) {
          logger.error(`n8n: offset ${offset}のAPIエラー詳細:`, {
            message: pageError.message,
            status: pageError.response?.status,
            statusText: pageError.response?.statusText,
            headers: pageError.response?.headers,
            data: pageError.response?.data,
            url: pageError.config?.url,
            params: pageError.config?.params
          });
          
          if (pageError.response) {
            logger.error(`n8n: HTTPエラー詳細:`, {
              status: pageError.response.status,
              data: pageError.response.data,
              headers: pageError.response.headers
            });
          }
          
          // offsetエラーの場合の処理
          if (offset === 0) {
            // 最初のoffsetでエラーの場合は諦める
            throw pageError;
          } else {
            // 2回目以降のエラーは警告として処理継続
            logger.warn(`n8n: offset ${offset}でエラー、処理終了`);
            break;
          }
        }
      }
      
      logger.info(`n8n: API経由スクレイピング完了 - 総取得件数: ${allWorkflows.length}`);
      return allWorkflows;
      
    } catch (error) {
      logger.error('n8n: API取得エラー詳細:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        },
        request: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          headers: error.config?.headers
        }
      });
      return [];
    }
  }

  async scrapeViaWeb() {
    try {
      // n8nのワークフロー一覧ページにアクセス
      await this.page.goto(this.platform.workflowsUrl, { waitUntil: 'networkidle' });
      
      // ページが読み込まれるまで少し待機
      await this.delay(3000);
      
      // ワークフローカードを取得 - より幅広いセレクターで試行
      const workflows = await this.page.evaluate(() => {
        // より幅広いセレクターで要素を検索
        const selectors = [
          'article',
          '[data-testid="workflow-card"]',
          '.workflow-card',
          '.template-card',
          'a[href*="/workflows/"]',
          '.card',
          '.workflow-item'
        ];
        
        let workflowCards = [];
        for (const selector of selectors) {
          const elements = Array.from(document.querySelectorAll(selector));
          if (elements.length > 0) {
            workflowCards = elements;
            break;
          }
        }
        
        console.log(`Found ${workflowCards.length} elements`);
        
        return workflowCards.map(card => {
          // タイトルを取得 - より多くのパターンを試行
          const titleSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            '.title', '.heading', 
            '[data-testid="workflow-title"]',
            'a[href*="/workflows/"]'
          ];
          
          let title = '';
          for (const sel of titleSelectors) {
            const el = card.querySelector(sel);
            if (el && el.textContent.trim()) {
              title = el.textContent.trim();
              break;
            }
          }
          
          // 説明を取得
          const descSelectors = [
            'p', '.description', '.summary', '.excerpt',
            '[data-testid="workflow-description"]'
          ];
          
          let description = '';
          for (const sel of descSelectors) {
            const el = card.querySelector(sel);
            if (el && el.textContent.trim()) {
              description = el.textContent.trim();
              break;
            }
          }
          
          // URLを取得
          const linkElement = card.querySelector('a') || (card.tagName === 'A' ? card : null);
          const href = linkElement?.getAttribute('href') || '';
          const url = href.startsWith('http') ? href : (href ? `https://n8n.io${href}` : '');
          
          // タグ/ツールを取得
          const tagElements = card.querySelectorAll('.tag, .badge, .chip, [data-testid="workflow-tag"]');
          const tools_tags = Array.from(tagElements).map(tag => tag.textContent.trim()).filter(Boolean);
          
          // デフォルトタグを追加
          if (tools_tags.length === 0) {
            tools_tags.push('n8n', 'workflow', 'automation');
          }
          
          // カテゴリを取得（タグの最初のもので代用）
          const category = tools_tags[0] || 'General';
          
          return {
            title,
            description,
            tools_tags,
            category,
            url
          };
        }).filter(workflow => workflow.title && workflow.url);
      });
      
      logger.info(`n8n: ${workflows.length}件のワークフローを発見`);
      
      // より詳細な情報を取得するため、各ワークフローページにアクセス（最初の10件のみ）
      const detailedWorkflows = [];
      const maxDetail = Math.min(workflows.length, 10);
      
      for (let i = 0; i < maxDetail; i++) {
        try {
          await this.page.goto(workflows[i].url, { waitUntil: 'networkidle' });
          await this.delay(2000);
          
          const detailedInfo = await this.page.evaluate(() => {
            // より詳細な説明を取得
            const detailDescription = document.querySelector('.workflow-description, .readme, .details')?.textContent?.trim() || '';
            
            // ノード情報を取得
            const nodeElements = document.querySelectorAll('.node, .service-icon, [data-test-id="node"]');
            const nodes = Array.from(nodeElements).map(node => {
              const nodeName = node.getAttribute('title') || node.textContent?.trim() || '';
              return nodeName;
            }).filter(Boolean);
            
            return {
              detailedDescription: detailDescription,
              nodes: nodes
            };
          });
          
          workflows[i].description = detailedInfo.detailedDescription || workflows[i].description;
          workflows[i].tools_tags = [...new Set([...workflows[i].tools_tags, ...detailedInfo.nodes])];
          
          logger.debug(`n8n: 詳細取得完了 ${i + 1}/${maxDetail}`);
          
        } catch (error) {
          logger.warn(`n8n: 詳細取得エラー ${workflows[i].url}`, error.message);
        }
      }
      
      // データを正規化
      const normalizedData = workflows.map(workflow => this.normalizeData(workflow));
      
      logger.success(`n8n: スクレイピング完了 ${normalizedData.length}件`);
      return normalizedData;
      
    } catch (error) {
      logger.error('n8n: スクレイピングエラー', error);
      throw error;
    }
  }

  // APIレスポンスからデータを抽出するヘルパーメソッド
  extractDescription(workflow) {
    // 説明文を抽出（複数のフィールドから）
    return workflow.description || 
           workflow.summary || 
           workflow.nodes?.map(n => n.displayName).join(', ') || 
           '';
  }

  extractTags(workflow) {
    const tags = ['n8n', 'workflow', 'automation'];
    
    // ノードからタグを抽出
    if (workflow.nodes) {
      workflow.nodes.forEach(node => {
        if (node.displayName) {
          tags.push(node.displayName);
        }
        // カテゴリからタグを追加
        if (node.nodeCategories) {
          node.nodeCategories.forEach(cat => tags.push(cat.name));
        }
      });
    }
    
    // 重複を除去
    return [...new Set(tags)];
  }

  extractCategory(workflow) {
    // ノードのカテゴリから主要カテゴリを決定
    if (workflow.nodes && workflow.nodes.length > 0) {
      const categories = workflow.nodes
        .flatMap(node => node.nodeCategories || [])
        .map(cat => cat.name);
      
      if (categories.length > 0) {
        return categories[0]; // 最初のカテゴリを使用
      }
    }
    
    return 'General';
  }
}

module.exports = N8nScraper; 