#!/usr/bin/env node

const axios = require('axios');

async function debugN8nAPI() {
  try {
    console.log('🔍 n8n API詳細調査開始');
    
    // 1. 基本的なAPIリクエスト
    console.log('\n1. 基本APIリクエスト（limit=100, offset=0）');
    const response1 = await axios.get('https://api.n8n.io/templates/search', {
      params: {
        offset: 0,
        limit: 100
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    console.log('ステータス:', response1.status);
    console.log('総ワークフロー数:', response1.data.totalWorkflows);
    console.log('取得ワークフロー数:', response1.data.workflows?.length || 0);
    console.log('フィルター情報:', response1.data.filters ? 'あり' : 'なし');
    
    // 2. パラメータなしのリクエスト
    console.log('\n2. パラメータなしのリクエスト');
    const response2 = await axios.get('https://api.n8n.io/templates/search', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    console.log('ステータス:', response2.status);
    console.log('総ワークフロー数:', response2.data.totalWorkflows);
    console.log('取得ワークフロー数:', response2.data.workflows?.length || 0);
    
    // 3. 異なるoffsetでテスト
    console.log('\n3. offset=10のテスト');
    const response3 = await axios.get('https://api.n8n.io/templates/search', {
      params: {
        offset: 10,
        limit: 50
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    console.log('ステータス:', response3.status);
    console.log('総ワークフロー数:', response3.data.totalWorkflows);
    console.log('取得ワークフロー数:', response3.data.workflows?.length || 0);
    
    // 4. 代替APIエンドポイントのテスト
    console.log('\n4. 代替エンドポイントのテスト');
    const alternativeUrls = [
      'https://n8n.io/api/templates/search',
      'https://api.n8n.io/api/templates/search',
      'https://n8n.io/api/workflows',
      'https://api.n8n.io/workflows'
    ];
    
    for (const url of alternativeUrls) {
      try {
        console.log(`\nテスト中: ${url}`);
        const altResponse = await axios.get(url, {
          params: {
            offset: 0,
            limit: 100
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000
        });
        
        console.log(`✅ ${url}:`);
        console.log('- ステータス:', altResponse.status);
        console.log('- データキー:', Object.keys(altResponse.data));
        console.log('- 総件数:', altResponse.data.totalWorkflows || altResponse.data.total || 'N/A');
        console.log('- 取得件数:', altResponse.data.workflows?.length || altResponse.data.data?.length || 0);
        
      } catch (error) {
        console.log(`❌ ${url}: ${error.message}`);
      }
    }
    
    // 5. レスポンス構造の詳細分析
    console.log('\n5. レスポンス構造の詳細分析');
    console.log('基本APIレスポンス構造:');
    console.log('- totalWorkflows:', response1.data.totalWorkflows);
    console.log('- workflows配列長:', response1.data.workflows?.length);
    console.log('- フィルター:', response1.data.filters?.length || 0);
    
    if (response1.data.workflows && response1.data.workflows.length > 0) {
      const firstWorkflow = response1.data.workflows[0];
      console.log('\n最初のワークフローの構造:');
      console.log('- キー:', Object.keys(firstWorkflow));
      console.log('- ID:', firstWorkflow.id);
      console.log('- Name:', firstWorkflow.name);
      console.log('- Description長:', firstWorkflow.description?.length || 0);
      console.log('- Nodes数:', firstWorkflow.nodes?.length || 0);
    }
    
    // 6. 500件取得の可能性チェック
    console.log('\n6. 大量データ取得の可能性');
    const totalAvailable = response1.data.totalWorkflows;
    console.log(`利用可能な総ワークフロー数: ${totalAvailable}`);
    
    if (totalAvailable >= 500) {
      console.log('✅ 500件取得は理論的に可能');
      console.log('推奨アプローチ: 複数のAPIリクエストに分割');
    } else {
      console.log(`⚠️ 利用可能数が500件未満です（${totalAvailable}件）`);
    }
    
  } catch (error) {
    console.error('❌ API調査エラー:', error.message);
    console.error('詳細:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
  }
}

// 実行
debugN8nAPI(); 