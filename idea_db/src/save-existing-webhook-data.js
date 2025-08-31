const DataManager = require('./utils/dataManager');

async function saveExistingWebhookData() {
  console.log('🚀 既存のWebhookデータを保存します...');
  
  try {
    // DataManagerを初期化
    const dataManager = new DataManager();
    
    // 既存データを読み込み
    const existingData = await dataManager.loadExistingData() || [];
    console.log(`既存データ数: ${existingData.length}件`);
    
    // ZapierのWebhookデータのみをフィルタリング
    const webhookData = existingData.filter(item => 
      item.platform === 'zapier' && item.source_app === 'webhook'
    );
    console.log(`Webhookデータ数: ${webhookData.length}件`);
    
    if (webhookData.length === 0) {
      console.log('❌ Webhookデータが見つかりませんでした。');
      return;
    }
    
    // Google Sheetsに同期
    console.log('🔄 Google Sheetsに同期中...');
    await dataManager.syncToGoogleSheets(webhookData, 'zapier_data');
    console.log('✅ Google Sheets同期完了');
    
    // 統計情報を更新
    console.log('📈 統計情報を更新中...');
    const platformStats = {
      zapier: {
        total: webhookData.length,
        new: webhookData.length,
        used: 0
      }
    };
    await dataManager.updateStatistics(platformStats);
    console.log('✅ 統計情報更新完了');
    
    console.log('\n🎉 既存Webhookデータの保存処理が完了しました！');
    console.log(`📊 Webhookデータ: ${webhookData.length}件`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  saveExistingWebhookData().catch(console.error);
}

module.exports = saveExistingWebhookData; 