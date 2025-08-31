const axios = require('axios');

class N8nWorkflowManager {
  constructor(endpoint, apiKey = null, email = 'info@esitenetwork.com', password = 'ConoHa2025!') {
    this.endpoint = endpoint.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.email = email;
    this.password = password;
    this.cookies = null;
    this.isAuthenticated = false;
    this.useApiKey = !!apiKey;
    
    // axiosインスタンスを作成
    this.client = axios.create({
      baseURL: this.endpoint,
      timeout: 600000, // タイムアウトを10分に延長（AI処理のため）
      withCredentials: !this.useApiKey // APIキー使用時はfalse
    });
  }

  // ログイン処理（Cookie取得）
  async login() {
    try {
      console.log('🔐 Logging in to n8n...');
      
      const loginResponse = await this.client.post('/rest/login', {
        email: this.email,
        password: this.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Cookieを取得
      const setCookieHeaders = loginResponse.headers['set-cookie'];
      if (setCookieHeaders) {
        this.cookies = setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
        console.log('✅ Login successful - Cookies obtained');
        console.log('🔍 Cookie details:', {
          count: setCookieHeaders.length,
          cookies: this.cookies.substring(0, 50) + '...'
        });
        this.isAuthenticated = true;
      } else {
        console.log('⚠️  No set-cookie headers found in response');
        console.log('🔍 Available headers:', Object.keys(loginResponse.headers));
        throw new Error('No cookies received from login response');
      }

      return true;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      console.error('🔍 Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  }

  // ヘッダー取得（APIキー or Cookie認証）
  getHeaders() {
    if (this.useApiKey) {
      if (!this.apiKey) {
        throw new Error('API key is required for API authentication.');
      }

      const headers = {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      };
      
      // Debug: Log headers (without sensitive data)
      console.log('🔐 API Key headers:', {
        'X-N8N-API-KEY': '***',
        'Content-Type': 'application/json'
      });
      
      return headers;
    } else {
      if (!this.isAuthenticated || !this.cookies) {
        throw new Error('Not authenticated. Please call login() first.');
      }

      const headers = {
        'Cookie': this.cookies,
        'Content-Type': 'application/json'
      };
      
      // Debug: Log headers (without sensitive data)
      console.log('🔐 Cookie headers:', {
        'Cookie': this.cookies ? this.cookies.substring(0, 30) + '...' : 'EMPTY',
        'Content-Type': 'application/json'
      });
      
      return headers;
    }
  }

  // 認証確認
  async ensureAuthenticated() {
    if (this.useApiKey) {
      // APIキー認証の場合は認証確認不要
      return;
    } else {
      if (!this.isAuthenticated) {
        await this.login();
      }
    }
  }

  // Webhook検出と自動修正の強化関数
  ensureWebhookTrigger(workflow) {
    // 元のワークフローを破壊しないよう、ディープコピーを作成
    const nodes = JSON.parse(JSON.stringify(workflow.nodes || []));
    const connections = JSON.parse(JSON.stringify(workflow.connections || {}));
    
    // n8n v1.80.0対応のWebhook検出ロジック
    const hasWebhookTrigger = nodes.some(node => {
      // 複数のWebhookノードタイプをチェック
      return node.type === 'n8n-nodes-base.webhook' ||
             node.type === 'n8n-nodes-base.webhookV2' ||
             (node.type === 'n8n-nodes-base.httpRequest' && 
              node.parameters && 
              node.parameters.httpMethod === 'POST' &&
              node.parameters.path && 
              node.parameters.path.startsWith('webhook'));
    });
    
    // Manual Trigger検出（n8n v1.80.0対応）
    const hasManualTrigger = nodes.some(node => 
      node.type === 'n8n-nodes-base.manualTrigger' ||
      node.type === 'n8n-nodes-base.manualTriggerV2' ||
      node.type === 'n8n-nodes-base.trigger'
    );
    
    console.log(`🔍 Webhook detection: ${hasWebhookTrigger ? 'Found' : 'Not found'}`);
    console.log(`🔍 Manual trigger detection: ${hasManualTrigger ? 'Found' : 'Not found'}`);
    
    if (!hasWebhookTrigger) {
      if (hasManualTrigger) {
        console.log('🔄 Converting Manual Trigger to Webhook Trigger...');
        
        // Manual Triggerノードを検索（複数タイプ対応）
        const manualTriggerIndex = nodes.findIndex(node => 
          node.type === 'n8n-nodes-base.manualTrigger' ||
          node.type === 'n8n-nodes-base.manualTriggerV2' ||
          node.type === 'n8n-nodes-base.trigger'
        );
        
        if (manualTriggerIndex !== -1) {
          const originalNode = nodes[manualTriggerIndex];
          
          // n8n v1.80.0対応のWebhookノード作成
          const webhookNode = {
            id: originalNode.id || `webhook-${Date.now()}`,
            name: 'Webhook Trigger',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: originalNode.position || [240, 300],
            parameters: {
              httpMethod: 'POST',
              path: `workflow-${Date.now()}`,
              authentication: 'none',
              responseMode: 'responseNode',
              responseHeaders: {
                parameters: [
                  {
                    name: 'Content-Type',
                    value: 'application/json'
                  }
                ]
              }
            },
            webhookId: `webhook-${Date.now()}`
          };
          
          // ノードを置き換え
          nodes[manualTriggerIndex] = webhookNode;
          
          // 接続名を更新
          const oldNodeName = originalNode.name;
          if (connections[oldNodeName]) {
            connections['Webhook Trigger'] = connections[oldNodeName];
            delete connections[oldNodeName];
          }
        }
      } else {
        console.log('🔧 Adding new Webhook Trigger node...');
        
        // 新しいWebhookノードを作成
        const webhookNode = {
          id: `webhook-${Date.now()}`,
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            httpMethod: 'POST',
            path: `workflow-${Date.now()}`,
            authentication: 'none',
            responseMode: 'responseNode',
            responseHeaders: {
              parameters: [
                {
                  name: 'Content-Type',
                  value: 'application/json'
                }
              ]
            }
          },
          webhookId: `webhook-${Date.now()}`
        };
        
        // ノードリストの先頭に追加
        nodes.unshift(webhookNode);
        
        // 最初のノードがあれば、Webhookから接続
        if (nodes.length > 1) {
          const firstNode = nodes[1];
          connections['Webhook Trigger'] = {
            main: [
              [
                {
                  node: firstNode.name,
                  type: 'main',
                  index: 0
                }
              ]
            ]
          };
        }
      }
      
      console.log('✅ Webhook Trigger node processed successfully');
    } else {
      console.log('✅ Webhook Trigger node already exists');
    }
    
    return { nodes, connections };
  }

  async uploadWorkflow(workflow) {
    try {
      await this.ensureAuthenticated();
      
      const workflowName = workflow.name || 'Auto-fixed Workflow';
      
      // Webhookトリガーノードを自動追加（Manual Triggerから変換）
      const { nodes, connections } = this.ensureWebhookTrigger(workflow);
      
      // Check if workflow with same name already exists
      console.log('🔍 Checking for existing workflows...');
      const existingWorkflow = await this.findWorkflowByName(workflowName);
      
      if (existingWorkflow) {
        console.log(`✅ Found existing workflow with ID: ${existingWorkflow.id}`);
        console.log('📝 Updating existing workflow...');
        
        // n8n v1.80.0対応: APIキー認証の場合は/api/v1/エンドポイントを使用
        const updateEndpoints = this.useApiKey ? [
          `/api/v1/workflows/${existingWorkflow.id}`
        ] : [
          `/api/v1/workflows/${existingWorkflow.id}`,  // フォールバックとしても試行
          `/rest/workflows/${existingWorkflow.id}`,
          `/rest/workflow/${existingWorkflow.id}`,
          `/rest/workflows/${existingWorkflow.id}/update`
        ];
        
        let updateSuccess = false;
        let lastError = null;
        
        for (const endpoint of updateEndpoints) {
          try {
            console.log(`🔄 Trying update endpoint: ${endpoint}`);
            // activeプロパティを削除（読み取り専用のため）
            const updateData = {
              name: workflowName,
              nodes: nodes,
              connections: connections,
              settings: workflow.settings || {}
            };
            
            const updateResponse = await this.client.put(endpoint, updateData, {
              headers: this.getHeaders()
            });
            
            console.log(`✅ Workflow updated successfully using: ${endpoint}`);
            updateSuccess = true;
            break;
          } catch (error) {
            console.log(`⚠️  Update failed with endpoint ${endpoint}: ${error.response?.status} ${error.response?.statusText}`);
            lastError = error;
          }
        }
        
        if (!updateSuccess) {
          console.log('⚠️  All update endpoints failed');
          throw new Error(`Failed to update existing workflow: ${lastError?.response?.data?.message || lastError?.message || 'Unknown error'}`);
        }
        
        console.log(`✅ Workflow updated successfully with ID: ${existingWorkflow.id}`);
        
        // 更新後に自動アクティベーションを試行
        try {
          await this.activateWorkflow(existingWorkflow.id);
          console.log('✅ Workflow activated automatically after update');
        } catch (activationError) {
          console.log('⚠️  Automatic activation failed after update, manual activation required');
        }
        
        return existingWorkflow.id;
      } else {
        // Create new workflow using /rest/workflows endpoint
        console.log('📤 Creating new workflow...');
        
        // n8n v1.80.0対応: APIキー認証の場合は/api/v1/エンドポイントを使用
        const createEndpoints = this.useApiKey ? [
          '/api/v1/workflows'
        ] : [
          '/api/v1/workflows',  // フォールバックとしても試行
          '/rest/workflows',
          '/rest/workflow',
          '/rest/workflows/create'
        ];
        
        let response = null;
        let createSuccess = false;
        let lastError = null;
        
        for (const endpoint of createEndpoints) {
          try {
            console.log(`🔄 Trying create endpoint: ${endpoint}`);
            // activeプロパティを削除（読み取り専用のため）
            const createData = {
              name: workflowName,
              nodes: nodes,
              connections: connections,
              settings: workflow.settings || {}
            };
            
            response = await this.client.post(endpoint, createData, {
              headers: this.getHeaders()
            });
            
            console.log(`✅ Workflow created successfully using: ${endpoint}`);
            createSuccess = true;
            break;
          } catch (error) {
            console.log(`⚠️  Create failed with endpoint ${endpoint}: ${error.response?.status} ${error.response?.statusText}`);
            lastError = error;
          }
        }
        
        if (!createSuccess) {
          const errorMessage = lastError?.response?.data?.message || 
                              lastError?.response?.data || 
                              lastError?.message || 
                              'Unknown error';
          throw new Error(`All create endpoints failed. Last error: ${errorMessage}`);
        }

        // レスポンス構造をログで確認
        console.log('🔍 Response data:', JSON.stringify(response.data, null, 2));

        // 複数のパターンでIDを取得
        const workflowId = response.data.id || response.data.data?.id || response.data.workflow?.id;

        if (!workflowId) {
          throw new Error('Failed to get workflow ID from response');
        }

        console.log(`✅ New workflow created with ID: ${workflowId}`);
        
        // 作成後に自動アクティベーションを試行
        try {
          await this.activateWorkflow(workflowId);
          console.log('✅ Workflow activated automatically after creation');
        } catch (activationError) {
          console.log('⚠️  Automatic activation failed after creation, manual activation required');
        }
        
        // 作成直後に検証
        console.log('🔍 Verifying workflow creation...');
        try {
          const verification = await this.getWorkflow(workflowId);
          if (verification.success) {
            console.log('✅ Workflow verification successful');
            return workflowId;
          } else {
            console.log('⚠️  Workflow verification failed, but ID was returned');
            console.log('🔍 Verification error:', verification.error);
            return workflowId; // 一応IDを返す
          }
        } catch (verifyError) {
          console.log('⚠️  Workflow verification error:', verifyError.message);
          console.log('🔍 Returning workflow ID despite verification failure');
          return workflowId; // 一応IDを返す
        }
      }
    } catch (error) {
      console.error('❌ Failed to upload workflow:', error.response?.data || error.message);
      console.error('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  }

  async findWorkflowByName(name) {
    try {
      await this.ensureAuthenticated();
      
      const endpoint = this.useApiKey ? '/api/v1/workflows' : '/rest/workflows';
      const response = await this.client.get(endpoint, {
        headers: this.getHeaders()
      });
      
      const workflows = response.data.data || response.data;
      
      // Find workflow with matching name
      const workflow = workflows.find(w => w.name === name);
      return workflow || null;
    } catch (error) {
      console.error('❌ Failed to get workflows list:', error.response?.data || error.message);
      console.error('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
      });
      return null;
    }
  }

  async executeWorkflow(workflowId) {
    try {
      await this.ensureAuthenticated();
      
      console.log(`▶️  Executing workflow ${workflowId} via Webhook...`);
      
      // 常にAPIキーで詳細なワークフロー情報を取得
      const workflowDetails = await this.getWorkflowDetailsWithApiKey(workflowId);
      
      if (!workflowDetails) {
        console.error('❌ Failed to get workflow details with API key.');
        return {
          success: false,
          error: 'Failed to get workflow details with API key',
          workflowId: workflowId
        };
      }
      
      // 強化されたロジックでWebhookノードを検出
      const hasWebhookNode = workflowDetails.nodes && workflowDetails.nodes.some(node => 
        node.type === 'n8n-nodes-base.webhook' ||
        node.type === 'n8n-nodes-base.webhookV2' ||
        (node.type === 'n8n-nodes-base.httpRequest' && 
         node.parameters && 
         node.parameters.httpMethod === 'POST' &&
         node.parameters.path && 
         node.parameters.path.startsWith('webhook'))
      );
      
      // Manual Triggerノードの検出
      const hasManualTrigger = workflowDetails.nodes && workflowDetails.nodes.some(node => 
        node.type === 'n8n-nodes-base.manualTrigger' ||
        node.type === 'n8n-nodes-base.manualTriggerV2' ||
        node.type === 'n8n-nodes-base.trigger'
      );
      
      if (!hasWebhookNode) {
        if (hasManualTrigger) {
          console.log('⚠️  Manual Trigger detected - attempting manual execution...');
          return await this.executeManualTriggerWorkflow(workflowId, workflowDetails);
        } else {
          console.error('❌ No Webhook Trigger or Manual Trigger found in workflow.');
          return {
            success: false,
            error: 'No Webhook Trigger or Manual Trigger found in workflow',
            workflowId: workflowId,
            nodes: workflowDetails.nodes?.map(n => ({ name: n.name, type: n.type })) || []
          };
        }
      }
      
      console.log('✅ Webhook node detected via API v1');
      
      const workflow = workflowDetails;
      
      // ワークフローがアクティブかチェック
      if (!workflow.active) {
        console.error('❌ Workflow is not active. Please activate it in the GUI first.');
        return {
          success: false,
          error: 'Workflow is not active. Please activate it in the GUI first.',
          workflowId: workflowId,
          n8nUrl: this.endpoint
        };
      }
      
      console.log('✅ Workflow is active');
      
      // Webhook URLを取得
      const webhookResult = await this.getWebhookUrl(workflowId);
      
      if (!webhookResult.success) {
        return {
          success: false,
          error: webhookResult.error,
          workflowId: workflowId,
          n8nUrl: this.endpoint
        };
      }
      
      const { webhookUrl } = webhookResult;
      
      console.log(`🌐 Executing workflow via Webhook: ${webhookUrl}`);
      
      // Webhook経由でワークフローを実行
      console.log(`🌐 Executing webhook with URL: ${webhookUrl}`);
      console.log(`📤 Sending data:`, {
        timestamp: new Date().toISOString(),
        source: 'n8n-workflow-fixer',
        workflowId: workflowId,
        data: {
          message: 'Workflow execution triggered via API',
          trigger: 'webhook'
        }
      });
      
      const response = await this.client.post(webhookUrl, {
        timestamp: new Date().toISOString(),
        source: 'n8n-workflow-fixer',
        workflowId: workflowId,
        data: {
          message: 'Workflow execution triggered via API',
          trigger: 'webhook'
        }
      }, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        timeout: 600000 // タイムアウトを10分に設定（AI処理のため）
      });
      
      console.log('✅ Webhook execution successful');
      console.log('📊 Response status:', response.status);
      console.log('📊 Response data:', response.data);
      
      // Wait a bit for execution to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Get execution results
      const executionEndpoint = this.useApiKey ? 
        `/api/v1/executions?workflowId=${workflowId}&limit=1&sort=desc` :
        `/rest/executions?workflowId=${workflowId}&limit=1&sort=desc`;
      
      console.log(`🔍 Fetching executions from: ${executionEndpoint}`);
      
      const executions = await this.client.get(executionEndpoint, {
        headers: this.getHeaders(),
        timeout: 600000 // タイムアウトを10分に設定（AI処理のため）
      });
      
      console.log('📊 Executions response:', {
        status: executions.status,
        dataLength: executions.data?.data?.length || 0,
        data: executions.data
      });
      
      if (!executions.data.data || executions.data.data.length === 0) {
        console.log('⚠️  No execution records found');
        return { 
          success: true, 
          message: 'Webhook executed successfully, but no execution record found yet',
          webhookUrl: webhookUrl
        };
      }
      
      const latestExecution = executions.data.data[0];
      console.log('📊 Latest execution:', {
        id: latestExecution.id,
        status: latestExecution.status,
        startedAt: latestExecution.startedAt,
        finishedAt: latestExecution.finishedAt
      });
      
      if (latestExecution.status === 'success') {
        return { 
          success: true, 
          data: latestExecution,
          webhookUrl: webhookUrl
        };
      } else {
        return { 
          success: false, 
          error: latestExecution.error || 'Execution failed',
          execution: latestExecution,
          webhookUrl: webhookUrl
        };
      }
    } catch (error) {
      console.error('❌ Failed to execute workflow via webhook:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async deleteWorkflow(workflowId) {
    try {
      await this.ensureAuthenticated();
      
      // 複数のエンドポイントパターンを試行（n8n v1.80.0対応）
      const deleteEndpoints = this.useApiKey ? [
        `/api/v1/workflows/${workflowId}`
      ] : [
        `/rest/workflows/${workflowId}`,
        `/rest/workflow/${workflowId}`,
        `/rest/workflows/${workflowId}/delete`
      ];
      
      let deleteSuccess = false;
      
      for (const endpoint of deleteEndpoints) {
        try {
          console.log(`🔄 Trying delete endpoint: ${endpoint}`);
          await this.client.delete(endpoint, {
            headers: this.getHeaders()
          });
          console.log(`🗑️  Deleted workflow ${workflowId} using: ${endpoint}`);
          deleteSuccess = true;
          break;
        } catch (error) {
          console.log(`⚠️  Delete failed with endpoint ${endpoint}: ${error.response?.status} ${error.response?.statusText}`);
        }
      }
      
      if (!deleteSuccess) {
        console.error('❌ Failed to delete workflow with all endpoints');
        console.log('⚠️  Workflow may still exist in n8n GUI');
        // 削除失敗でもエラーを投げない（GUIで手動削除可能）
        return false;
      }
      
      return true;
          } catch (error) {
        console.error('❌ Failed to delete workflow:', error.response?.data || error.message);
        console.log('⚠️  Returning false instead of throwing error');
        return false;
      }
  }

  async getWorkflow(workflowId) {
    try {
      await this.ensureAuthenticated();
      
      // 複数のエンドポイントパターンを試行（n8n v1.80.0対応）
      const getEndpoints = this.useApiKey ? [
        `/api/v1/workflows/${workflowId}`
      ] : [
        `/rest/workflows/${workflowId}`,
        `/rest/workflow/${workflowId}`,
        `/rest/workflows/${workflowId}/get`
      ];
      
      let lastError = null;
      
      for (const endpoint of getEndpoints) {
        try {
          console.log(`🔄 Trying get endpoint: ${endpoint}`);
          const response = await this.client.get(endpoint, {
            headers: this.getHeaders()
          });
          console.log(`✅ Got workflow using: ${endpoint}`);
          return { success: true, workflow: response.data };
        } catch (error) {
          console.log(`⚠️  Get failed with endpoint ${endpoint}: ${error.response?.status} ${error.response?.statusText}`);
          lastError = error;
        }
      }
      
      console.error('❌ Failed to get workflow with all endpoints');
      return { 
        success: false, 
        error: lastError?.response?.data?.message || lastError?.message || 'All get endpoints failed'
      };
    } catch (error) {
      console.error('❌ Failed to get workflow:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

    // ワークフロー自動アクティベーション機能
  async activateWorkflow(workflowId) {
    try {
      await this.ensureAuthenticated();
      
      console.log(`🔧 Attempting to activate workflow ${workflowId}...`);
      
      // 複数のアクティベーションエンドポイントを試行
      const activateEndpoints = this.useApiKey ? [
        `/api/v1/workflows/${workflowId}/activate`
      ] : [
        `/rest/workflows/${workflowId}/activate`,
        `/rest/workflow/${workflowId}/activate`,
        `/rest/workflows/${workflowId}/toggle`,
        `/rest/workflow/${workflowId}/toggle`
      ];
      
      let activateSuccess = false;
      
      for (const endpoint of activateEndpoints) {
        try {
          console.log(`🔄 Trying activation endpoint: ${endpoint}`);
          const response = await this.client.post(endpoint, {}, {
            headers: this.getHeaders()
          });
          console.log(`✅ Workflow activated using: ${endpoint}`);
          activateSuccess = true;
          break;
        } catch (error) {
          console.log(`⚠️  Activation failed with endpoint ${endpoint}: ${error.response?.status} ${error.response?.statusText}`);
        }
      }
      
      if (!activateSuccess) {
        throw new Error('All activation endpoints failed');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to activate workflow:', error.message);
      throw error;
    }
  }

  async getWebhookUrl(workflowId) {
    try {
      await this.ensureAuthenticated();
      
      // ワークフロー詳細を取得（APIキー認証対応）
      const workflow = this.useApiKey ? 
        await this.getWorkflowDetailsWithApiKey(workflowId) :
        (await this.getWorkflow(workflowId)).workflow;
      
      if (!workflow) {
        return {
          success: false,
          error: 'Failed to get workflow details'
        };
      }
      
      // n8n v1.80.0対応のWebhook検出（より詳細な検出）
      const webhookNode = workflow.nodes && workflow.nodes.find(node => {
        // 基本的なWebhookノード
        if (node.type === 'n8n-nodes-base.webhook' || node.type === 'n8n-nodes-base.webhookV2') {
          return true;
        }
        
        // HTTP RequestノードでWebhookとして動作するもの
        if (node.type === 'n8n-nodes-base.httpRequest' && 
            node.parameters && 
            node.parameters.httpMethod === 'POST' &&
            node.parameters.path && 
            node.parameters.path.startsWith('webhook')) {
          return true;
        }
        
        // 名前でWebhookを検出
        if (node.name && node.name.toLowerCase().includes('webhook')) {
          return true;
        }
        
        return false;
      });
      
      if (!webhookNode) {
        return {
          success: false,
          error: 'No Webhook Trigger node found in workflow'
        };
      }
      
      // Webhook URLを構築
      const webhookPath = webhookNode.parameters.path || webhookNode.webhookId;
      const webhookUrl = `${this.endpoint}/webhook/${webhookPath}`;
      
      return {
        success: true,
        webhookUrl: webhookUrl,
        webhookPath: webhookPath,
        webhookNode: webhookNode
      };
    } catch (error) {
      console.error('❌ Failed to get webhook URL:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Manual Triggerワークフロー実行メソッド
  async executeManualTriggerWorkflow(workflowId, workflowDetails) {
    try {
      console.log(`▶️  Executing Manual Trigger workflow ${workflowId}...`);
      
      // Manual Trigger実行エンドポイント
      const executionEndpoint = this.useApiKey ? 
        `/api/v1/workflows/${workflowId}/execute` :
        `/rest/workflows/${workflowId}/execute`;
      
      console.log(`🔍 Executing via endpoint: ${executionEndpoint}`);
      
      const response = await this.client.post(executionEndpoint, {
        startNodes: ['Manual Trigger'], // 最初のノードから開始
        pinData: {},
        runData: {}
      }, {
        headers: this.getHeaders(),
        timeout: 600000 // タイムアウトを10分に設定（AI処理のため）
      });
      
      console.log('✅ Manual Trigger execution successful');
      console.log('📊 Response status:', response.status);
      console.log('📊 Response data:', response.data);
      
      return {
        success: true,
        data: response.data,
        executionType: 'manual'
      };
    } catch (error) {
      console.error('❌ Failed to execute Manual Trigger workflow:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        executionType: 'manual'
      };
    }
  }

  // APIキーで詳細情報を取得する補助メソッド
  async getWorkflowDetailsWithApiKey(workflowId) {
    try {
      console.log(`🔍 Fetching workflow details with API key: ${workflowId}`);
      
      const response = await this.client.get(`/api/v1/workflows/${workflowId}`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 600000 // タイムアウトを10分に設定（AI処理のため）
      });
      
      console.log('✅ Workflow details retrieved via API v1');
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching workflow with API key: ${error.message}`);
      console.error('🔍 API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
      });
      return null;
    }
  }

  // ログアウト処理
  async logout() {
    try {
      if (this.isAuthenticated) {
        await this.client.post('/rest/logout', {}, {
          headers: this.getHeaders()
        });
        console.log('👋 Logged out successfully');
      }
    } catch (error) {
      console.log('⚠️  Logout failed (may be expected):', error.message);
    } finally {
      this.cookies = null;
      this.isAuthenticated = false;
    }
  }
}

module.exports = N8nWorkflowManager;