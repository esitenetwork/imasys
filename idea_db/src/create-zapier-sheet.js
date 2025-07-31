const { google } = require('googleapis');
const config = require('./config');

async function createZapierSheet() {
  console.log('📋 Zapier専用シートを作成します...');
  
  try {
    // Google Sheets APIの認証
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.googleSheets.serviceAccountEmail,
        private_key: config.googleSheets.privateKey
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = config.googleSheets.spreadsheetId;
    
    // 新しいシートを作成
    const sheetTitle = 'zapier_data';
    
    console.log(`シート "${sheetTitle}" を作成中...`);
    
    const createSheetRequest = {
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10
                }
              }
            }
          }
        ]
      }
    };
    
    await sheets.spreadsheets.batchUpdate(createSheetRequest);
    console.log(`✅ シート "${sheetTitle}" を作成しました`);
    
    // ヘッダーを設定（Zapier専用5項目）
    const headers = [
      'platform',
      'source_app',
      'title',
      'used_apps',
      'url'
    ];
    
    console.log('ヘッダーを設定中...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `${sheetTitle}!A1:E1`,
      valueInputOption: 'RAW',
      resource: {
        values: [headers]
      }
    });
    
    // ヘッダーの書式設定
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: await getSheetId(sheets, spreadsheetId, sheetTitle),
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.2,
                    green: 0.6,
                    blue: 0.8
                  },
                  textFormat: {
                    bold: true,
                    foregroundColor: {
                      red: 1,
                      green: 1,
                      blue: 1
                    }
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }
        ]
      }
    });
    
    console.log('✅ ヘッダーの書式設定完了');
    
    console.log('\n🎉 Zapier専用シートの作成が完了しました！');
    console.log(`📊 シート名: ${sheetTitle}`);
    console.log('📊 データ: 空の状態（新規データを追加予定）');
    
  } catch (error) {
    if (error.code === 400 && error.message.includes('already exists')) {
      console.log('⚠️ シートは既に存在します。データの移動のみ実行します。');
      // 既存シートの場合はデータ移動のみ実行
      await moveZapierDataToExistingSheet();
    } else {
      console.error('❌ エラーが発生しました:', error.message);
    }
  }
}

async function moveZapierDataToExistingSheet() {
  console.log('📋 既存のZapierシートにデータを移動します...');
  
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.googleSheets.serviceAccountEmail,
        private_key: config.googleSheets.privateKey
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = config.googleSheets.spreadsheetId;
    const sheetTitle = 'zapier_data';
    
    // 既存のraw_dataからZapierデータを抽出
    const rawDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'raw_data!A:J'
    });
    
    const rawDataRows = rawDataResponse.data.values || [];
    const zapierData = rawDataRows.filter((row, index) => {
      if (index === 0) return false; // ヘッダーを除外
      return row[1] === 'zapier'; // platform列が'zapier'のもの
    });
    
    if (zapierData.length > 0) {
      // 既存のzapier_dataシートをクリア（ヘッダー以外）
      await sheets.spreadsheets.values.clear({
        spreadsheetId: spreadsheetId,
        range: `${sheetTitle}!A2:J`
      });
      
      // 新しいデータを追加
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${sheetTitle}!A2:J${zapierData.length + 1}`,
        valueInputOption: 'RAW',
        resource: {
          values: zapierData
        }
      });
      
      console.log(`✅ ${zapierData.length}件のZapierデータを移動しました`);
    } else {
      console.log('移動するZapierデータが見つかりませんでした');
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

async function getSheetId(sheets, spreadsheetId, sheetTitle) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId
  });
  
  const sheet = response.data.sheets.find(s => s.properties.title === sheetTitle);
  return sheet ? sheet.properties.sheetId : null;
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  createZapierSheet().catch(console.error);
}

module.exports = createZapierSheet; 