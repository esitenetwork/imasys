const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

// stealth プラグインを chromium に適用
chromium.use(stealth);

async function scrapeZapierApps() {
  console.log('🔍 Zapierアプリ一覧ページのスクレイピング開始');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Zapierアプリ一覧ページにアクセス
    const url = 'https://zapier.com/apps';
    console.log(`ページに移動中: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('ページの読み込み完了');

    // Load Moreボタンのクリック処理（アプリ一覧をすべて読み込む）
    let clickCount = 0;
    const MAX_CLICKS = 50; // アプリ一覧のLoad More
    
    console.log('Load Moreボタンの処理を開始します...');
    
    while (clickCount < MAX_CLICKS) {
      try {
        const loadMoreButton = await page.locator('button:has-text("Load More")').first();
        const buttonExists = await loadMoreButton.count() > 0;
        if (!buttonExists) {
          console.log('Load Moreボタンが見つかりません。すべてのアプリが読み込まれました。');
          break;
        }
        
        await loadMoreButton.click({ timeout: 5000 });
        clickCount++;
        console.log(`Load Moreボタンをクリックしました (${clickCount}/${MAX_CLICKS})`);
        await page.waitForTimeout(1000);
        
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
    
    console.log('Load Moreボタンの処理が完了しました。アプリ情報を抽出します。');

    // アプリ情報を抽出
    const apps = await page.evaluate(() => {
      const appElements = document.querySelectorAll('div.css-14j7rvi');
      const results = [];
      
      appElements.forEach((appElement, index) => {
        try {
          // アプリ名を取得
          const titleElement = appElement.querySelector('h2.css-12fk9bn');
          const appName = titleElement ? titleElement.textContent.trim() : '';
          
          // アプリの説明を取得
          const descriptionElement = appElement.querySelector('p.css-1pl7f1k');
          const description = descriptionElement ? descriptionElement.textContent.trim() : '';
          
          // Premiumタグを確認
          const premiumTag = appElement.querySelector('span[data-variant="default"]');
          const isPremium = premiumTag ? true : false;
          
          // アプリのURLを生成（推測）
          const appSlug = appName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
          const integrationsUrl = `https://zapier.com/apps/${appSlug}/integrations`;
          
          if (appName) {
            results.push({
              name: appName,
              description: description,
              isPremium: isPremium,
              integrationsUrl: integrationsUrl,
              appSlug: appSlug
            });
          }
        } catch (error) {
          console.log(`アプリ ${index} の処理中にエラー:`, error.message);
        }
      });
      
      return results;
    });
    
    console.log(`抽出成功: ${apps.length}件のアプリ`);
    
    if (apps.length > 0) {
      console.log('\n最初の10件:');
      apps.slice(0, 10).forEach((app, index) => {
        console.log(`${index + 1}. ${app.name} ${app.isPremium ? '(Premium)' : ''}`);
        console.log(`   説明: ${app.description.substring(0, 100)}...`);
        console.log(`   URL: ${app.integrationsUrl}`);
        console.log('');
      });
      
      console.log('最後の10件:');
      apps.slice(-10).forEach((app, index) => {
        console.log(`${apps.length - 9 + index}. ${app.name} ${app.isPremium ? '(Premium)' : ''}`);
        console.log(`   説明: ${app.description.substring(0, 100)}...`);
        console.log(`   URL: ${app.integrationsUrl}`);
        console.log('');
      });
    }
    
    // CSVファイルに保存
    const csvData = apps.map(app => [
      app.name,
      'zapier',
      app.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
      app.name,
      app.description,
      app.isPremium ? 'Premium' : 'Free',
      'app_listing',
      `https://zapier.com/apps/${app.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}/integrations`,
      new Date().toISOString().split('T')[0],
      true
    ]);
    
    const csvHeader = ['id', 'platform', 'source_app', 'title', 'description', 'tools_tags', 'category', 'url', 'scraped_date', 'is_new'];
    const csvContent = [csvHeader, ...csvData].map(row => row.join(',')).join('\n');
    
    const fs = require('fs');
    fs.writeFileSync('zapier_apps.csv', csvContent);
    console.log('💾 CSVファイルに保存: zapier_apps.csv');
    
    // スクリーンショットを保存
    await page.screenshot({ path: 'zapier-apps-list.png' });
    console.log('📸 スクリーンショットを保存: zapier-apps-list.png');
    
    return apps;
    
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    return [];
  } finally {
    await browser.close();
    console.log('✅ Zapierアプリ一覧スクレイピング完了');
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  scrapeZapierApps().catch(console.error);
}

module.exports = scrapeZapierApps; 