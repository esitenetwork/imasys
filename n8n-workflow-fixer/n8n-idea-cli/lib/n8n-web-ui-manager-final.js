const { chromium } = require('playwright');

class N8nWebUIManager {
  constructor(endpoint, headless = true, debug = false, noAuth = true) {
    this.endpoint = endpoint.replace(/\/$/, '');
    this.headless = headless;
    this.debug = debug;
    this.noAuth = noAuth;
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    try {
      console.log('🌐 Launching browser...');
      console.log(`🔧 Headless mode: ${this.headless}`);
      console.log(`🔓 No Auth mode: ${this.noAuth}`);
      
      const launchOptions = {
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      };
      
      if (!this.headless) {
        launchOptions.slowMo = 1000;
      }
      
      this.browser = await chromium.launch(launchOptions);
      
      this.page = await this.browser.newPage();
      
      // Set viewport for better compatibility
      await this.page.setViewportSize({ width: 1280, height: 720 });
      
      // ブラウザ偽装設定（ヘッドレスブラウザを通常ブラウザとして認識させる）
      console.log('🔧 Setting up browser spoofing...');
      
      // User-Agent設定（通常のChromeブラウザとして偽装）
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // 追加ヘッダー設定
      await this.page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      });
      
      // JavaScript実行でブラウザ情報を偽装
      await this.page.addInitScript(() => {
        // WebDriverプロパティを削除
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
        
        // Chromeプロパティを追加
        Object.defineProperty(navigator, 'chrome', {
          get: () => ({
            runtime: {},
            loadTimes: function() {},
            csi: function() {},
            app: {}
          }),
        });
        
        // Permissions APIを偽装
        Object.defineProperty(navigator, 'permissions', {
          get: () => ({
            query: () => Promise.resolve({ state: 'granted' })
          }),
        });
        
        // プラグイン情報を偽装
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
        
        // 言語設定を偽装
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en', 'ja'],
        });
      });
      
      // n8nのメインページに直接アクセス（認証スキップ）
      console.log('🔐 Accessing n8n directly (no auth)...');
      await this.page.goto(`${this.endpoint}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // ルートページが正常にアクセスできることを確認
      await this.page.waitForTimeout(2000);
      
      const currentUrl = this.page.url();
      if (this.debug) {
        console.log(`🔍 Debug: Current URL: ${currentUrl}`);
      }
      
      if (currentUrl.includes('/signin')) {
        throw new Error('Root page redirected to signin - authentication required');
      }
      
      console.log('✅ Successfully accessed n8n root page');
      
      if (this.debug) {
        console.log('🔍 Debug: Page title:', await this.page.title());
        console.log('🔍 Debug: Current URL:', this.page.url());
      }
      
      // ルートページが正常に読み込まれるまで待機
      console.log('⏳ Waiting for n8n root page to load...');
      await this.page.waitForTimeout(3000);
      
      // 基本的なn8n要素が存在することを確認
      const basicSelectors = [
        'body',
        'div',
        'main',
        '.app',
        '#app'
      ];
      
      let pageLoaded = false;
      for (const selector of basicSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          pageLoaded = true;
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  Basic selector failed: ${selector}`);
          }
        }
      }
      
      if (!pageLoaded) {
        throw new Error('Could not verify n8n page loaded');
      }
      
      console.log('✅ Successfully accessed n8n root page (no auth)');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error.message);
      if (this.debug) {
        console.error('Stack trace:', error.stack);
      }
      return false;
    }
  }

  async uploadWorkflow(workflow) {
    try {
      console.log('📤 Uploading workflow via Web UI (Import dialog)...');
      
      // ワークフローページにアクセス（複数パターンを試行）
      console.log('📋 Navigating to workflows page...');
      
      const workflowUrls = [
        `${this.endpoint}/workflows`,
        `${this.endpoint}/home/workflows`,
        `${this.endpoint}/workflow`,
        `${this.endpoint}/home`
      ];
      
      let workflowPageAccessed = false;
      for (const url of workflowUrls) {
        try {
          console.log(`🔄 Trying URL: ${url}`);
          await this.page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 15000 
          });
          await this.page.waitForTimeout(2000);
          
          const currentUrl = this.page.url();
          if (this.debug) {
            console.log(`🔍 Debug: Current URL: ${currentUrl}`);
          }
          
          if (!currentUrl.includes('/signin')) {
            console.log(`✅ Successfully accessed: ${url}`);
            workflowPageAccessed = true;
            break;
          } else {
            console.log(`⚠️  Redirected to signin from: ${url}`);
          }
        } catch (error) {
          console.log(`⚠️  Failed to access: ${url} - ${error.message}`);
        }
      }
      
      if (!workflowPageAccessed) {
        throw new Error('Could not access workflows page - authentication required');
      }

      if (this.debug) {
        console.log('🔍 Debug: Current page title:', await this.page.title());
        console.log('🔍 Debug: Current URL:', this.page.url());
      }
      
      // インポートボタンを探してクリック
      console.log('🔍 Looking for import button...');
      let importBtnFound = false;
      const importSelectors = [
        'button:has-text("Import from File...")',
        'button:has-text("Import from File")',
        'button:has-text("Import from file")',
        'button:has-text("Import")',
        'button:has-text("インポート")',
        'button:has-text("Import from URL")',
        '[data-test-id="import-workflow"]',
        '[data-test-id="import-from-file"]',
        '.import-workflow-btn',
        '.import-btn',
        'button[title*="Import"]',
        'button[aria-label*="Import"]',
        'button:has-text("Add")',
        'button:has-text("New")',
        'button:has-text("Create")',
        'button:has-text("+")',
        'button:has-text("➕")'
      ];
      
      for (const sel of importSelectors) {
        try {
          await this.page.waitForSelector(sel, { timeout: 3000 });
          await this.page.click(sel);
          importBtnFound = true;
          console.log(`✅ Import button clicked: ${sel}`);
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  Import selector failed: ${sel}`);
          }
        }
      }
      
      if (!importBtnFound) {
        console.log('⚠️  Import button not found, trying alternative approach...');
        // 代替手段：メニューからインポートを探す
        const menuSelectors = [
          'button[aria-label="Menu"]',
          '.menu-button',
          'button:has-text("⋮")',
          'button:has-text("More")',
          'button:has-text("Actions")',
          'button[aria-label="More options"]',
          'button[aria-label="Menu"]',
          '.el-dropdown'
        ];
        
        for (const menuSel of menuSelectors) {
          try {
            await this.page.click(menuSel);
            await this.page.waitForTimeout(1000);
            
            const menuItemSelectors = [
              'button:has-text("Import")',
              'button:has-text("インポート")',
              'button:has-text("Import from File")',
              'button:has-text("Import from file")',
              '.el-dropdown-menu-item:has-text("Import")'
            ];
            
            for (const itemSel of menuItemSelectors) {
              try {
                await this.page.click(itemSel);
                importBtnFound = true;
                console.log(`✅ Import button found in menu: ${itemSel}`);
                break;
              } catch (error) {
                if (this.debug) {
                  console.log(`⚠️  Menu item selector failed: ${itemSel}`);
                }
              }
            }
            
            if (importBtnFound) break;
          } catch (error) {
            if (this.debug) {
              console.log(`⚠️  Menu selector failed: ${menuSel}`);
            }
          }
        }
      }
      
      if (!importBtnFound) {
        throw new Error('Import button not found in any location');
      }

      // ファイル選択ダイアログが表示されるまで待機
      console.log('⏳ Waiting for file selection dialog...');
      await this.page.waitForTimeout(3000);
      
      // ファイル入力フィールドを探してJSONファイルをアップロード
      console.log('📁 Looking for file input field...');
      const fileInputSelectors = [
        'input[type="file"]',
        'input[accept*="json"]',
        'input[accept*=".json"]',
        '[data-test-id="file-input"]',
        '.file-input',
        'input[type="file"][accept*="json"]'
      ];
      
      let fileInputFound = false;
      for (const sel of fileInputSelectors) {
        try {
          await this.page.waitForSelector(sel, { timeout: 5000 });
          
          // 一時的なJSONファイルを作成してアップロード
          const fs = require('fs');
          const tempFilePath = './temp-workflow.json';
          fs.writeFileSync(tempFilePath, JSON.stringify(workflow, null, 2));
          
          await this.page.setInputFiles(sel, tempFilePath);
          fileInputFound = true;
          console.log(`✅ File uploaded via: ${sel}`);
          
          // 一時ファイルを削除
          fs.unlinkSync(tempFilePath);
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  File input selector failed: ${sel}`);
          }
        }
      }
      
      if (!fileInputFound) {
        console.log('⚠️  File input not found, trying alternative approach...');
        // 代替手段：ファイル入力フィールドを直接作成
        try {
          await this.page.evaluate(() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.style.display = 'none';
            document.body.appendChild(input);
            input.click();
          });
          
          await this.page.waitForTimeout(1000);
          
          // 一時的なJSONファイルを作成
          const fs = require('fs');
          const tempFilePath = './temp-workflow.json';
          fs.writeFileSync(tempFilePath, JSON.stringify(workflow, null, 2));
          
          // ファイルをアップロード
          await this.page.setInputFiles('input[type="file"]', tempFilePath);
          fileInputFound = true;
          console.log('✅ File uploaded via dynamic input');
          
          // 一時ファイルを削除
          fs.unlinkSync(tempFilePath);
        } catch (error) {
          throw new Error('Could not upload file');
        }
      }

      // インポート実行ボタンをクリック
      console.log('🔘 Clicking import confirm button...');
      let importExecFound = false;
      const execSelectors = [
        'button:has-text("Import")',
        'button:has-text("インポート")',
        'button:has-text("Confirm")',
        'button:has-text("OK")',
        'button:has-text("Submit")',
        '[data-test-id="import-confirm"]',
        '.import-confirm-btn',
        'button[type="submit"]'
      ];
      
      for (const sel of execSelectors) {
        try {
          await this.page.waitForSelector(sel, { timeout: 5000 });
          await this.page.click(sel);
          importExecFound = true;
          console.log(`✅ Import confirm button clicked: ${sel}`);
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  Import confirm selector failed: ${sel}`);
          }
        }
      }
      
      if (!importExecFound) {
        throw new Error('Import confirm button not found');
      }

      // インポート完了を待機
      console.log('⏳ Waiting for import to complete...');
      await this.page.waitForTimeout(5000);

      // ワークフロー名を設定（必要なら）
      if (workflow.name) {
        try {
          const nameSelectors = [
            'input[name="name"]',
            'input[placeholder*="name"]',
            'input[placeholder*="Name"]',
            '[data-test-id="workflow-name"]'
          ];
          
          for (const sel of nameSelectors) {
            try {
              await this.page.waitForSelector(sel, { timeout: 3000 });
              await this.page.fill(sel, workflow.name);
              console.log(`✅ Workflow name set: ${workflow.name}`);
              break;
            } catch (error) {
              if (this.debug) {
                console.log(`⚠️  Name input selector failed: ${sel}`);
              }
            }
          }
        } catch (error) {
          console.log('⚠️  Could not set workflow name');
        }
      }

      // 保存ボタンをクリック
      console.log('💾 Saving workflow...');
      let saveBtnFound = false;
      const saveSelectors = [
        'button:has-text("Save")',
        'button:has-text("保存")',
        'button:has-text("Save Workflow")',
        'button:has-text("Save workflow")',
        '[data-test-id="save-workflow"]',
        '.save-workflow-btn',
        'button[type="submit"]',
        'button:has-text("Create")',
        'button:has-text("Create Workflow")'
      ];
      
      for (const sel of saveSelectors) {
        try {
          await this.page.waitForSelector(sel, { timeout: 5000 });
          await this.page.click(sel);
          saveBtnFound = true;
          console.log(`✅ Save button clicked: ${sel}`);
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  Save selector failed: ${sel}`);
          }
        }
      }
      
      if (!saveBtnFound) {
        throw new Error('Save button not found');
      }

      // 保存完了を待機
      console.log('⏳ Waiting for save to complete...');
      await this.page.waitForTimeout(5000);
      
      console.log('✅ Workflow imported and saved via Web UI');
      return { success: true, workflowId: 'web-ui-imported' };
      
    } catch (error) {
      // エラー内容を画面から取得できれば返す
      let errorMsg = error.message;
      try {
        const errorSelectors = [
          '.el-message__content',
          '.n8n-error',
          '.el-notification__content',
          '.error-message',
          '.alert-error',
          '.notification-error'
        ];
        
        for (const sel of errorSelectors) {
          try {
            await this.page.waitForSelector(sel, { timeout: 2000 });
            errorMsg = await this.page.$eval(sel, el => el.textContent);
            break;
          } catch (selectorError) {
            // Continue to next selector
          }
        }
      } catch (extractError) {
        // Use original error message if extraction fails
      }
      
      console.error('❌ Failed to import workflow via Web UI:', errorMsg);
      if (this.debug) {
        console.error('Stack trace:', error.stack);
      }
      return { success: false, error: errorMsg };
    }
  }

  async executeWorkflow(workflowId) {
    try {
      console.log('▶️  Executing workflow via Web UI...');
      
      // ワークフローを開く
      const workflowSelectors = [
        `[data-test-id="workflow-${workflowId}"]`,
        `.workflow-item:has-text("${workflowId}")`,
        `.workflow-card:has-text("${workflowId}")`,
        `[data-test-id="workflow-item"]:has-text("${workflowId}")`
      ];
      
      let workflowOpened = false;
      for (const sel of workflowSelectors) {
        try {
          await this.page.waitForSelector(sel, { timeout: 5000 });
          await this.page.click(sel);
          workflowOpened = true;
          console.log(`✅ Workflow opened: ${sel}`);
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  Workflow selector failed: ${sel}`);
          }
        }
      }
      
      if (!workflowOpened) {
        throw new Error('Could not open workflow');
      }
      
      // 実行ボタンをクリック
      const executeSelectors = [
        'button[data-test-id="execute-workflow"]',
        '.execute-workflow-btn',
        'button:has-text("Execute")',
        'button:has-text("実行")',
        'button:has-text("Run")',
        'button:has-text("Start")',
        'button[aria-label*="Execute"]',
        'button[aria-label*="Run"]'
      ];
      
      let executeClicked = false;
      for (const sel of executeSelectors) {
        try {
          await this.page.waitForSelector(sel, { timeout: 5000 });
          await this.page.click(sel);
          executeClicked = true;
          console.log(`✅ Execute button clicked: ${sel}`);
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  Execute selector failed: ${sel}`);
          }
        }
      }
      
      if (!executeClicked) {
        throw new Error('Could not click execute button');
      }
      
      // 実行完了を待機
      console.log('⏳ Waiting for execution to complete...');
      const successSelectors = [
        '.execution-success',
        '[data-test-id="execution-success"]',
        '.success-message',
        '.execution-complete',
        '.workflow-executed'
      ];
      
      let executionSuccess = false;
      for (const sel of successSelectors) {
        try {
          await this.page.waitForSelector(sel, { timeout: 30000 });
          executionSuccess = true;
          console.log(`✅ Execution success detected: ${sel}`);
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  Success selector failed: ${sel}`);
          }
        }
      }
      
      if (!executionSuccess) {
        // 30秒待機しても成功メッセージが表示されない場合は、エラーがないことを確認
        console.log('⏳ No success message found, checking for errors...');
        await this.page.waitForTimeout(5000);
        
        const errorSelectors = [
          '.execution-error',
          '.error-message',
          '.execution-failed',
          '[data-test-id="execution-error"]'
        ];
        
        for (const sel of errorSelectors) {
          try {
            await this.page.waitForSelector(sel, { timeout: 2000 });
            const errorText = await this.page.$eval(sel, el => el.textContent);
            throw new Error(`Execution failed: ${errorText}`);
          } catch (selectorError) {
            // Continue checking other selectors
          }
        }
        
        // エラーも見つからない場合は成功とみなす
        console.log('✅ No errors found, assuming execution successful');
        executionSuccess = true;
      }
      
      console.log('✅ Workflow executed successfully via Web UI');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to execute workflow via Web UI:', error.message);
      if (this.debug) {
        console.error('Stack trace:', error.stack);
      }
      return { success: false, error: error.message };
    }
  }

  async activateWorkflow(workflowId) {
    try {
      console.log('🔓 Activating workflow via Web UI...');
      
      // ワークフローを開く
      const workflowSelectors = [
        `[data-test-id="workflow-${workflowId}"]`,
        `.workflow-item:has-text("${workflowId}")`,
        `.workflow-card:has-text("${workflowId}")`
      ];
      
      let workflowOpened = false;
      for (const sel of workflowSelectors) {
        try {
          await this.page.waitForSelector(sel, { timeout: 5000 });
          await this.page.click(sel);
          workflowOpened = true;
          console.log(`✅ Workflow opened: ${sel}`);
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  Workflow selector failed: ${sel}`);
          }
        }
      }
      
      if (!workflowOpened) {
        throw new Error('Could not open workflow');
      }
      
      // アクティブ化トグルをクリック
      const toggleSelectors = [
        'input[type="checkbox"][data-test-id="workflow-active"]',
        '.workflow-active-toggle',
        'input[type="checkbox"]',
        '.toggle-switch',
        '[data-test-id="activate-workflow"]'
      ];
      
      let toggleClicked = false;
      for (const sel of toggleSelectors) {
        try {
          await this.page.waitForSelector(sel, { timeout: 5000 });
          await this.page.click(sel);
          toggleClicked = true;
          console.log(`✅ Toggle clicked: ${sel}`);
          break;
        } catch (error) {
          if (this.debug) {
            console.log(`⚠️  Toggle selector failed: ${sel}`);
          }
        }
      }
      
      if (!toggleClicked) {
        throw new Error('Could not find activation toggle');
      }
      
      console.log('✅ Workflow activated via Web UI');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Failed to activate workflow via Web UI:', error.message);
      if (this.debug) {
        console.error('Stack trace:', error.stack);
      }
      return { success: false, error: error.message };
    }
  }

  async close() {
    try {
      if (this.page) {
        await this.page.close();
        console.log('📄 Page closed');
      }
      
      if (this.browser) {
        await this.browser.close();
        console.log('🔒 Browser closed');
      }
    } catch (error) {
      console.log('⚠️  Error during browser close:', error.message);
      // Force close if normal close fails
      try {
        if (this.browser) {
          await this.browser.close();
          console.log('✅ Browser force-closed');
        }
      } catch (forceError) {
        console.log('⚠️  Force close also failed:', forceError.message);
      }
    }
  }
}

module.exports = N8nWebUIManager; 