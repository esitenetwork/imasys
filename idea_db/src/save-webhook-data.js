const scrapeWebhookIntegrations = require('./webhook-scraper-correct');
const DataManager = require('./utils/dataManager');

async function saveWebhookData() {
  console.log('🚀 Webhookデータの保存処理を開始します...');
  
  try {
    // Webhookスクレイピングを実行
    const templates = await scrapeWebhookIntegrations();
    
    if (templates.length === 0) {
      console.log('❌ テンプレートが取得できませんでした。');
      return;
    }
    
    console.log(`📊 取得したテンプレート数: ${templates.length}件`);
    
    // DataManagerを初期化
    const dataManager = new DataManager();
    
    // データを正規化してCSVに保存
    const normalizedData = templates.map(template => ({
      id: dataManager.generateId(),
      platform: 'zapier',
      source_app: template.source_app || 'webhook',
      title: template.title,
      description: template.description || '',
      tools_tags: template.tools_tags || '',
      category: 'webhook_integrations',
      url: template.url,
      scraped_date: new Date().toISOString().split('T')[0],
      is_new: true
    }));
    
    console.log('💾 CSVファイルに保存中...');
    
    // 既存データを読み込み
    const existingData = dataManager.loadData();
    console.log(`既存データ数: ${existingData.length}件`);
    
    // 新しいデータを追加
    const allData = [...existingData, ...normalizedData];
    console.log(`合計データ数: ${allData.length}件`);
    
    // CSVに保存
    dataManager.saveToCSV(allData);
    console.log('✅ CSVファイルに保存完了');
    
    // Google Sheetsに同期
    console.log('🔄 Google Sheetsに同期中...');
    await dataManager.syncToGoogleSheets();
    console.log('✅ Google Sheets同期完了');
    
    // 統計情報を更新
    console.log('📈 統計情報を更新中...');
    dataManager.updateStatistics();
    console.log('✅ 統計情報更新完了');
    
    console.log('\n🎉 Webhookデータの保存処理が完了しました！');
    console.log(`📊 新規追加: ${normalizedData.length}件`);
    console.log(`📊 総データ数: ${allData.length}件`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  saveWebhookData().catch(console.error);
}

module.exports = saveWebhookData; 