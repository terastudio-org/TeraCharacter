#!/usr/bin/env node

/**
 * Hugging Face Sync Script for TeraCharacter
 * This script syncs character data between local database and Hugging Face datasets
 */

const fs = require('fs');
const path = require('path');
const { HfFile, HfFolder } = require('@huggingface/hub');

class HFSync {
  constructor() {
    this.hfToken = process.env.HF_TOKEN || process.env.NEXT_PUBLIC_HF_TOKEN;
    this.hfDatasetName = process.env.HF_DATASET_NAME || "teracharacter-database";
    
    if (!this.hfToken) {
      console.error('❌ HF_TOKEN is required. Please set it in your environment variables.');
      process.exit(1);
    }
  }

  /**
   * Initialize Hugging Face client
   */
  async initializeClient() {
    try {
      const { create } = require('@huggingface/hub');
      this.client = create({
        token: this.hfToken,
      });
      console.log('✅ Hugging Face client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Hugging Face client:', error.message);
      process.exit(1);
    }
  }

  /**
   * Sync character data to Hugging Face
   */
  async syncToHF() {
    console.log('🔄 Syncing data to Hugging Face...');
    
    try {
      // Read local database or character files
      const characters = await this.getLocalCharacters();
      
      for (const character of characters) {
        await this.uploadCharacter(character);
      }
      
      console.log(`✅ Successfully synced ${characters.length} characters to Hugging Face`);
    } catch (error) {
      console.error('❌ Error syncing to HF:', error.message);
      throw error;
    }
  }

  /**
   * Sync character data from Hugging Face
   */
  async syncFromHF() {
    console.log('🔄 Syncing data from Hugging Face...');
    
    try {
      const characters = await this.getHFCharacters();
      
      for (const character of characters) {
        await this.downloadCharacter(character);
      }
      
      console.log(`✅ Successfully synced ${characters.length} characters from Hugging Face`);
    } catch (error) {
      console.error('❌ Error syncing from HF:', error.message);
      throw error;
    }
  }

  /**
   * Upload a single character to Hugging Face
   */
  async uploadCharacter(character) {
    const fileName = `characters/${character.id}.json`;
    
    try {
      // Convert character to JSON
      const jsonData = JSON.stringify(character, null, 2);
      
      // Upload to Hugging Face
      await this.client.uploadFile({
        file: Buffer.from(jsonData),
        path: `data/${fileName}`,
        repo: {
          type: "dataset",
          id: this.hfDatasetName,
        },
      });
      
      console.log(`📤 Uploaded character: ${character.name}`);
    } catch (error) {
      console.error(`❌ Failed to upload character ${character.name}:`, error.message);
    }
  }

  /**
   * Download a single character from Hugging Face
   */
  async downloadCharacter(characterId) {
    const fileName = `characters/${characterId}.json`;
    
    try {
      const response = await this.client.downloadFile({
        path: `data/${fileName}`,
        repo: {
          type: "dataset",
          id: this.hfDatasetName,
        },
      });
      
      if (response && response.blob) {
        const text = await response.blob.text();
        const characterData = JSON.parse(text);
        
        // Save to local directory
        const outputPath = path.join('./hf_sync/characters', `${characterId}.json`);
        fs.writeFileSync(outputPath, text);
        
        console.log(`📥 Downloaded character: ${characterData.name}`);
        return characterData;
      }
    } catch (error) {
      console.error(`❌ Failed to download character ${characterId}:`, error.message);
      return null;
    }
  }

