const axios = require('axios');

class ClaudeErrorFixer {
  constructor(apiKey, model = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async fixWorkflow(workflow, error) {
    try {
      console.log('🤖 Analyzing error with Claude...');
      
      // APIキーの検証
      if (!this.apiKey || this.apiKey === 'your-claude-api-key-here') {
        console.error('❌ Claude API key not properly configured');
        console.error('💡 Please set CLAUDE_API_KEY in config.env');
        return null;
      }
      
      const prompt = this.buildPrompt(workflow, error);
      
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: this.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60秒タイムアウト
      });

      const claudeResponse = response.data.content[0].text;
      
      // Try to extract JSON from Claude's response
      const fixedWorkflow = this.extractJsonFromResponse(claudeResponse);
      
      if (fixedWorkflow) {
        console.log('🔧 Claude provided a fixed workflow');
        return fixedWorkflow;
      } else {
        console.log('⚠️  Claude response could not be parsed as JSON');
        console.log('Claude response:', claudeResponse);
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to get Claude response:', error.response?.data || error.message);
      return null;
    }
  }

  buildPrompt(workflow, error) {
    // エラーが発生したノードのみを抽出
    const errorNode = this.findErrorNode(workflow, error);
    
    return `Fix this n8n workflow error. Return ONLY the corrected node JSON.

ERROR: ${JSON.stringify(error, null, 2)}

PROBLEMATIC NODE: ${JSON.stringify(errorNode, null, 2)}

FIXES NEEDED:
- Fix JSON syntax errors in HTTP Request nodes
- Fix expression syntax
- Ensure proper node structure
- Remove trailing commas

Return ONLY the corrected node JSON.`;
  }

  findErrorNode(workflow, error) {
    // エラーメッセージから問題のノードを特定
    const errorMessage = JSON.stringify(error).toLowerCase();
    
    // エラーが発生しそうなノードを特定
    const problematicNodes = workflow.nodes?.filter(node => {
      const nodeType = node.type?.toLowerCase() || '';
      const nodeName = node.name?.toLowerCase() || '';
      
      // HTTP Requestノード（Claude API、ChatGPT APIなど）
      if (nodeType.includes('httprequest')) return true;
      
      // Codeノード
      if (nodeType.includes('code')) return true;
      
      // エラーメッセージに含まれるノード名
      if (errorMessage.includes(nodeName)) return true;
      
      return false;
    }) || [];
    
    return problematicNodes.length > 0 ? problematicNodes[0] : workflow.nodes?.[0] || {};
  }

  extractJsonFromResponse(response) {
    try {
      // If response contains "CANNOT_FIX", return null
      if (response.includes('CANNOT_FIX')) {
        return null;
      }
      
      // Try to find JSON in the response (improved regex)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonString = jsonMatch[0];
        console.log('🔍 Extracted JSON length:', jsonString.length);
        console.log('🔍 JSON ends with:', jsonString.slice(-50));
        
        // Check if JSON is complete by counting brackets
        const openBraces = (jsonString.match(/\{/g) || []).length;
        const closeBraces = (jsonString.match(/\}/g) || []).length;
        const openBrackets = (jsonString.match(/\[/g) || []).length;
        const closeBrackets = (jsonString.match(/\]/g) || []).length;
        
        console.log('🔍 Bracket count - Braces:', openBraces, ':', closeBraces, 'Brackets:', openBrackets, ':', closeBrackets);
        
        // Try to fix incomplete JSON by adding missing brackets
        if (openBraces > closeBraces) {
          const missingBraces = openBraces - closeBraces;
          jsonString += '}'.repeat(missingBraces);
          console.log(`🔧 Added ${missingBraces} missing closing braces`);
        }
        
        if (openBrackets > closeBrackets) {
          const missingBrackets = openBrackets - closeBrackets;
          jsonString += ']'.repeat(missingBrackets);
          console.log(`🔧 Added ${missingBrackets} missing closing brackets`);
        }
        
        return JSON.parse(jsonString);
      }
      
      // If no JSON found, try parsing the entire response
      return JSON.parse(response);
    } catch (error) {
      console.error('❌ Failed to parse Claude response as JSON:', error.message);
      console.error('🔍 Response preview:', response.substring(0, 200) + '...');
      return null;
    }
  }

  async validateWorkflow(workflow) {
    try {
      console.log('🔍 Validating workflow structure...');
      
      // APIキーの検証
      if (!this.apiKey || this.apiKey === 'your-claude-api-key-here') {
        console.error('❌ Claude API key not properly configured');
        return { valid: false, reason: 'Claude API key not configured' };
      }
      
      const prompt = `Please validate this n8n workflow JSON and return "VALID" if it's correct, or "INVALID: [reason]" if there are issues:

${JSON.stringify(workflow, null, 2)}

Return only "VALID" or "INVALID: [reason]" as plain text.`;

      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: this.model,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60秒タイムアウト
      });

      const result = response.data.content[0].text.trim();
      
      if (result === 'VALID') {
        return { valid: true };
      } else {
        return { valid: false, reason: result.replace('INVALID: ', '') };
      }
    } catch (error) {
      console.error('❌ Failed to validate workflow:', error.response?.data || error.message);
      return { valid: false, reason: 'Validation failed' };
    }
  }
}

module.exports = ClaudeErrorFixer;