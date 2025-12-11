#!/usr/bin/env python3
"""
Hugging Face Setup Script for TeraCharacter
This script helps set up the Hugging Face integration for character data storage.
"""

import os
import json
import argparse
from pathlib import Path

def create_hf_setup_config():
    """Create the configuration file for HF setup"""
    
    config = {
        "hf_token": os.getenv("HF_TOKEN", ""),
        "hf_dataset_name": os.getenv("HF_DATASET_NAME", "teracharacter-database"),
        "hf_repo_type": "dataset",
        "setup_completed": False,
        "database_path": "./database/teracharacter.db"
    }
    
    config_path = Path("./hf_config.json")
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Created HF configuration file: {config_path}")
    return config

def create_huggingface_dataset():
    """Create the dataset structure on Hugging Face"""
    try:
        from huggingface_hub import HfApi
        
        api = HfApi()
        token = os.getenv("HF_TOKEN")
        
        if not token:
            print("❌ HF_TOKEN not found in environment variables")
            return False
            
        # Login to Hugging Face
        api.login(token=token)
        
        # Create dataset repository
        dataset_name = os.getenv("HF_DATASET_NAME", "teracharacter-database")
        
        repo_id = f"terastudio/{dataset_name}"
        
        # Create the dataset
        api.create_repo(
            repo_id=repo_id,
            repo_type="dataset",
            exist_ok=True
        )
        
        print(f"✅ Created dataset: {repo_id}")
        
        # Update config
        config_path = Path("./hf_config.json")
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = json.load(f)
            config["setup_completed"] = True
            config["repo_id"] = repo_id
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
        
        return True
        
    except ImportError:
        print("❌ huggingface_hub not installed. Run: pip install huggingface_hub")
        return False
    except Exception as e:
        print(f"❌ Error creating dataset: {e}")
        return False

def setup_hf_directories():
    """Create local directory structure for HF sync"""
    
    directories = [
        "./database",
        "./hf_sync/characters",
        "./hf_sync/avatars",
        "./hf_sync/exports"
    ]
    
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {dir_path}")
    
    # Create README for the dataset
    readme_content = """# TeraCharacter Database

This dataset contains character data from the TeraCharacter application.

## Structure

- `data/characters/`: JSON files containing character information
- `data/avatars/`: Character avatar images
- `data/exports/`: Database exports and backups

## Usage

This dataset is automatically synced with the TeraCharacter application and can be used for:
- Character data backup and restore
- Data analysis and insights
- Character sharing and discovery

## License

This dataset is maintained by TeraStudio.
"""
    
    readme_path = Path("./hf_sync/README.md")
    with open(readme_path, 'w') as f:
        f.write(readme_content)
    
    print(f"✅ Created README: {readme_path}")

def main():
    parser = argparse.ArgumentParser(description="Setup Hugging Face integration for TeraCharacter")
    parser.add_argument("--create-dataset", action="store_true", help="Create the dataset on Hugging Face")
    parser.add_argument("--config-only", action="store_true", help="Only create configuration files")
    
    args = parser.parse_args()
    
    print("🚀 Setting up Hugging Face integration for TeraCharacter...\n")
    
    # Create configuration
    config = create_hf_setup_config()
    
    # Setup directories
    setup_hf_directories()
    
    if not args.config_only and args.create_dataset:
        print("\n📡 Creating Hugging Face dataset...")
        success = create_huggingface_dataset()
        
        if success:
            print("\n🎉 Hugging Face setup completed successfully!")
            print("\nNext steps:")
            print("1. Set your HF_TOKEN environment variable")
            print("2. Run 'npm run hf:sync' to sync your data")
            print("3. Configure your Next.js app to use HF storage")
        else:
            print("\n⚠️  Dataset creation failed. Please check your HF_TOKEN and try again.")
    else:
        print("\n✅ Configuration setup completed!")
        print("\nTo complete setup:")
        print("1. Set your HF_TOKEN environment variable")
        print("2. Run with --create-dataset to create the dataset")
        print("3. Run 'npm run hf:sync' to sync your data")

if __name__ == "__main__":
    main()