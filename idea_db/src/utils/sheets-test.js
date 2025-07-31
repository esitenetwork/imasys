const { google } = require('googleapis');
const config = require('../config');
const logger = require('./logger');

// Google Sheets接続テスト
async function testGoogleSheetsConnection() {
  try {
    console.log('🔍 Google Sheets接続テストを開始...');
    
    // 設定確認
    console.log('📋 設定確認:');
    console.log('- GOOGLE_SHEETS_ID:', config.googleSheets.spreadsheetId ? '✅ 設定済み' : '❌ 未設定');
    console.log('- SERVICE_ACCOUNT_EMAIL:', config.googleSheets.serviceAccountEmail ? '✅ 設定済み' : '❌ 未設定');
    console.log('- PRIVATE_KEY:', config.googleSheets.privateKey ? '✅ 設定済み' : '❌ 未設定');
    
    if (!config.googleSheets.spreadsheetId || !config.googleSheets.serviceAccountEmail || !config.googleSheets.privateKey) {
      throw new Error('Google Sheets設定が不完全です');
    }
    
    // 認証テスト
    console.log('\n🔐 認証テスト...');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.googleSheets.serviceAccountEmail,
        private_key: config.googleSheets.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ 認証成功');
    
    // スプレッドシート情報取得テスト
    console.log('\n📊 スプレッドシート情報取得テスト...');
    const spreadsheetId = config.googleSheets.spreadsheetId;
    console.log('使用するスプレッドシートID:', spreadsheetId);
    
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    console.log('✅ スプレッドシート取得成功');
    console.log('スプレッドシート名:', spreadsheet.data.properties.title);
    console.log('シート一覧:');
    spreadsheet.data.sheets.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount}行 x ${sheet.properties.gridProperties.columnCount}列)`);
    });
    
    // テストデータ書き込み
    console.log('\n✏️  テストデータ書き込み...');
    const testSheetName = 'test_connection';
    
    // テストシートを作成（存在しない場合）
    const sheetExists = spreadsheet.data.sheets.some(
      sheet => sheet.properties.title === testSheetName
    );
    
    if (!sheetExists) {
      console.log(`シート "${testSheetName}" を作成中...`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: testSheetName,
                gridProperties: {
                  rowCount: 100,
                  columnCount: 10
                }
              }
            }
          }]
        }
      });
      console.log('✅ テストシート作成完了');
    }
    
    // テストデータ書き込み
    const testData = [
      ['Timestamp', 'Status', 'Message'],
      [new Date().toISOString(), 'SUCCESS', 'Connection test successful']
    ];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${testSheetName}!A1:C2`,
      valueInputOption: 'RAW',
      resource: { values: testData },
    });
    
    console.log('✅ テストデータ書き込み完了');
    
    // データ読み取りテスト
    console.log('\n📖 データ読み取りテスト...');
    const readResult = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${testSheetName}!A1:C2`,
    });
    
    console.log('読み取り結果:');
    readResult.data.values.forEach((row, index) => {
      console.log(`  行${index + 1}: ${row.join(' | ')}`);
    });
    
    // 権限確認のためのスプレッドシートURLを表示
    console.log('\n🔗 スプレッドシートURL:');
    console.log(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    console.log('\n⚠️  確認事項:');
    console.log('1. 上記URLをブラウザで開いて、テストシートが作成されているか確認してください');
    console.log('2. Service Accountメール（' + config.googleSheets.serviceAccountEmail + '）がスプレッドシートの編集権限を持っているか確認してください');
    
    console.log('\n🎉 Google Sheets接続テスト完了！');
    
  } catch (error) {
    console.error('❌ Google Sheets接続テストエラー:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data
    });
  }
}

// メイン実行
if (require.main === module) {
  testGoogleSheetsConnection();
}

module.exports = { testGoogleSheetsConnection }; 