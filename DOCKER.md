# Docker Deployment Guide

This guide explains how to deploy TeraCharacter using Docker for both local development and Hugging Face Spaces.

## Local Development with Docker

### Prerequisites
- Docker and Docker Compose installed
- Hugging Face account (for cloud features)

### Quick Start

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd TeraCharacter
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   ```
   http://localhost:3000
   ```

### Using Docker Only

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

## Hugging Face Spaces Deployment

### Prerequisites
- Hugging Face account
- HF_TOKEN environment variable set
- Hugging Face CLI installed: `pip install huggingface_hub`

### Automated Deployment

1. **Set your HF token**
   ```bash
   export HF_TOKEN=your_hf_token_here
   ```

2. **Run the deployment script**
   ```bash
   bash scripts/deploy-hf.sh [SPACE_ID] [REPO_TYPE]
   ```
   
   Example:
   ```bash
   bash scripts/deploy-hf.sh my-username/teracharacter space
   ```

### Manual Deployment

1. **Create the space on Hugging Face**
   - Go to https://huggingface.co/spaces
   - Click "Create new Space"
   - Choose "Dockerfile" as the SDK
   - Set appropriate hardware (CPU is sufficient for this app)

2. **Prepare your repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   ```

3. **Push to Hugging Face**
   ```bash
   git remote add origin https://huggingface.co/YOUR_USERNAME/teracharacter
   git push -u origin main
   ```

### Environment Variables for HF Spaces

Set these in your space's Settings > Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `HF_TOKEN` | Your Hugging Face API token | Yes |
| `HF_DATASET_ID` | Dataset for database sync | No (default: terastudio-org/TeraCharacter-data) |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Yes |
| `NEXTAUTH_URL` | Your space URL | No |

### Database Setup

After deployment, initialize and sync your database:

1. **Initialize HF integration**
   ```bash
   npm run hf:setup
   ```

2. **Sync local database to HF**
   ```bash
   npm run hf:sync
   ```

## Docker Configuration

### Dockerfile Features
- Multi-stage build for optimization
- Production-ready configuration
- Health checks included
- Non-root user for security
- Proper file permissions

### Volumes and Persistence
- `./data` - Application data
- `./database.sqlite` - SQLite database file
- Environment variables for API keys

### Health Checks
The container includes a health check endpoint at `/api/health`:
- Returns 200 if the app is healthy
- Returns 500 if there are issues
- Used by Docker and orchestration systems

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   docker-compose down
   # Or change port in docker-compose.yml
   ```

2. **Database not persisting**
   - Ensure volume mount is correct
   - Check file permissions
   - Verify database.sqlite exists in container

3. **HF token issues**
   - Verify token is correct
   - Check token permissions
   - Ensure token is set as environment variable

4. **Build failures**
   - Check Dockerfile syntax
   - Verify all dependencies are listed in package.json
   - Clear Docker cache: `docker builder prune`

### Logs and Debugging

```bash
# View container logs
docker logs teracharacter

# Follow logs in real-time
docker logs -f teracharacter

# Access container shell
docker exec -it teracharacter sh

# Check health status
curl http://localhost:3000/api/health
```

## Production Considerations

### Security
- Use environment variables for sensitive data
- Run as non-root user (already configured)
- Regularly update base images
- Use specific tags instead of `latest`

### Performance
- Enable BuildKit for faster builds
- Use multi-stage builds (already configured)
- Optimize image size with .dockerignore
- Consider using a reverse proxy in production

### Monitoring
- Health check endpoint included
- Consider adding application metrics
- Monitor container resource usage
- Set up log aggregation

## Support

If you encounter issues:
1. Check the logs
2. Verify environment variables
3. Ensure all required services are running
4. Consult the main README.md for additional setup instructions