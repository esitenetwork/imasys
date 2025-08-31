const { google } = require('googleapis');
const config = require('./config');

async function removeSheetFormatting() {
  console.log('🎨 Google Sheetsの背景色を削除します...');
  
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
    
    // シートIDを取得
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId
    });
    
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
    if (!sheet) {
      console.log('❌ シートが見つかりません');
      return;
    }
    
    const sheetId = sheet.properties.sheetId;
    
    // 背景色を削除するリクエスト
    const requests = [
      {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 1000, // 十分な行数
            startColumnIndex: 0,
            endColumnIndex: 5 // A-E列
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 1,
                green: 1,
                blue: 1
              }
            }
          },
          fields: 'userEnteredFormat.backgroundColor'
        }
      }
    ];
    
    // フォーマットを適用
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: requests
      }
    });
    
    console.log('✅ 背景色を削除しました');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  removeSheetFormatting().catch(console.error);
}

module.exports = removeSheetFormatting; 