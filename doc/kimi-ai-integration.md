# Kimi K2.5 AI Integration - ContentHub

## Overview
Kimi AI (K2.5 model) has been connected as the **ContentHub Bundled AI Provider** for generating content from content briefs.

## Configuration

### Environment Variables
Created `.env` file in `app/` directory with the following configuration:

```env
VITE_KIMI_APP_ID=19c8dd6a-2132-8926-8000-00003738ca6d
VITE_KIMI_API_KEY=sk-kimi-zITebxbZyZvau9NM8vh9YNS36NIvBMTrBtxliTfXd2167jT2axmL5SX9aMudoNc9
VITE_KIMI_MODEL=kimi-k2.5
VITE_KIMI_API_URL=https://api.moonshot.cn/v1
```

## Service Architecture

### File: `app/src/services/kimiAi.ts`
The main AI service that provides:

#### Core Functions
1. **`generateContent(options)`** - Generate content for a single channel
2. **`generateMultiChannelContent(brief, channels, tone)`** - Generate content for multiple channels
3. **`rewriteContent(content, options)`** - Rewrite existing content with different tone/channel
4. **`checkStatus()`** - Check if Kimi AI service is available

#### Provider Interface
```typescript
export interface KimiAIProvider {
  name: string;
  model: string;
  generateContent: (options: GenerateContentOptions) => Promise<GeneratedContent>;
  generateMultiChannelContent: (brief, channels, tone) => Promise<Record<string, GeneratedContent>>;
  rewriteContent: (content, options) => Promise<GeneratedContent>;
  checkStatus: () => Promise<{ available: boolean; message: string }>;
}
```

## Integration Points

### 1. Content Studio Page (`app/src/pages/ContentStudioPage.tsx`)
- Full integration with Kimi AI for content generation
- Supports multiple channels: LinkedIn, Twitter/X, Facebook, Instagram, Thread
- Language selection: English, Traditional Chinese (HK), Simplified Chinese
- Tone controls: Formality and enthusiasm sliders
- Real-time character count validation per channel
- Copy and rewrite functionality for generated content

### 2. Brief Page (`app/src/pages/BriefPage.tsx`)
- Convert research ideas to content briefs
- Generate content directly from briefs
- Session storage for passing generated content to Content Studio

### 3. Mock Mode
For development/testing without API calls, set:
```typescript
const USE_MOCK_MODE = false;  // In ContentStudioPage.tsx and BriefPage.tsx
```

When mock mode is enabled:
- No actual API calls are made
- Simulated generation delay (1.5s)
- Mock content generated for each selected channel

## Usage Example

### Generate Content from Brief
```typescript
import { kimiAIProvider } from '@/services/kimiAi';

const brief: ContentBrief = {
  title: 'AI Ethics in Healthcare',
  objective: 'Educate professionals about AI ethics',
  targetAudience: 'Healthcare professionals',
  keyMessages: ['Privacy matters', 'Transparency is key'],
  callToAction: 'Share your thoughts',
  keywords: ['AI', 'ethics', 'healthcare']
};

// Generate for single channel
const result = await kimiAIProvider.generateContent({
  brief,
  tone: 'professional',
  channel: 'linkedin',
  language: 'en'
});

// Generate for multiple channels
const results = await kimiAIProvider.generateMultiChannelContent(
  brief,
  ['linkedin', 'twitter', 'facebook'],
  'professional'
);
```

### Rewrite Content
```typescript
const rewritten = await kimiAIProvider.rewriteContent(
  existingContent,
  {
    tone: 'casual',
    channel: 'twitter',
    language: 'en'
  }
);
```

## AI Agent Configuration

Updated `mockData.ts` to include Kimi K2.5 as the primary AI agent:

```typescript
{
  id: 'agent1',
  name: 'ContentHub AI',
  type: 'writing',
  provider: 'Kimi AI',
  model: 'kimi-k2.5',
  status: 'active',
  config: { temperature: 1, maxTokens: 4000 },
  description: 'ContentHub Bundled AI Provider for content generation'
}
```

## API Model Details

- **Model**: `kimi-k2.5`
- **API Endpoint**: `https://api.moonshot.cn/v1/chat/completions`
- **Authentication**: Bearer token with API Key
- **Custom Header**: `X-App-ID` for application identification

## Features

### Content Generation
- Multi-channel content generation from single brief
- Platform-optimized formatting (character limits, hashtags)
- Language support (English, Chinese variants)
- Tone customization (formality, enthusiasm)

### Content Management
- Generated content stored with metadata
- Token usage tracking
- Copy to clipboard functionality
- One-click rewrite/regenerate

### Error Handling
- Graceful fallbacks for API failures
- User-friendly error messages via toast notifications
- Status checking before operations

## Switching to Real API

To use the real Kimi AI API instead of mock mode:

1. Set `USE_MOCK_MODE = false` in:
   - `ContentStudioPage.tsx`
   - `BriefPage.tsx`

2. Ensure environment variables are properly loaded

3. Verify API key has sufficient quota

## Future Enhancements

1. **Streaming responses** for real-time content generation
2. **Content templates** for common formats
3. **A/B testing** different content variations
4. **Performance analytics** for generated content
5. **Custom fine-tuning** for brand voice
