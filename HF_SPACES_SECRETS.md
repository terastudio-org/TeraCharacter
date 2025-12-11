---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3044022030103551694575e578824e4d445c4a2d0e17411744e5fca91c76c51f865bf4f6022011583517546df6679bafc825c8453340eb8d267d282128c405a46c42ebf556e0
    ReservedCode2: 3046022100c250bc32f5fab6d74e342667d7a07fdc40ffc8bde0346a317383101196e60bd6022100d6718d1c3f6d2195129b58e42e502dbb62efcf4dbf7cbb200919ab1231ed0684
---

# Hugging Face Spaces Secrets Setup

This guide explains how to configure environment variables for Hugging Face Spaces deployment, making the `.env` file optional when deploying to HF Spaces.

## Overview

TeraCharacter supports both local development (using `.env` files) and Hugging Face Spaces deployment (using Spaces secrets). This dual approach ensures flexibility for different deployment scenarios.

## Environment Variable Priority

The application checks for Hugging Face API credentials in this order:

1. **HF Spaces Secrets** (production deployment): `HUGGINGFACE_HUB_TOKEN`
2. **Local .env file** (development): `HF_API_KEY`
3. **Fallback**: Empty string (provider disabled)

## Local Development Setup

### 1. Get Hugging Face API Token

1. Go to [Hugging Face Settings > Access Tokens](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Copy the token

### 2. Configure .env.local

```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Add your HF API key
HF_API_KEY="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3. Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Hugging Face Spaces Deployment

### 1. Create Space Secrets

1. Go to your Space repository on Hugging Face
2. Navigate to **Settings** tab
3. Find **Secrets** section
4. Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `HUGGINGFACE_HUB_TOKEN` | Your HF token | API authentication |
| `GROQ_API_KEY` | Your Groq key | Groq provider (optional) |
| `OPENAI_API_KEY` | Your OpenAI key | OpenAI provider (optional) |

### 2. Required Secrets for Full Functionality

| Secret | Required | Purpose |
|--------|----------|---------|
| `HUGGINGFACE_HUB_TOKEN` | Yes | Hugging Face models access |
| `GROQ_API_KEY` | No | Ultra-fast unfiltered models |
| `OPENAI_API_KEY` | No | OpenAI GPT models |

### 3. Automatic Configuration

HF Spaces automatically provides these environment variables:
- `HF_SPACE_ID`: Your space identifier
- `HF_API_URL`: Your space URL
- `NEXT_PUBLIC_HF_SPACE`: Set to "true"

## API Token Types

### Hugging Face Hub Token (Recommended for Spaces)

- **Where to get**: [HF Settings > Access Tokens](https://huggingface.co/settings/tokens)
- **Permissions**: Read (minimum required)
- **Used for**: Model access and inference
- **Format**: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Legacy HF API Key

- **Where to get**: [HF API Settings](https://huggingface.co/settings/api)
- **Format**: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Status**: Still supported but `HUGGINGFACE_HUB_TOKEN` is preferred

## Provider Configuration

The application automatically detects the environment and uses the appropriate credentials:

```typescript
// src/lib/providers.ts
apiKey: process.env.HF_API_KEY || process.env.HUGGINGFACE_HUB_TOKEN || '';
```

## Verification

### Check Provider Status

Visit your Space URL and check the provider status endpoint:

```
GET /api/providers
```

### Test HF Provider

```bash
# Test locally
curl -X GET http://localhost:3000/api/providers/test/huggingface

# Test on HF Space
curl -X GET https://your-space-id.hf.space/api/providers/test/huggingface
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check if `HUGGINGFACE_HUB_TOKEN` is set in Space secrets
   - Verify token has "Read" permissions
   - Ensure token is not expired

2. **Model Not Found**
   - Check model name in `src/lib/provider-config.ts`
   - Verify model is available on Hugging Face Hub
   - Check if model requires special access

3. **Rate Limiting**
   - HF has rate limits for free tier
   - Consider upgrading to Pro for higher limits
   - Implement exponential backoff

### Debug Steps

1. **Check Environment Variables**
   ```bash
   # In your Space settings, verify secrets are set
   # No need to restart the Space after adding secrets
   ```

2. **Monitor Logs**
   ```bash
   # Check Space logs for errors
   # Look for "Hugging Face provider error" messages
   ```

3. **Test API Manually**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://api-inference.huggingface.co/models/microsoft/DialoGPT-small
   ```

## Security Best Practices

1. **Never commit tokens** to version control
2. **Use least privilege** - grant only "Read" permissions
3. **Rotate tokens regularly** for production use
4. **Monitor usage** in HF account dashboard
5. **Use Spaces secrets** instead of hardcoding in code

## Migration from .env to Spaces Secrets

If migrating from local development to HF Spaces:

1. Add `HUGGINGFACE_HUB_TOKEN` to Space secrets
2. Remove `HF_API_KEY` from .env (if only using Spaces)
3. Test provider availability in Space
4. Update any CI/CD scripts if needed

## Additional Resources

- [HF Spaces Documentation](https://huggingface.co/docs/spaces)
- [HF Inference API Docs](https://huggingface.co/docs/api-inference/index)
- [HF Access Tokens Guide](https://huggingface.co/docs/hub/security-tokens)
- [Environment Variables in Spaces](https://huggingface.co/docs/spaces/advanced)

---

**Note**: The `.env` file is now optional when deploying to Hugging Face Spaces. Environment variables set in Space secrets will be used automatically.