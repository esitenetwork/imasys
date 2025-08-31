const { google } = require('googleapis');
const config = require('./config');

async function saveZapierDataToSheets() {
  console.log('🚀 ZapierデータをGoogle Sheetsに保存します...');
  
  try {
    // Google Sheets API認証
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.googleSheets.serviceAccountEmail,
        private_key: config.googleSheets.privateKey
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = config.googleSheets.spreadsheetId;
    const sheetName = 'zapier_data';
    
    // CSVからデータを読み込み
    const fs = require('fs');
    const csv = require('csv-parser');
    const data = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream('raw_data.csv')
        .pipe(csv())
        .on('data', (row) => {
          // Zapierのデータのみをフィルタリング
          if (row.platform === 'zapier' && row.source_app === 'webhook') {
            data.push([
              row.platform,
              row.source_app,
              row.title,
              row.tools_tags,
              row.url
            ]);
          }
        })
        .on('end', async () => {
          console.log(`📊 Zapierデータ: ${data.length}件`);
          
          if (data.length === 0) {
            console.log('❌ Zapierデータが見つかりませんでした。');
            return;
          }
          
          try {
            // シートをクリア
            await sheets.spreadsheets.values.clear({
              spreadsheetId,
              range: sheetName
            });
            console.log('✅ シートをクリアしました');
            
            // ヘッダーを追加
            const headers = [['platform', 'source_app', 'title', 'used_apps', 'url']];
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${sheetName}!A1:E1`,
              valueInputOption: 'RAW',
              resource: { values: headers }
            });
            console.log('✅ ヘッダーを追加しました');
            
            // データを追加
            await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: sheetName,
              valueInputOption: 'USER_ENTERED',
              insertDataOption: 'INSERT_ROWS',
              resource: { values: data }
            });
            console.log(`✅ データを追加しました: ${data.length}件`);
            
            console.log('🎉 Zapierデータの保存が完了しました！');
            
          } catch (error) {
            console.error('❌ Google Sheets保存エラー:', error.message);
          }
        })
        .on('error', reject);
    });
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  saveZapierDataToSheets().catch(console.error);
}

module.exports = saveZapierDataToSheets; 