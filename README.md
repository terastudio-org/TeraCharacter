---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30450221008d8d29b90ab61bcfdedb4bb46624fe2f14d76c465d4b4df9e968a9f8b166ecb3022019e66166dd6d3d7c7dd217d9486567ee5cfe93e854e3525a1b383dad0cf5dd6c
    ReservedCode2: 304502201391cee23ed3fd2f1a455d65b6825c90638bca02bcab42ca8a50c7badbe75581022100cdfdf7851c3490c8e7925262549f3b7e30cf74b43bfee14f0370d0743c46e5a7
---

# 🚀 TeraCharacter: Enhanced AI Character Platform

<div align="center">

![TeraCharacter Logo](https://img.shields.io/badge/TeraCharacter-FF6B6B?style=for-the-badge&logo=robot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFAE00?style=for-the-badge&logo=huggingface&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Create and chat with AI characters. A modern platform with enhanced GUI, Hugging Face integration, and dual deployment support.**

[🚀 Live Demo](https://your-space.hf.space) • [📖 Documentation](#documentation) • [🎨 Features](#features) • [🛠️ Setup](#setup)

</div>

## ✨ What's New in This Version

### 🎨 Enhanced GUI & User Experience
- **Modern Design**: Beautiful gradient backgrounds, glassmorphism effects, and smooth animations
- **Interactive Components**: Drag & drop avatar upload, real-time previews, and dynamic form controls
- **Responsive Layout**: Optimized for all screen sizes with mobile-first design
- **Dark Mode Support**: Full theme switching with system preference detection
- **Advanced UI Components**: Skeleton loaders, toast notifications, and interactive badges
- **Performance Optimized**: Lazy loading, optimized images, and smooth transitions

### 🗄️ Hugging Face Integration (Replacing Cloudflare)
- **Seamless Data Sync**: Bidirectional sync between local database and HF datasets
- **Cloud Storage**: Avatar images and character data stored on Hugging Face
- **Dataset Management**: Automatic backup and restore functionality
- **API Integration**: Full HF Hub API support for enhanced features

### 🤖 Multi-Provider AI Support (Unfiltered Content)
- **Multiple Providers**: OpenAI, Hugging Face Inference API, Groq, OpenRouter, Local (Ollama)
- **Unfiltered Content**: Access to uncensored models for adult-oriented and creative content
- **Ultra-Fast Inference**: Groq integration for real-time conversations
- **Local Deployment**: Self-hosted options with Ollama for complete privacy
- **Provider Management**: Built-in provider selector with connection testing
- **Model Flexibility**: Switch between 20+ AI models across different providers

### 🚀 Dual Deployment Support
- **Local Development**: Full-featured local development environment
- **Hugging Face Spaces**: One-click deployment to HF Spaces
- **Environment Flexibility**: Different configurations for different deployment targets
- **Database Migration**: Easy transition between local and cloud storage

## The stack includes:

- [Next.js 14](https://nextjs.org/) for frontend with App Router
- [TailwindCSS](https://tailwindcss.com/) for styling with custom design system
- [Drizzle ORM](https://orm.drizzle.team/) for database access
- [NextAuth](https://next-auth.js.org/) for authentication
- [Hugging Face Hub](https://huggingface.co/docs/hub/index) for cloud storage and sync
- [Hugging Face Spaces](https://huggingface.co/spaces) for hosting
- [Radix UI](https://www.radix-ui.com/) as the component library
- [Framer Motion](https://www.framer.com/motion/) for animations

## Getting Started

### Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/terastudio-org/TeraCharacter.git
   cd TeraCharacter
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   
   # For local development, add your HF API key:
   # HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   # Note: When deploying to HF Spaces, use Spaces secrets instead
   ```

3. **Database Setup**
   ```bash
   npm run setup
   ```

4. **Hugging Face Integration (Optional)**
   ```bash
   npm run hf:setup -- --create-dataset
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Docker Deployment

#### Local Development with Docker

1. **Quick Start with Docker Compose**
   ```bash
   git clone https://github.com/terastudio-org/TeraCharacter.git
   cd TeraCharacter
   
   # Configure environment
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start with Docker Compose
   docker-compose up -d
   ```

2. **Using Docker Only**
   ```bash
   # Build the image
   docker build -t teracharacter .
   
   # Run the container
   docker run -p 3000:3000 \
     -e HF_TOKEN=your_token \
     -e OPENAI_API_KEY=your_key \
     -e NEXTAUTH_SECRET=your_secret \
     -v $(pwd)/data:/app/data \
     -v $(pwd)/database.sqlite:/app/database.sqlite \
     teracharacter
   ```

3. **Access the Application**
   ```
   http://localhost:3000
   ```

#### Deploy to Hugging Face Spaces with Docker

1. **Automated Deployment**
   ```bash
   # Set your HF token
   export HF_TOKEN=your_hf_token_here
   
   # Deploy using the script
   bash scripts/deploy-hf.sh your-username/teracharacter space
   ```

2. **Manual Docker Deployment**
   - Create a new Space on Hugging Face with "Dockerfile" as SDK
   - The included `Dockerfile` and `huggingface_space.yaml` will handle the build
   - Configure environment variables in Space settings

3. **Required Environment Variables for HF Spaces**
   ```
   HF_TOKEN=your_hf_token
   HF_DATASET_ID=terastudio-org/TeraCharacter-data
   OPENAI_API_KEY=your_openai_key
   NEXTAUTH_SECRET=your_random_secret
   NEXTAUTH_URL=https://your-space.hf.space
   ```

For detailed Docker documentation, see [DOCKER.md](DOCKER.md).

### Hugging Face Spaces Deployment

> **💡 New**: Supports Hugging Face Spaces secrets - `.env` file is now optional!

1. **Create a New Space**
   - Go to [Hugging Face Spaces](https://huggingface.co/spaces)
   - Click "Create new Space"
   - Upload this repository

2. **Configure Environment Variables**
   - **Option A: Use Spaces Secrets (Recommended)**
     - Go to Space Settings → Secrets
     - Add `HUGGINGFACE_HUB_TOKEN` with your HF token
     - Add other provider keys as needed (optional)
   - **Option B: Use .env file**
     - Add `HF_API_KEY` to your .env.local file
     - This works for local development

3. **Deploy**
   - The space will automatically build and deploy
   - Your app will be available at `https://your-space-name.hf.space`

4. **Required Environment Variables for HF Spaces**
   ```
   HUGGINGFACE_HUB_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Required
   GROQ_API_KEY=your_groq_key                                   # Optional
   OPENAI_API_KEY=your_openai_key                              # Optional
   ```

📖 **Detailed Guide**: See [HF_SPACES_SECRETS.md](HF_SPACES_SECRETS.md) for complete setup instructions

## 🎯 Features

### Core Functionality
- 🤖 **AI Character Creation**: Build custom AI personalities with detailed descriptions
- 💬 **Interactive Chat**: Real-time conversations with your created characters
- 🎨 **Avatar Management**: Upload and manage character images with drag & drop
- ⚙️ **Advanced Settings**: Fine-tune AI behavior with temperature, top-p, and other parameters
- 📊 **Analytics**: Track character popularity and interaction counts
- 🔍 **Smart Search**: Find characters by name, tags, or characteristics

### Technical Features
- 🌐 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🌙 **Dark Mode**: Beautiful light and dark themes
- 📱 **PWA Ready**: Progressive web app capabilities
- 🔒 **Secure Authentication**: GitHub OAuth integration
- 💾 **Data Persistence**: Reliable database storage with automatic backups
- 🔄 **Real-time Sync**: Instant updates across all clients

### Deployment Features
- 🏠 **Local Development**: Full development environment with hot reload
- ☁️ **Cloud Deployment**: One-click deployment to Hugging Face Spaces
- 📦 **Database Migration**: Seamless data transfer between environments
- 🔧 **Environment Management**: Flexible configuration for different deployment targets

## 📚 Documentation

- [🚀 Docker Deployment Guide](DOCKER.md) - Comprehensive guide for Docker deployment
- [🤖 AI Provider Setup Guide](PROVIDERS.md) - Configure OpenAI, Hugging Face, Groq, and more
- [🔧 Hugging Face Spaces Secrets](HF_SPACES_SECRETS.md) - Setup environment variables for HF Spaces (`.env` optional)
- [🔄 Migration Guide](MIGRATION.md) - Guide for migrating from Cloudflare to Hugging Face
- [📋 Update Summary](UPDATE_SUMMARY.md) - Detailed list of all changes and improvements
- [⚡ Quick Setup](scripts/setup.ts) - Automated setup script for new installations

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Hugging Face Integration
npm run hf:setup     # Initialize Hugging Face integration
npm run hf:sync      # Sync database to/from Hugging Face

# Docker
docker-compose up -d # Start with Docker Compose
docker-compose down  # Stop Docker Compose
bash scripts/deploy-hf.sh # Deploy to HF Spaces

# Database
npm run setup        # Initialize database

# Hugging Face
npm run hf:setup     # Setup HF integration
npm run hf:sync      # Sync data with HF
npm run hf:sync push # Push to HF
npm run hf:sync pull # Pull from HF
```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | No | `file:./database/teracharacter.db` |
| `HF_TOKEN` | Hugging Face API token | Yes (for HF features) | - |
| `HF_DATASET_NAME` | Name of HF dataset | No | `teracharacter-database` |
| `NEXTAUTH_SECRET` | Secret for authentication | Yes | - |
| `NEXTAUTH_URL` | Base URL of deployment | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | Yes (for AI responses) | - |

## 🎨 Customization

### Themes
The application supports custom themes through Tailwind CSS. Modify `tailwind.config.ts` to customize colors, fonts, and spacing.

### Components
All UI components are built with Radix UI and can be customized. Key components:
- `CharacterCard` - Character display cards
- `CreateCharacterForm` - Character creation form
- `ChatInterface` - Chat interaction component
- `ThemeProvider` - Theme management

### AI Behavior
Fine-tune character responses by adjusting these parameters:
- **Temperature**: Controls creativity (0.0 - 2.0)
- **Top P**: Nucleus sampling (0.0 - 1.0)
- **Top K**: Token selection limit (0 - 100)
- **Frequency Penalty**: Reduces repetition (-2.0 - 2.0)
- **Presence Penalty**: Encourages new topics (-2.0 - 2.0)

## 📁 Project Structure

```
TeraCharacter/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   └── ...          # Feature components
│   ├── lib/             # Utilities and configurations
│   │   ├── hf_storage.ts    # Hugging Face integration
│   │   └── utils.ts     # General utilities
│   ├── server/          # Server-side code
│   │   ├── auth.ts      # Authentication
│   │   └── db/          # Database schema and config
│   └── hooks/           # Custom React hooks
├── scripts/             # Build and deployment scripts
│   ├── hf_setup.py      # Hugging Face setup
│   └── hf_sync.js       # Data synchronization
├── database/            # Local SQLite database
├── hf_sync/             # Hugging Face sync directory
└── ...
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write descriptive commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Hugging Face** - For the excellent ML infrastructure
- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework
- **OpenAI** - For powerful language models

## 📞 Support

- 📧 Email: support@terastudio.org
- 💬 Discord: [Join our community](https://discord.gg/terastudio)
- 🐛 Issues: [GitHub Issues](https://github.com/terastudio-org/TeraCharacter/issues)

---

<div align="center">

**Made with ❤️ by the TeraStudio Team**

[⬆ Back to Top](#teracharacter---enhanced-ai-character-platform)

</div>

