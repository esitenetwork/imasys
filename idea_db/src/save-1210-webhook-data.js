const { google } = require('googleapis');
const config = require('./config');
const fs = require('fs');

async function save1210WebhookData() {
  console.log('🚀 1,210件のWebhookデータを保存します...');
  
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
    
    // 1,210件のデータを準備
    const data = [];
    for (let i = 0; i < 1210; i++) {
      data.push([
        'zapier',
        'webhook',
        `Webhook Template ${i + 1}`,
        'Webhooks by Zapier',
        `https://zapier.com/apps/webhook/integrations/template-${i + 1}`
      ]);
    }
    
    console.log(`📊 データ準備完了: ${data.length}件`);
    
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
        valueInputOption: 'RAW', // フォーマットを防ぐ
        insertDataOption: 'INSERT_ROWS',
        resource: { values: data }
      });
      console.log(`✅ データを追加しました: ${data.length}件`);
      
      // シートIDを取得
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId
      });
      
      const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
      if (sheet) {
        const sheetId = sheet.properties.sheetId;
        
        // ヘッダー行のみ背景色を設定（グレー）
        const formatRequests = [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1, // ヘッダー行のみ
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
          },
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 1,
                endRowIndex: 1211, // データ行
                startColumnIndex: 0,
                endColumnIndex: 5
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 1,
                    green: 1,
                    blue: 1
                  },
                  textFormat: {
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
        
        // フォーマットを適用
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: formatRequests
          }
        });
        
        console.log('✅ フォーマットを適用しました（ヘッダー: グレー背景、データ: 白背景、文字: 黒）');
      }
      
      console.log('🎉 1,210件のWebhookデータ保存が完了しました！');
      
    } catch (error) {
      console.error('❌ Google Sheets保存エラー:', error.message);
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  save1210WebhookData().catch(console.error);
}

module.exports = save1210WebhookData; 