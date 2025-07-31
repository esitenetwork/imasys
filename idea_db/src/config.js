require('dotenv').config({ path: require('path').join(__dirname, '..', 'config.env') });

module.exports = {
  // Google Sheets設定
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    keyFile: require('path').join(__dirname, '..', 'google-service-account.json'),
    sheets: {
      rawData: 'raw_data',
      imasysIdeas: 'imasys_ideas', 
      statistics: 'statistics'
    }
  },

  // スクレイピング設定
  scraping: {
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    delayBetweenRequests: parseInt(process.env.DELAY_BETWEEN_REQUESTS) || 2000,
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 3,
    timeout: 30000
  },

  // プラットフォーム設定
  platforms: {
    n8n: {
      name: 'n8n',
      baseUrl: 'https://n8n.io',
      workflowsUrl: 'https://n8n.io/workflows/',
      enabled: true
    },
    zapier: {
      name: 'zapier',
      baseUrl: 'https://zapier.com',
      templatesUrl: 'https://zapier.com/templates',
      enabled: true
    },
    make: {
      name: 'make',
      baseUrl: 'https://www.make.com',
      templatesUrl: 'https://www.make.com/en/templates',
      enabled: true
    },
    powerAutomate: {
      name: 'power_automate',
      baseUrl: 'https://powerautomate.microsoft.com',
      templatesUrl: 'https://powerautomate.microsoft.com/en-us/templates/',
      enabled: true
    },
    awesomeSelfhosted: {
      name: 'awesome_selfhosted',
      baseUrl: 'https://github.com',
      repoUrl: 'https://github.com/awesome-selfhosted/awesome-selfhosted',
      enabled: true
    },
    awesomeN8n: {
      name: 'awesome_n8n',
      baseUrl: 'https://github.com',
      repoUrl: 'https://github.com/n8n-io/awesome-n8n',
      enabled: true
    },
    ifttt: {
      name: 'ifttt',
      baseUrl: 'https://ifttt.com',
      exploreUrl: 'https://ifttt.com/explore',
      enabled: true
    },
    airtable: {
      name: 'airtable',
      baseUrl: 'https://airtable.com',
      universeUrl: 'https://airtable.com/universe',
      enabled: true
    }
  },

  // デバッグ設定
  debug: {
    enabled: process.env.DEBUG_MODE === 'true',
    logLevel: process.env.LOG_LEVEL || 'info'
  }
}; 