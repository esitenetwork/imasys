const { google } = require('googleapis');
const config = require('./config');
const fs = require('fs');
const csv = require('csv-parser');

async function saveRealWebhookData() {
  console.log('🚀 実際のWebhookデータを保存します...');
  
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
    
    // CSVから実際のWebhookデータを読み込み
    const data = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream('raw_data.csv')
        .pipe(csv())
        .on('data', (row) => {
          // ZapierのWebhookデータのみをフィルタリング
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
          console.log(`📊 実際のWebhookデータ: ${data.length}件`);
          
          if (data.length === 0) {
            console.log('❌ Webhookデータが見つかりませんでした。');
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
            
            // 実際のデータを追加
            await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: sheetName,
              valueInputOption: 'RAW',
              insertDataOption: 'INSERT_ROWS',
              resource: { values: data }
            });
            console.log(`✅ 実際のデータを追加しました: ${data.length}件`);
            
            // フォーマットを適用
            const spreadsheet = await sheets.spreadsheets.get({
              spreadsheetId
            });
            
            const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
            if (sheet) {
              const sheetId = sheet.properties.sheetId;
              
              const formatRequests = [
                {
                  repeatCell: {
                    range: {
                      sheetId: sheetId,
                      startRowIndex: 0,
                      endRowIndex: 1,
                      startColumnIndex: 0,
                      endColumnIndex: 5
                    },
                    cell: {
                      userEnteredFormat: {
                        backgroundColor: {
                          red: 0.9,
                          green: 0.9,
                          blue: 0.9
                        },
                        textFormat: {
                          bold: true,
                          foregroundColor: {
                            red: 0,
                            green: 0,
                            blue: 0
                          }
                        }
                      }
                    },
                    fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat'
                  }
                }
              ];
              
              await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                  requests: formatRequests
                }
              });
              
              console.log('✅ フォーマットを適用しました（ヘッダー: グレー背景、文字: 黒）');
            }
            
            console.log('🎉 実際のWebhookデータ保存が完了しました！');
            
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
  saveRealWebhookData().catch(console.error);
}

module.exports = saveRealWebhookData; 