  /**
   * Get local characters (mock implementation - should connect to actual DB)
   */
  async getLocalCharacters() {
    // This should connect to your actual database
    // For now, we'll return an empty array or mock data
    const mockCharacters = [
      {
        id: "demo-character-1",
        name: "Albert Einstein",
        tagline: "Theoretical physicist and Nobel Prize winner",
        description: "I am Albert Einstein, the theoretical physicist who developed the theory of relativity. I'm passionate about science, particularly physics and mathematics, and I love discussing complex concepts in an accessible way.",
        greeting: "Hello! I'm Albert Einstein. I'm excited to discuss physics, relativity, and the wonders of the universe with you. What would you like to explore today?",
        temperature: 0.8,
        top_p: 0.9,
        createdAt: new Date().toISOString()
      }
    ];
    
    // Try to read from local character files
    try {
      const charactersDir = './hf_sync/characters';
      if (fs.existsSync(charactersDir)) {
        const files = fs.readdirSync(charactersDir);
        const characters = [];
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const content = fs.readFileSync(path.join(charactersDir, file), 'utf8');
            characters.push(JSON.parse(content));
          }
        }
        
        return characters.length > 0 ? characters : mockCharacters;
      }
    } catch (error) {
      console.warn('⚠️  Could not read local character files:', error.message);
    }
    
    return mockCharacters;
  }

  /**
   * Get characters from Hugging Face
   */
  async getHFCharacters() {
    try {
      const { files } = await this.client.listFiles({
        repo: {
          type: "dataset",
          id: this.hfDatasetName,
        },
      });
      
      const characterFiles = files.filter(file => 
        file.path.startsWith('data/characters/') && file.path.endsWith('.json')
      );
      
      return characterFiles.map(file => file.path.replace('data/characters/', '').replace('.json', ''));
    } catch (error) {
      console.error('❌ Failed to list HF files:', error.message);
      return [];
    }
  }

  /**
   * Export database to JSON
   */
  async exportDatabase() {
    console.log('📤 Exporting database to JSON...');
    
    try {
      const characters = await this.getLocalCharacters();
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        characters: characters,
        totalCount: characters.length
      };
      
      const exportPath = './hf_sync/exports/database_export.json';
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
      
      console.log(`✅ Database exported to: ${exportPath}`);
      return exportPath;
    } catch (error) {
      console.error('❌ Error exporting database:', error.message);
      throw error;
    }
  }

  /**
   * Import database from JSON
   */
  async importDatabase(exportPath) {
    console.log('📥 Importing database from JSON...');
    
    try {
      const content = fs.readFileSync(exportPath, 'utf8');
      const data = JSON.parse(content);
      
      if (!data.characters || !Array.isArray(data.characters)) {
        throw new Error('Invalid export file format');
      }
      
      // Save characters to local directory
      const charactersDir = './hf_sync/characters';
      fs.mkdirSync(charactersDir, { recursive: true });
      
      for (const character of data.characters) {
        const fileName = `${character.id}.json`;
        fs.writeFileSync(path.join(charactersDir, fileName), JSON.stringify(character, null, 2));
      }
      
      console.log(`✅ Imported ${data.characters.length} characters from: ${exportPath}`);
    } catch (error) {
      console.error('❌ Error importing database:', error.message);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const sync = new HFSync();
  await sync.initializeClient();
  
  switch (command) {
    case 'push':
    case 'sync-to':
      await sync.syncToHF();
      break;
      
    case 'pull':
    case 'sync-from':
      await sync.syncFromHF();
      break;
      
    case 'export':
      await sync.exportDatabase();
      break;
      
    case 'import':
      const importPath = args[1];
      if (!importPath) {
        console.error('❌ Import path required. Usage: npm run hf:sync import <path-to-export>');
        process.exit(1);
      }
      await sync.importDatabase(importPath);
      break;
      
    case 'status':
      console.log('📊 Hugging Face Sync Status:');
      console.log(`Token: ${sync.hfToken ? '✅ Set' : '❌ Not set'}`);
      console.log(`Dataset: ${sync.hfDatasetName}`);
      console.log(`Local sync dir: ./hf_sync/`);
      break;
      
    default:
      console.log(`
🚀 Hugging Face Sync Script for TeraCharacter

Usage:
  npm run hf:sync <command>

Commands:
  push/sync-to     - Sync local data to Hugging Face
  pull/sync-from   - Sync data from Hugging Face to local
  export           - Export database to JSON file
  import <path>    - Import database from JSON file
  status           - Show sync status

Examples:
  npm run hf:sync push
  npm run hf:sync pull
  npm run hf:sync export
  npm run hf:sync import ./hf_sync/exports/database_export.json
  npm run hf:sync status
      `);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = HFSync;