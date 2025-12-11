---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3046022100c0d3a3310d1920b022b947b4e7266e4c730668dc6a292dfc590794e1baeefdf5022100f527ec7ef8e9366115d71d27bc03926f95c537a752d77f774d2a52f4e3312718
    ReservedCode2: 30440220378542686dc570d227f9e3ba44966a47d4e1ac687fbc8cf3169527d0fe5c06e5022001603fb0451ef1b0e4b0b10b4aa9d0ad1cabb70e9a55abce01a750175cfeedc4
---

# Migration Guide: TeraCharacter v2.0

This guide helps you migrate from the old Cloudflare-based setup to the new Hugging Face integrated version.

## 🚀 What's Changed

### Infrastructure Changes
- **Cloudflare D1** → **SQLite + Hugging Face Sync**
- **Cloudflare R2** → **Hugging Face Datasets**
- **Cloudflare Pages** → **Hugging Face Spaces** (optional)
- **Wrangler** → **Standard Node.js tools**

### UI/UX Improvements
- Enhanced character grid with animations and modern design
- Improved character creation form with drag & drop
- Better responsive design and dark mode
- Added skeleton loaders and toast notifications
- Enhanced search and filtering capabilities

### New Features
- Hugging Face dataset integration
- Dual deployment support (local + HF Spaces)
- Advanced character behavior tuning
- Enhanced analytics and character stats
- Modern theming system

## 🔄 Migration Steps

### For Existing Users

1. **Backup Your Data**
   ```bash
   # Export your current character data
   npm run hf:sync export
   ```

2. **Update Dependencies**
   ```bash
   # Remove old Cloudflare dependencies
   npm uninstall @cloudflare/next-on-pages @cloudflare/workers-types wrangler
   
   # Install new dependencies
   npm install @huggingface/hub @huggingface/inference framer-motion sonner react-hook-form recharts
   ```

3. **Update Configuration**
   ```bash
   # Copy new environment template
   cp .env.example .env.local
   
   # Update your environment variables
   # Remove: CLOUDFLARE_D1_* variables
   # Add: HF_TOKEN, HF_DATASET_NAME
   ```

4. **Update Database**
   ```bash
   # The new SQLite database will be created automatically
   # Character data can be synced from Hugging Face if you have it
   npm run setup
   ```

5. **Sync Your Data (Optional)**
   ```bash
   # If you had data in Hugging Face, sync it back
   npm run hf:sync pull
   
   # Or import from exported file
   npm run hf:sync import ./hf_sync/exports/database_export.json
   ```

### For New Users

1. **Follow the standard setup process in README.md**

2. **Set up Hugging Face integration (recommended)**
   ```bash
   npm run hf:setup -- --create-dataset
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

## 🔧 Configuration Changes

### Old Configuration (Cloudflare)
```bash
# Cloudflare D1
DATABASE="your-d1-database"
CLOUDFLARE_D1_ACCOUNT_ID="your-account-id"
CLOUDFLARE_D1_API_TOKEN="your-api-token"

# Cloudflare R2
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
```

### New Configuration (Hugging Face)
```bash
# Database (SQLite)
DATABASE_URL="file:./database/teracharacter.db"

# Hugging Face Integration
HF_TOKEN="your-hf-token"
HF_DATASET_NAME="teracharacter-database"

# Standard NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 🏗️ Deployment Changes

### Local Development
```bash
# Old
bun run dev

# New
npm run dev
```

### Hugging Face Spaces Deployment
1. Create a new Space on Hugging Face
2. Upload your repository
3. Configure environment variables in Space settings
4. The app will auto-build and deploy

## 📊 Data Migration

### Exporting from Cloudflare D1
If you have data in Cloudflare D1 that you want to migrate:

1. **Export using Wrangler**
   ```bash
   wrangler d1 execute your-database --command "SELECT * FROM character;" --output=json > characters.json
   ```

2. **Convert to new format**
   ```bash
   # The data will be automatically converted when imported
   npm run hf:sync import characters.json
   ```

### Syncing with Hugging Face
```bash
# Push local data to HF
npm run hf:sync push

# Pull data from HF
npm run hf:sync pull

# Check sync status
npm run hf:sync status
```

## 🎨 UI Migration

### Enhanced Components
- **Character Grid**: Now includes animations, better cards, and improved search
- **Character Creation**: New tabbed interface with drag & drop
- **Dark Mode**: Automatic theme detection and switching
- **Responsive Design**: Better mobile experience

### Backward Compatibility
All existing character data and functionality is preserved. The enhanced UI works with the same data structure.

## 🚨 Breaking Changes

### Removed Features
- Cloudflare-specific deployment scripts (`pages:build`, `preview`, `deploy`)
- Wrangler CLI dependency
- Cloudflare D1/R2 integration

### API Changes
- Database connection changed from D1 to SQLite
- File storage moved from R2 to Hugging Face
- Some environment variable names changed

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors**
   ```bash
   # Ensure database directory exists
   mkdir -p database
   npm run setup
   ```

2. **Hugging Face authentication**
   ```bash
   # Verify your token
   echo $HF_TOKEN
   # Should show your token
   ```

3. **Missing dependencies**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Build errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Getting Help

- Check the [main README](README.md) for detailed setup instructions
- Review [GitHub Issues](https://github.com/terastudio-org/TeraCharacter/issues)
- Join our [Discord community](https://discord.gg/terastudio)

## 🎉 Benefits of the New Version

### Performance
- Faster local development with SQLite
- Better caching and optimization
- Reduced bundle size

### User Experience
- Modern, responsive design
- Better mobile experience
- Enhanced accessibility

### Developer Experience
- Standard Node.js tooling
- Better TypeScript support
- Improved development workflow

### Deployment
- Multiple deployment options
- Better environment management
- Easier data backup and sync

---

**Need help with migration?** Open an issue on GitHub or join our Discord community!