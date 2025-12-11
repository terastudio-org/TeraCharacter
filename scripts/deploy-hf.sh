#!/bin/bash

# TeraCharacter Hugging Face Deployment Script
# This script helps deploy TeraCharacter to Hugging Face Spaces

set -e

echo "🚀 TeraCharacter Hugging Face Deployment"
echo "========================================"

# Check if HF_TOKEN is set
if [ -z "$HF_TOKEN" ]; then
    echo "❌ Error: HF_TOKEN environment variable is not set"
    echo "Please set your Hugging Face token:"
    echo "export HF_TOKEN=your_token_here"
    exit 1
fi

# Check if required files exist
if [ ! -f "Dockerfile" ]; then
    echo "❌ Error: Dockerfile not found"
    exit 1
fi

if [ ! -f "huggingface_space.yaml" ]; then
    echo "❌ Error: huggingface_space.yaml not found"
    exit 1
fi

echo "✅ Required files found"

# Set default values
SPACE_ID=${1:-"terastudio-org/TeraCharacter"}
REPO_TYPE=${2:-"space"}

echo "📦 Preparing deployment to: $SPACE_ID"

# Login to Hugging Face Hub
echo "🔐 Logging in to Hugging Face Hub..."
huggingface-cli login --token $HF_TOKEN

# Create or update the space
echo "📤 Creating/updating Hugging Face Space..."
huggingface-cli repo create $SPACE_ID --type $REPO_TYPE --yes || echo "Space already exists, continuing..."

# Add Dockerfile to repository if not already there
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found in current directory"
    exit 1
fi

# Create .gitignore if it doesn't exist to exclude unnecessary files
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Database
*.sqlite
*.db

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/
EOF
fi

# Push to Hugging Face Hub
echo "📤 Pushing to Hugging Face Hub..."
git init
git add .
git commit -m "Deploy TeraCharacter to Hugging Face Spaces"
git branch -M main
git remote add origin https://huggingface.co/$SPACE_ID
git push -u origin main --force

echo "✅ Deployment completed successfully!"
echo ""
echo "🎉 Your TeraCharacter app is now available at:"
echo "   https://huggingface.co/$SPACE_ID"
echo ""
echo "📝 Next steps:"
echo "   1. Visit the space URL to see your app"
echo "   2. Set up your environment variables in the space settings"
echo "   3. Run 'npm run hf:setup' to initialize Hugging Face integration"
echo "   4. Run 'npm run hf:sync' to sync your database to Hugging Face"
echo ""
echo "🔧 Environment variables to set in HF Spaces:"
echo "   - HF_TOKEN: Your Hugging Face token"
echo "   - HF_DATASET_ID: Your dataset ID (default: terastudio-org/TeraCharacter-data)"
echo "   - OPENAI_API_KEY: Your OpenAI API key"
echo "   - NEXTAUTH_SECRET: A random secret for NextAuth"
echo "   - NEXTAUTH_URL: Your space URL"