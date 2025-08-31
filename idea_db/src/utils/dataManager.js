const fs = require('fs').promises;
const path = require('path');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { google } = require('googleapis');
const config = require('../config');
const logger = require('./logger');

class DataManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../../');
    this.existingData = new Map(); // 重複チェック用
  }

  // 既存データを読み込み
  async loadExistingData() {
    try {
      const rawDataPath = path.join(this.dataDir, 'raw_data.csv');
      const data = [];
      
      const fileExists = await fs.access(rawDataPath).then(() => true).catch(() => false);
      if (!fileExists) {
        logger.info('raw_data.csvが存在しません。新規作成します。');
        return;
      }

      return new Promise((resolve, reject) => {
        const stream = require('fs').createReadStream(rawDataPath)
          .pipe(csvParser())
          .on('data', (row) => {
            data.push(row);
            // 重複チェック用キーでマップに保存
            const key = this.generateDuplicateKey(row);
            this.existingData.set(key, row);
          })
          .on('end', () => {
            logger.info(`既存データ読み込み完了: ${data.length}件`);
            resolve(data);
          })
          .on('error', reject);
      });
    } catch (error) {
      logger.error('既存データ読み込みエラー:', error);
      throw error;
    }
  }

  // 重複チェック用キー生成
  generateDuplicateKey(data) {
    const title = (data.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${data.platform}_${title}`;
  }

  // 新規データのフィルタリング
  filterNewData(scrapedData) {
    const newData = [];
    const duplicates = [];

    scrapedData.forEach(item => {
      const key = this.generateDuplicateKey(item);
      if (!this.existingData.has(key)) {
        newData.push(item);
        this.existingData.set(key, item); // 今回のセッション内での重複も防ぐ
      } else {
        duplicates.push(item);
      }
    });

    logger.info(`重複チェック完了: 新規${newData.length}件, 重複${duplicates.length}件`);
    return { newData, duplicates };
  }

  // CSVに保存
  async saveToCSV(data, filename = 'raw_data.csv') {
    try {
      const filePath = path.join(this.dataDir, filename);
      
      // 既存データと新規データを結合
      const existingData = await this.loadExistingData() || [];
      const allData = [...existingData, ...data];

      const csvWriter = createCsvWriter({
        path: filePath,
        header: [
          { id: 'id', title: 'id' },
          { id: 'platform', title: 'platform' },
          { id: 'source_app', title: 'source_app' },
          { id: 'title', title: 'title' },
          { id: 'description', title: 'description' },
          { id: 'tools_tags', title: 'tools_tags' },
          { id: 'category', title: 'category' },
          { id: 'url', title: 'url' },
          { id: 'scraped_date', title: 'scraped_date' },
          { id: 'is_new', title: 'is_new' }
        ]
      });

      await csvWriter.writeRecords(allData);
      logger.success(`CSV保存完了: ${filePath} (${allData.length}件)`);
      
      return allData.length;
    } catch (error) {
      logger.error('CSV保存エラー:', error);
      throw error;
    }
  }

  // 統計情報の更新
  async updateStatistics(platformStats) {
    try {
      // 1. ローカルCSVファイルに保存
      const filePath = path.join(this.dataDir, 'statistics.csv');
      const csvWriter = createCsvWriter({
        path: filePath,
        header: [
          { id: 'platform', title: 'platform' },
          { id: 'total', title: 'total' },
          { id: 'new_this_month', title: 'new_this_month' },
          { id: 'used', title: 'used' },
          { id: 'unused', title: 'unused' }
        ]
      });

      const statsData = Object.entries(platformStats).map(([platform, stats]) => ({
        platform,
        total: stats.total || 0,
        new_this_month: stats.new || 0,
        used: stats.used || 0,
        unused: (stats.total || 0) - (stats.used || 0)
      }));

      await csvWriter.writeRecords(statsData);
      logger.info('ローカル統計ファイル更新完了');

      // 2. Google Sheetsに同期
      await this.syncStatisticsToGoogleSheets(statsData);
      
      logger.success('統計情報更新完了');
    } catch (error) {
      logger.error('統計情報更新エラー:', error);
      throw error;
    }
  }

  // Google Sheetsに統計データを同期
  async syncStatisticsToGoogleSheets(statsData) {
    try {
      if (!config.googleSheets.spreadsheetId) {
        logger.warn('Google Sheets IDが設定されていません。統計同期をスキップします。');
        return;
      }

      const sheets = await this.getGoogleSheetsAuth();
      const spreadsheetId = config.googleSheets.spreadsheetId;
      const sheetName = 'statistics';

      logger.info(`統計シート同期開始: ${sheetName} (${statsData.length}件)`);

      // 統計シートが存在するかチェック・作成
      await this.ensureSheetExists(sheets, spreadsheetId, sheetName);

      // ヘッダーと統計データを準備（総数のみ）
      const headers = [['platform', 'total']];
      const values = statsData.map(row => [
        row.platform || '',
        (row.total || 0).toLocaleString('ja-JP')
      ]);

      // 既存データをクリアしてから新しいデータを挿入
      const clearRange = `${sheetName}!A:B`;
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: clearRange,
      });

      // ヘッダーと統計データを一度に挿入
      const allData = [...headers, ...values];
      const updateResult = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: allData },
      });

      logger.info(`統計シート更新結果:`, {
        updatedRows: updateResult.data.updatedRows,
        updatedColumns: updateResult.data.updatedColumns,
        updatedCells: updateResult.data.updatedCells,
        updatedRange: updateResult.data.updatedRange
      });

      logger.success(`統計シート同期完了: ${sheetName} (${statsData.length}件)`);

      // 統計データの詳細をログに出力
      logger.info('統計詳細:');
      statsData.forEach(stat => {
        logger.info(`  ${stat.platform}: 合計${stat.total}件`);
      });

    } catch (error) {
      logger.error('統計シート同期エラー:', error);
      // エラーでも処理は続行
    }
  }

  // Google Sheets認証
  async getGoogleSheetsAuth() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: config.googleSheets.serviceAccountEmail,
          private_key: config.googleSheets.privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      return google.sheets({ version: 'v4', auth });
    } catch (error) {
      logger.error('Google Sheets認証エラー:', error);
      throw error;
    }
  }

  // シートの存在確認と作成
  async ensureSheetExists(sheets, spreadsheetId, sheetName) {
    try {
      // スプレッドシート情報を取得
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId,
      });

      // 指定されたシートが存在するかチェック
      const sheetExists = spreadsheet.data.sheets.some(
        sheet => sheet.properties.title === sheetName
      );

      if (!sheetExists) {
        logger.info(`シート "${sheetName}" が存在しないため作成します`);
        
        // シートを作成
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 10
                  }
                }
              }
            }]
          }
        });
        
        logger.success(`シート "${sheetName}" を作成しました`);
      } else {
        logger.info(`シート "${sheetName}" が存在することを確認`);
      }
    } catch (error) {
      logger.warn(`シート確認エラー: ${error.message}`);
      // エラーが発生してもシートが存在する可能性があるので処理続行
    }
  }

  // Google Sheetsにデータ送信
  async syncToGoogleSheets(data, sheetName = 'raw_data') {
    try {
      if (!config.googleSheets.spreadsheetId) {
        logger.warn('Google Sheets IDが設定されていません。スキップします。');
        return;
      }

      const sheets = await this.getGoogleSheetsAuth();
      const spreadsheetId = config.googleSheets.spreadsheetId;

      logger.info(`Google Sheets同期開始: ${sheetName} (${data.length}件)`);

      // まずシートが存在するかチェック
      await this.ensureSheetExists(sheets, spreadsheetId, sheetName);

      // データを2次元配列に変換
      const values = data.map(row => [
        row.id || '',
        row.platform || '',
        row.title || '',
        row.description || '',
        row.tools_tags || '',
        row.category || '',
        row.url || '',
        row.scraped_date || '',
        row.is_new || false
      ]);

      // ヘッダーが存在するかチェック
      const range = `${sheetName}!A1:I1`;
      let headerCheck;
      try {
        headerCheck = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });
        logger.info('ヘッダーチェック完了');
      } catch (headerError) {
        logger.warn(`ヘッダーチェックエラー: ${headerError.message}`);
        headerCheck = { data: { values: [] } };
      }

      let startRow = 2; // デフォルトは2行目から
      if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
        // ヘッダーを追加
        const headers = [['id', 'platform', 'title', 'description', 'tools_tags', 'category', 'url', 'scraped_date', 'is_new']];
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:I1`,
          valueInputOption: 'RAW',
          resource: { values: headers },
        });
        startRow = 2;
      } else {
        // 既存データの末尾を取得
        const existingDataRange = `${sheetName}!A:A`;
        const existingData = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: existingDataRange,
        });
        startRow = (existingData.data.values?.length || 1) + 1;
      }

      // データを追加 - appendメソッドを使用してより確実に追加
      if (values.length > 0) {
        logger.info(`データ追加開始:`, {
          spreadsheetId: spreadsheetId,
          sheetName: sheetName,
          valueCount: values.length,
          sampleData: values.slice(0, 3) // 最初の3件をサンプル表示
        });
        
        // appendメソッドでデータを追加（より確実）
        const appendResult = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: sheetName, // シート名のみ指定
          valueInputOption: 'USER_ENTERED', // RAWからUSER_ENTEREDに変更
          insertDataOption: 'INSERT_ROWS', // 新しい行を挿入
          resource: { values },
        });
        
        logger.info(`Google Sheets API追加結果:`, {
          updatedRows: appendResult.data.updates.updatedRows,
          updatedColumns: appendResult.data.updates.updatedColumns,
          updatedCells: appendResult.data.updates.updatedCells,
          updatedRange: appendResult.data.updates.updatedRange,
          tableRange: appendResult.data.tableRange
        });

        logger.success(`Google Sheets同期完了: ${sheetName} (${values.length}件追加)`);
        
        // 実際にデータが保存されたか確認
        const verifyRange = `${sheetName}!A${startRow}:A${startRow + 10}`; // 最初の10行を確認
        const verifyResult = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: verifyRange,
        });
        
        logger.info(`データ保存確認:`, {
          verifyRange: verifyRange,
          actualRows: verifyResult.data.values?.length || 0,
          sampleVerifyData: verifyResult.data.values?.slice(0, 3) || []
        });
      }
    } catch (error) {
      logger.error('Google Sheets同期エラー:', error);
      // Google Sheetsエラーでも処理は続行
    }
  }
}

module.exports = DataManager; 