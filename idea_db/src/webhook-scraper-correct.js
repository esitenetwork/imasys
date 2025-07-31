const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

// stealth プラグインを chromium に適用
chromium.use(stealth);

async function scrapeWebhookIntegrations() {
  console.log('🔍 Webhookアプリのintegrationsページスクレイピング開始');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Webhookアプリのintegrationsページにアクセス
    const url = 'https://zapier.com/apps/webhook/integrations';
    console.log(`ページに移動中: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('ページの読み込み完了');

    // Load Moreボタンのクリック処理
    let clickCount = 0;
    const MAX_CLICKS = 100; // 最大600件程度のテンプレートを取得
    
    console.log('Load Moreボタンの処理を開始します...');
    
    while (clickCount < MAX_CLICKS) {
      try {
        const loadMoreButton = await page.locator('button:has-text("Load More")').first();
        const buttonExists = await loadMoreButton.count() > 0;
        if (!buttonExists) {
          console.log('Load Moreボタンが見つかりません。すべてのテンプレートが読み込まれました。');
          break;
        }
        
        await loadMoreButton.click({ timeout: 5000 });
        clickCount++;
        console.log(`Load Moreボタンをクリックしました (${clickCount}/${MAX_CLICKS})`);
        await page.waitForTimeout(1000);
        
        // ネットワークの活動が収まるまで待つ
        try {
          await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch (e) {
          console.log('ネットワーク待機中にタイムアウトしましたが、処理を続行します。');
        }
        
      } catch (error) {
        console.log(`Load Moreボタンの処理中にエラーが発生しました (${clickCount}回目): ${error.message}`);
        break;
      }
    }
    
    console.log('Load Moreボタンの処理が完了しました。テンプレート抽出を開始します。');

    // 正しいセレクターでテンプレートを抽出
    const templates = await page.evaluate(() => {
      const zapCards = document.querySelectorAll('[data-testid="ZapCard__inner"]');
      const results = [];
      
      zapCards.forEach((card, index) => {
        try {
          // タイトルを取得
          const titleElement = card.querySelector('h3._title_13yrc_144');
          const title = titleElement ? titleElement.textContent.trim() : '';
          
          // 詳細リンクを取得
          const detailsLink = card.querySelector('a._link_1vym7_1[href*="/apps/"]');
          const detailsUrl = detailsLink ? detailsLink.href : '';
          
          // 使用アプリ情報を取得
          const metaInfoElement = card.querySelector('._meta-info-area_13yrc_412');
          const usedApps = metaInfoElement ? metaInfoElement.textContent.trim() : '';
          
          // サービスアイコンからアプリ名を取得
          const serviceIcons = card.querySelectorAll('ul._service-icons_667aj_1 img');
          const appNames = Array.from(serviceIcons).map(img => img.alt.replace(' logo', ''));
          
          if (title && detailsUrl) {
            results.push({
              title: title,
              description: usedApps,
              tools_tags: appNames.join(', '),
              url: detailsUrl,
              source_app: 'webhook'
            });
          }
        } catch (error) {
          console.log(`カード ${index} の処理中にエラー:`, error.message);
        }
      });
      
      return results;
    });
    
    console.log(`抽出成功: ${templates.length}件`);
    
    if (templates.length > 0) {
      console.log('\n最初の5件:');
      templates.slice(0, 5).forEach((template, index) => {
        console.log(`${index + 1}. ${template.title}`);
        console.log(`   使用アプリ: ${template.tools_tags}`);
        console.log(`   URL: ${template.url}`);
        console.log('');
      });
      
      console.log('最後の5件:');
      templates.slice(-5).forEach((template, index) => {
        console.log(`${templates.length - 4 + index}. ${template.title}`);
        console.log(`   使用アプリ: ${template.tools_tags}`);
        console.log(`   URL: ${template.url}`);
        console.log('');
      });
    }
    
    // スクリーンショットを保存
    await page.screenshot({ path: 'webhook-integrations-correct.png' });
    console.log('📸 スクリーンショットを保存: webhook-integrations-correct.png');
    
    return templates;
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    return [];
  } finally {
    await browser.close();
    console.log('✅ Webhookスクレイピング完了');
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  scrapeWebhookIntegrations().catch(console.error);
}

module.exports = scrapeWebhookIntegrations; 