const config = require('../config');

class Logger {
  constructor() {
    this.logLevel = config.debug.logLevel;
    this.debugEnabled = config.debug.enabled;
  }

  info(message, data = null) {
    this._log('INFO', message, data);
  }

  warn(message, data = null) {
    this._log('WARN', message, data);
  }

  error(message, data = null) {
    this._log('ERROR', message, data);
  }

  debug(message, data = null) {
    if (this.debugEnabled) {
      this._log('DEBUG', message, data);
    }
  }

  success(message, data = null) {
    this._log('SUCCESS', message, data);
  }

  _log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    console.log(logMessage);
    
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  // プラットフォーム別のログ
  platformStart(platform) {
    this.info(`🚀 ${platform} スクレイピング開始`);
  }

  platformComplete(platform, count) {
    this.success(`✅ ${platform} 完了: ${count}件取得`);
  }

  platformError(platform, error) {
    this.error(`❌ ${platform} エラー:`, error.message);
  }

  // 統計ログ
  scrapingStats(stats) {
    this.info('📊 スクレイピング統計:');
    Object.entries(stats).forEach(([platform, data]) => {
      this.info(`  ${platform}: ${data.total}件 (新規: ${data.new}件)`);
    });
  }
}

module.exports = new Logger(); 