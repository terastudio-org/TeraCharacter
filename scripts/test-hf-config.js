#!/usr/bin/env node

/**
 * Hugging Face Provider Test Script
 * 
 * This script tests the Hugging Face provider configuration
 * to verify that environment variables are set correctly
 * for both local development (.env) and HF Spaces (secrets).
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking Environment Variables...', 'bright');
  
  // Check for HF API key (local development)
  const hfApiKey = process.env.HF_API_KEY;
  const hfHubToken = process.env.HUGGINGFACE_HUB_TOKEN;
  const isHfSpaces = process.env.NEXT_PUBLIC_HF_SPACE === 'true';
  
  log('\n📋 Environment Analysis:', 'cyan');
  log(`   HF_API_KEY: ${hfApiKey ? '✅ Set' : '❌ Not set'}`, hfApiKey ? 'green' : 'red');
  log(`   HUGGINGFACE_HUB_TOKEN: ${hfHubToken ? '✅ Set' : '❌ Not set'}`, hfHubToken ? 'green' : 'red');
  log(`   HF Spaces Mode: ${isHfSpaces ? '✅ Yes' : '❌ No'}`, isHfSpaces ? 'green' : 'yellow');
  
  return {
    hfApiKey: !!hfApiKey,
    hfHubToken: !!hfHubToken,
    isHfSpaces
  };
}

function checkEnvFile() {
  log('\n📄 Checking .env files...', 'bright');
  
  const envFiles = ['.env', '.env.local', '.env.development'];
  const foundFiles = [];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      foundFiles.push(file);
      log(`   ✅ Found: ${file}`, 'green');
    } else {
      log(`   ❌ Missing: ${file}`, 'red');
    }
  });
  
  return foundFiles;
}

async function testHfApiConnection() {
  log('\n🌐 Testing Hugging Face API Connection...', 'bright');
  
  const hfApiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_HUB_TOKEN;
  
  if (!hfApiKey) {
    log('   ❌ No HF API key found. Cannot test connection.', 'red');
    return false;
  }
  
  try {
    // Test with a simple model
    const testModel = 'microsoft/DialoGPT-small';
    const response = await fetch(`https://api-inference.huggingface.co/models/${testModel}`, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
      }
    });
    
    if (response.ok) {
      log(`   ✅ Successfully connected to HF API`, 'green');
      log(`   ✅ Model ${testModel} is accessible`, 'green');
      return true;
    } else {
      log(`   ❌ API request failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`   ❌ Connection error: ${error.message}`, 'red');
    return false;
  }
}

function generateRecommendations(envStatus, foundEnvFiles) {
  log('\n💡 Recommendations:', 'bright');
  
  if (envStatus.hfHubToken) {
    log('   ✅ HF Spaces secrets are properly configured', 'green');
    log('   ℹ️  Your app will use HUGGINGFACE_HUB_TOKEN from Space secrets', 'cyan');
  } else if (envStatus.hfApiKey) {
    log('   ✅ Local development API key is set', 'green');
    log('   ℹ️  Your app will use HF_API_KEY from .env file', 'cyan');
  } else {
    log('   ❌ No Hugging Face API credentials found', 'red');
    log('   💡 Set either HF_API_KEY (.env) or HUGGINGFACE_HUB_TOKEN (HF Spaces)', 'yellow');
  }
  
  if (!envStatus.isHfSpaces && foundEnvFiles.length === 0) {
    log('   💡 For local development, copy .env.example to .env.local', 'yellow');
  }
  
  if (envStatus.isHfSpaces && !envStatus.hfHubToken) {
    log('   ⚠️  HF Spaces detected but no HUGGINGFACE_HUB_TOKEN found', 'yellow');
    log('   💡 Add HUGGINGFACE_HUB_TOKEN to your Space secrets', 'yellow');
  }
}

async function main() {
  log('🚀 TeraCharacter HF Provider Test', 'bright');
  log('================================\n');
  
  // Check environment variables
  const envStatus = checkEnvironmentVariables();
  
  // Check .env files
  const foundEnvFiles = checkEnvFile();
  
  // Test API connection (if possible)
  const apiWorking = await testHfApiConnection();
  
  // Generate recommendations
  generateRecommendations(envStatus, foundEnvFiles);
  
  // Final status
  log('\n📊 Final Status:', 'bright');
  const hasCredentials = envStatus.hfApiKey || envStatus.hfHubToken;
  const status = hasCredentials ? (apiWorking ? '✅ Ready' : '⚠️  Configured but connection failed') : '❌ Not configured';
  
  log(`   Hugging Face Provider: ${status}`, hasCredentials ? 'green' : 'red');
  
  if (hasCredentials && apiWorking) {
    log('\n🎉 Your Hugging Face provider is ready to use!', 'bright');
  } else if (hasCredentials) {
    log('\n⚠️  Provider is configured but connection test failed. Check your API key.', 'yellow');
  } else {
    log('\n❌ Provider is not configured. Set up your API credentials first.', 'red');
  }
  
  log('\n📚 For detailed setup instructions, see:', 'cyan');
  log('   - HF_SPACES_SECRETS.md', 'cyan');
  log('   - .env.example', 'cyan');
}

// Run the test
main().catch(error => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});