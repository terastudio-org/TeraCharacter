#!/usr/bin/env node

/**
 * Provider Testing Script
 * Tests all configured AI providers and reports their status
 */

const https = require('https');
const http = require('http');

require('dotenv').config();

class ProviderTester {
  constructor() {
    this.results = {
      openai: { available: false, error: null, responseTime: null },
      huggingface: { available: false, error: null, responseTime: null },
      groq: { available: false, error: null, responseTime: null },
      openrouter: { available: false, error: null, responseTime: null }
    };
  }

  async testOpenAI() {
    if (!process.env.OPENAI_API_KEY) {
      this.results.openai.error = 'OPENAI_API_KEY not configured';
      return;
    }

    try {
      const startTime = Date.now();
      const response = await this.makeRequest('https://api.openai.com/v1/models', {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      });
      
      if (response.statusCode === 200) {
        this.results.openai.available = true;
        this.results.openai.responseTime = Date.now() - startTime;
      } else {
        this.results.openai.error = `HTTP ${response.statusCode}`;
      }
    } catch (error) {
      this.results.openai.error = error.message;
    }
  }

  async testHuggingFace() {
    if (!process.env.HF_API_KEY) {
      this.results.huggingface.error = 'HF_API_KEY not configured';
      return;
    }

    try {
      const startTime = Date.now();
      const response = await this.makeRequest('https://api-inference.huggingface.co/models/microsoft/DialoGPT-small', {
        'Authorization': `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json'
      }, 'HEAD');
      
      if (response.statusCode === 200) {
        this.results.huggingface.available = true;
        this.results.huggingface.responseTime = Date.now() - startTime;
      } else {
        this.results.huggingface.error = `HTTP ${response.statusCode}`;
      }
    } catch (error) {
      this.results.huggingface.error = error.message;
    }
  }

  async testGroq() {
    if (!process.env.GROQ_API_KEY) {
      this.results.groq.error = 'GROQ_API_KEY not configured';
      return;
    }

    try {
      const startTime = Date.now();
      const response = await this.makeRequest('https://api.groq.com/openai/v1/models', {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      });
      
      if (response.statusCode === 200) {
        this.results.groq.available = true;
        this.results.groq.responseTime = Date.now() - startTime;
      } else {
        this.results.groq.error = `HTTP ${response.statusCode}`;
      }
    } catch (error) {
      this.results.groq.error = error.message;
    }
  }

  async testOpenRouter() {
    if (!process.env.OPENROUTER_API_KEY) {
      this.results.openrouter.error = 'OPENROUTER_API_KEY not configured';
      return;
    }

    try {
      const startTime = Date.now();
      const response = await this.makeRequest('https://openrouter.ai/api/v1/models', {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      });
      
      if (response.statusCode === 200) {
        this.results.openrouter.available = true;
        this.results.openrouter.responseTime = Date.now() - startTime;
      } else {
        this.results.openrouter.error = `HTTP ${response.statusCode}`;
      }
    } catch (error) {
      this.results.openrouter.error = error.message;
    }
  }

  makeRequest(url, headers, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: headers
      };

      const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          res.data = data;
          resolve(res);
        });
      });

      req.on('error', reject);
      
      if (body) {
        req.write(body);
      }
      
      req.end();
    });
  }

  async testAll() {
    console.log('🧪 Testing AI Providers...\n');
    
    await Promise.all([
      this.testOpenAI(),
      this.testHuggingFace(),
      this.testGroq(),
      this.testOpenRouter()
    ]);

    this.displayResults();
    return this.results;
  }

  displayResults() {
    console.log('📊 Provider Test Results:');
    console.log('='.repeat(50));
    
    Object.entries(this.results).forEach(([provider, result]) => {
      const status = result.available ? '✅' : '❌';
      const responseTime = result.responseTime ? `${result.responseTime}ms` : 'N/A';
      
      console.log(`${status} ${provider.toUpperCase()}`);
      console.log(`   Status: ${result.available ? 'Available' : 'Unavailable'}`);
      console.log(`   Response Time: ${responseTime}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });

    const availableProviders = Object.entries(this.results)
      .filter(([_, result]) => result.available)
      .map(([provider, _]) => provider);

    console.log(`🎯 Summary: ${availableProviders.length} of ${Object.keys(this.results).length} providers available`);
    
    if (availableProviders.length === 0) {
      console.log('\n⚠️  No providers available. Please check your configuration.');
      console.log('📖 See PROVIDERS.md for setup instructions.');
    } else {
      console.log(`\n✅ Ready to use with: ${availableProviders.join(', ')}`);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new ProviderTester();
  tester.testAll().catch(console.error);
}

module.exports = ProviderTester;