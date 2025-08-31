// playwright-extra と stealth プラグインを読み込む
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

// stealth プラグインを chromium に適用
chromium.use(stealth);

const BaseScraper = require('./base');

class ZapierScraper extends BaseScraper {
  constructor() {
    // 親クラスのコンストラクタを呼び出す
    super('zapier');
    // baseUrlを直接設定
    this.baseUrl = 'https://zapier.com/apps';
  }

  async scrape() {
    console.log('[Load More対応版] Zapierスクレイピングを開始します...');
    const browser = await chromium.launch({ headless: false }); // 動作確認のため headless: false で実行
    const page = await browser.newPage();
    
    await page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
    console.log('ページ読み込み完了。Load Moreボタンの処理を開始します。');

    // ★★★ Load Moreボタンのクリック処理 ★★★
    let clickCount = 0;
    const MAX_CLICKS = 100; // 安全装置：最大クリック回数
    
    while (clickCount < MAX_CLICKS) {
      try {
        // Load Moreボタンを探す
        const loadMoreButton = await page.locator('button:has-text("Load More")').first();
        
        // ボタンが存在するかチェック
        const buttonExists = await loadMoreButton.count() > 0;
        if (!buttonExists) {
          console.log('Load Moreボタンが見つかりません。すべてのコンテンツが読み込まれました。');
          break;
        }
        
        // ボタンがクリック可能かチェック
        const isEnabled = await loadMoreButton.isEnabled();
        if (!isEnabled) {
          console.log('Load Moreボタンが無効です。処理を終了します。');
          break;
        }
        
        // ボタンをクリック
        await loadMoreButton.click();
        clickCount++;
        console.log(`Load Moreボタンをクリックしました (${clickCount}/${MAX_CLICKS})`);
        
        // 新しいコンテンツの読み込みを待機
        await page.waitForTimeout(2000); // 2秒待機
        
        try {
          // ネットワークの活動が収まるまで待つ
          await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch (e) {
          console.log('ネットワーク待機中にタイムアウトしましたが、処理を続行します。');
        }
        
      } catch (error) {
        console.log('Load Moreボタンの処理中にエラーが発生しました:', error.message);
        break;
      }
    }
    
    if (clickCount >= MAX_CLICKS) {
      console.log(`最大クリック回数(${MAX_CLICKS})に達しました。処理を終了します。`);
    }
    
    console.log('Load Moreボタンの処理が完了しました。データ抽出を開始します。');

    // データ抽出処理
    const itemSelector = '[class*="SubmenuList-module_listItem"]'; 
    const elements = await page.locator(itemSelector).all();
    console.log(`抽出対象の要素数: ${elements.length}`);

    const templates = [];
    for (const element of elements) {
      try {
        const linkElement = await element.locator('a').first();
        const pElement = await element.locator('p').first();
        const title = await pElement.innerText();
        const url = await linkElement.getAttribute('href');
        if (title && url) {
            templates.push({ title: title.trim(), url: `https://zapier.com${url}` });
        }
      } catch (e) {
        // スキップ
      }
    }
    
    console.log(`抽出成功: ${templates.length}件`);
    if(templates.length > 0) {
      console.log('最初の5件:', templates.slice(0, 5));
      console.log('最後の5件:', templates.slice(-5));
    }

    await browser.close();
    console.log(`スクレイピングが完了しました。`);
    return templates;
  }
}

module.exports = ZapierScraper; 
module.exports = ZapierScraper; 