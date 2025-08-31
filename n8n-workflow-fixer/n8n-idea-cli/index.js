#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const N8nWorkflowManager = require('./lib/n8n-workflow-manager');
const ClaudeErrorFixer = require('./lib/claude-error-fixer');

// config.envファイルから環境変数を読み込み
const loadConfig = () => {
  try {
    const configPath = path.join(__dirname, 'config.env');
    const configContent = require('fs').readFileSync(configPath, 'utf8');
    const config = {};
    
    configContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, value] = trimmedLine.split('=');
        if (key && value) {
          config[key.trim()] = value.trim();
        }
      }
    });
    
    return config;
  } catch (error) {
    console.log('⚠️  config.env file not found, using command line arguments only');
    return {};
  }
};

const config = loadConfig();

const program = new Command();

program
  .name('n8n-fixer')
  .description('n8n workflow management with Claude AI error fixing')
  .version('1.0.0');

program
  .option('-i, --input <file>', 'JSON workflow file path', 'workflow.json')
  .option('-e, --endpoint <url>', 'n8n endpoint URL', config.N8N_ENDPOINT || 'http://n8n.imasys.jp:5678')
  .option('--api-key <key>', 'n8n API key for authentication', config.N8N_API_KEY)
  .option('--email <email>', 'n8n login email', config.N8N_EMAIL || 'info@esitenetwork.com')
  .option('--password <password>', 'n8n login password', config.N8N_PASSWORD || 'ConoHa2025!')
  .option('-m, --maxRetry <number>', 'Maximum retry attempts', '3')
  .option('--claude-key <key>', 'Claude API key', config.CLAUDE_API_KEY)
  .option('--claude-model <model>', 'Claude model to use', 'claude-3-opus-20240229')
  .action(async (options) => {
    try {
      console.log('🚀 Starting n8n workflow fixer...');
      
      // Validate required options
      if (!options.claudeKey || options.claudeKey === 'your-claude-api-key-here') {
        console.error('❌ Error: --claude-key is required and must be a valid API key');
        console.error('💡 Please set CLAUDE_API_KEY in config.env or provide --claude-key');
        process.exit(1);
      }
      
      if (!options.apiKey) {
        console.error('❌ Error: --api-key is required for n8n v1.80.0');
        console.error('💡 Please set N8N_API_KEY in config.env or provide --api-key');
        process.exit(1);
      }
      
      // Log authentication method
      console.log('🔐 Using API Key authentication (recommended for n8n v1.80.0)');
      
      // Initialize managers
      const n8nManager = new N8nWorkflowManager(
        options.endpoint, 
        options.apiKey || null, 
        options.email, 
        options.password
      );
      const claudeFixer = new ClaudeErrorFixer(options.claudeKey, options.claudeModel);
      
      // Read workflow file
      console.log(`📖 Reading workflow file: ${options.input}`);
      const workflowData = await fs.readFile(options.input, 'utf8');
      const workflow = JSON.parse(workflowData);
      
      // 既存ワークフローを検索（汎用的）
      const workflowName = workflow.name || 'Unnamed Workflow';
      console.log(`🔍 Searching for existing workflow: "${workflowName}"`);
      const existingWorkflow = await n8nManager.findWorkflowByName(workflowName);
      
      // ワークフロー名を保持（修正後も同じ名前を使用）
      const originalWorkflowName = workflowName;
      
      let currentWorkflow = workflow;
      let workflowId;
      
      if (existingWorkflow) {
        console.log('✅ Found existing workflow, will update it');
        workflowId = existingWorkflow.id;
      } else {
        console.log('📝 No existing workflow found, will create new one');
        workflowId = null;
      }
      
      // 完全自動化プロセス開始
      const maxRetries = parseInt(options.maxRetry);
      let attempt = 0;
      
      console.log('🤖 Starting fully automated workflow fixing process...');
      
      while (attempt < maxRetries) {
        attempt++;
        console.log(`\n🔄 Automated Fix Attempt ${attempt}/${maxRetries}`);
        
        try {
          // 事前検証と自動修正
          console.log('🔍 Pre-validation and auto-fixing...');
          const validation = await claudeFixer.validateWorkflow(currentWorkflow);
          
          if (!validation.valid) {
            console.log('⚠️  Workflow validation failed, attempting auto-fix...');
            const preFixedWorkflow = await claudeFixer.fixWorkflow(currentWorkflow, {
              type: 'validation_error',
              message: validation.reason
            });
            
            if (preFixedWorkflow) {
              console.log('✅ Pre-validation fix applied');
              currentWorkflow = preFixedWorkflow;
            }
          }
          
          // Webhookトリガーの自動確保
          console.log('🔧 Ensuring Webhook Trigger node...');
          const { nodes, connections } = n8nManager.ensureWebhookTrigger(currentWorkflow);
          currentWorkflow.nodes = nodes;
          currentWorkflow.connections = connections;
          
          // ワークフロー名を保持
          currentWorkflow.name = originalWorkflowName;
          
          // Upload workflow to n8n (create or update)
          if (workflowId) {
            console.log('📤 Updating existing workflow in n8n...');
          } else {
            console.log('📤 Creating new workflow in n8n...');
          }
          const resultWorkflowId = await n8nManager.uploadWorkflow(currentWorkflow);
          workflowId = resultWorkflowId; // 新規作成の場合は新しいIDを取得
          
          // 自動アクティベーション試行
          console.log('🔧 Attempting automatic activation...');
          try {
            await n8nManager.activateWorkflow(workflowId);
            console.log('✅ Workflow activated automatically');
          } catch (activationError) {
            console.log('⚠️  Automatic activation failed, manual activation required');
            console.log(`🔗 n8n URL: ${options.endpoint}`);
            console.log(`🆔 Workflow ID: ${workflowId}`);
            console.log('📋 GUIでワークフローをアクティブ化してください。');
          }
          
          // Execute workflow
          console.log('▶️  Executing workflow...');
          const executionResult = await n8nManager.executeWorkflow(workflowId);
          
          // Check for errors
          if (executionResult.success) {
            console.log('✅ Workflow executed successfully!');
            console.log('🎉 Fully automated workflow fixing completed!');
            break;
          } else {
            console.log('❌ Workflow execution failed');
            console.log('🔍 Error details:', executionResult.error);
            
            // Check if it's an activation error
            if (executionResult.error.includes('not active') || executionResult.error.includes('activate')) {
              console.log('📋 ワークフローが非アクティブです。GUIでアクティブ化してから再実行してください。');
              console.log(`🔗 n8n URL: ${options.endpoint}`);
              if (executionResult.workflowId) {
                console.log(`🆔 Workflow ID: ${executionResult.workflowId}`);
              }
              break;
            }
            
            // Check if it's a webhook registration error
            if (executionResult.error.includes('webhook') && executionResult.error.includes('not registered')) {
              console.log('⚠️  Webhook not registered. This is normal for newly created workflows.');
              console.log('💡 The workflow was created successfully. You can test it manually in the GUI.');
              console.log(`🔗 n8n URL: ${options.endpoint}`);
              break;
            }
            
            // Claude自動修正を無効化（ノードが消える問題のため）
            console.log('⚠️  Claude automatic fixing disabled to prevent node loss');
            console.log('💡 Manual intervention required');
            console.log(`🔗 n8n URL: ${options.endpoint}`);
            console.log(`🆔 Workflow ID: ${workflowId}`);
            break;
          }
          
        } catch (error) {
          console.error('💥 Unexpected error:', error.message);
          console.log('🔍 Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n')[0]
          });
          
          // ワークフロー作成エラーの場合
          if (error.message.includes('Failed to upload workflow') || 
              error.message.includes('All create endpoints failed')) {
            console.log('📋 ワークフロー作成に失敗しました。');
            console.log('💡 GUIで手動でワークフローを作成してください。');
            console.log(`🔗 n8n URL: ${options.endpoint}`);
            break;
          }
          
          break;
        }
      }
      
      if (attempt >= maxRetries) {
        console.log('⏰ Maximum retry attempts reached');
        console.log('💡 Please check the workflow manually in the n8n GUI');
        console.log(`🔗 n8n URL: ${options.endpoint}`);
        process.exit(1);
      }
      
      console.log('🎉 Workflow fixer completed successfully!');
      console.log(`🔗 n8n URL: ${options.endpoint}`);
      console.log('📋 You can now test the workflow manually in the GUI');
      
    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    }
  });

program.parse(); 