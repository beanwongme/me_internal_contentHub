import type { ContentBrief } from '@/types';
import conversationService from './conversationService';
import type { Conversation, Message } from './conversationService';

// Kimi AI Configuration from environment variables
const KIMI_API_URL = import.meta.env.VITE_KIMI_API_URL || 'https://api.moonshot.cn/v1';
const KIMI_APP_ID = import.meta.env.VITE_KIMI_APP_ID || '';
const KIMI_API_KEY = import.meta.env.VITE_KIMI_API_KEY || '';
const KIMI_MODEL = import.meta.env.VITE_KIMI_MODEL || 'kimi-k2.5';

// Debug logging
console.log('[Kimi AI] Configuration loaded:');
console.log('[Kimi AI] API URL:', KIMI_API_URL);
console.log('[Kimi AI] Model:', KIMI_MODEL);
console.log('[Kimi AI] App ID exists:', !!KIMI_APP_ID);
console.log('[Kimi AI] API Key exists:', !!KIMI_API_KEY);

interface KimiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface KimiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: KimiMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GenerateContentOptions {
  brief: ContentBrief;
  tone?: string;
  language?: string;
  channel?: string;
  maxTokens?: number;
  temperature?: number;
  streaming?: boolean;
  onStream?: (chunk: string) => void;
}

export interface ConversationOptions {
  brief: ContentBrief;
  channel?: string;
  tone?: string;
  language?: string;
  maxTokens?: number;
}

export interface ConversationResponse {
  conversationId: string;
  message: Message;
  content: string;
  title?: string;
  hashtags?: string[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ContinueConversationOptions {
  conversationId: string;
  userMessage: string;
  maxTokens?: number;
}

export interface GeneratedContent {
  content: string;
  title?: string;
  hashtags?: string[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface KimiAIProvider {
  name: string;
  model: string;
  generateContent: (options: GenerateContentOptions) => Promise<GeneratedContent>;
  generateMultiChannelContent: (brief: ContentBrief, channels: string[], tone?: string) => Promise<Record<string, GeneratedContent>>;
  rewriteContent: (content: string, options: { tone?: string; channel?: string; language?: string }) => Promise<GeneratedContent>;
  checkStatus: () => Promise<{ available: boolean; message: string; error?: string; details?: unknown }>;
  
  // New conversation methods
  startConversation: (options: ConversationOptions) => Promise<ConversationResponse>;
  continueConversation: (options: ContinueConversationOptions) => Promise<ConversationResponse>;
  getConversation: (id: string) => Conversation | undefined;
  getConversationMessages: (id: string) => Message[];
}

/**
 * Parse AI response to extract title, content, and hashtags
 */
function parseAIResponse(generatedText: string): { content: string; title?: string; hashtags?: string[] } {
  console.log('[parseAIResponse] Input text length:', generatedText.length);
  console.log('[parseAIResponse] Input preview:', generatedText.substring(0, 200));
  
  const titleMatch = generatedText.match(/TITLE:\s*(.+?)(?=\n|$)/i);
  const contentMatch = generatedText.match(/CONTENT:\s*([\s\S]+?)(?=HASHTAGS:|$)/i);
  const hashtagsMatch = generatedText.match(/HASHTAGS:\s*(.+?)(?=\n|$)/i);

  console.log('[parseAIResponse] Title match:', titleMatch ? 'found' : 'not found');
  console.log('[parseAIResponse] Content match:', contentMatch ? 'found' : 'not found');
  console.log('[parseAIResponse] Hashtags match:', hashtagsMatch ? 'found' : 'not found');

  const title = titleMatch ? titleMatch[1].trim() : undefined;
  const content = contentMatch ? contentMatch[1].trim() : generatedText;
  const hashtags = hashtagsMatch 
    ? hashtagsMatch[1].trim().split(/\s+/).filter(h => h.startsWith('#'))
    : undefined;

  console.log('[parseAIResponse] Output content length:', content.length);
  console.log('[parseAIResponse] Output title:', title);
  
  return { content, title, hashtags };
}

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with retry logic for rate limiting (429)
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    
    // If successful, return immediately
    if (response.ok) {
      return response;
    }
    
    // If rate limited and we have retries left, wait and retry
    if (response.status === 429 && attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.log(`[Kimi AI] Rate limited (429), waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}...`);
      await sleep(delay);
      continue;
    }
    
    // For other errors or if no retries left, return the response
    return response;
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Generate content with streaming support
 */
async function generateContentStream(
  requestBody: object,
  onStream: (chunk: string) => void
): Promise<GeneratedContent> {
  const response = await fetchWithRetry(`${KIMI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`,
      'X-App-ID': KIMI_APP_ID
    },
    body: JSON.stringify(requestBody)
  }, 3); // 3 retries with exponential backoff

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('API request failed: 429 (Too Many Requests). Please wait a minute and try again.');
    }
    throw new Error(`API request failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body available for streaming');
  }

  let fullText = '';
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              onStream(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  const { content, title, hashtags } = parseAIResponse(fullText);

  return {
    content,
    title,
    hashtags,
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    }
  };
}

/**
 * ContentHub Bundled AI Provider - Kimi K2.5
 * 
 * This service provides AI-powered content generation using Kimi K2.5 model.
 * It's the default/bundled AI provider for ContentHub.
 * 
 * IMPORTANT: Due to CORS restrictions, this service requires a backend proxy
 * when running in the browser. For development, use mock mode.
 */
export const kimiAIProvider: KimiAIProvider = {
  name: 'Kimi AI',
  model: KIMI_MODEL,

  /**
   * Start a new conversation session for iterative content generation
   */
  async startConversation(options: ConversationOptions): Promise<ConversationResponse> {
    const { brief, channel = 'general', tone = 'professional', language = 'en', maxTokens = 2000 } = options;

    if (!KIMI_API_KEY) {
      throw new Error('Kimi API key is not configured. Please check your .env file.');
    }

    // Create a new conversation
    const conversation = conversationService.createConversation({
      brief,
      channel,
      tone,
      language
    });

    // Build the initial user prompt
    const userPrompt = `Create content based on the following brief:

Title: ${brief.title}
Objective: ${brief.objective}
Target Audience: ${brief.targetAudience}
Key Messages: ${brief.keyMessages.join(', ')}
${brief.callToAction ? `Call to Action: ${brief.callToAction}` : ''}
${brief.keywords && brief.keywords.length > 0 ? `Keywords to include: ${brief.keywords.join(', ')}` : ''}
${brief.length ? `Length: ${brief.length}` : ''}

Please provide:
1. A compelling title
2. The main content body (optimized for ${channel})
3. Relevant hashtags (if applicable for the platform)

Format your response as:
TITLE: [title]
CONTENT: [content]
HASHTAGS: [hashtags]`;

    // Add user message to conversation
    conversationService.addMessage({
      conversationId: conversation.id,
      role: 'user',
      content: userPrompt
    });

    // Get all messages for API call
    const messages = conversationService.getAllMessages(conversation.id);

    const requestBody = {
      model: KIMI_MODEL,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature: 1
    };

    console.log('[Kimi AI] Starting conversation:', conversation.id);

    try {
      const startTime = Date.now();
      
      const response = await fetchWithRetry(`${KIMI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIMI_API_KEY}`,
          'X-App-ID': KIMI_APP_ID
        },
        body: JSON.stringify(requestBody)
      }, 3);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API request failed: 429 (Too Many Requests). Please wait a minute and try again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const data: KimiResponse = await response.json();
      const duration = Date.now() - startTime;
      
      const generatedText = data.choices[0]?.message?.content || '';
      const { content, title, hashtags } = parseAIResponse(generatedText);

      // Add assistant response to conversation
      const assistantMessage = conversationService.addMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: generatedText,
        metadata: {
          tokens: data.usage.total_tokens,
          duration,
          model: data.model
        }
      });

      return {
        conversationId: conversation.id,
        message: assistantMessage,
        content,
        title,
        hashtags,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('[Kimi AI] Conversation start error:', error);
      throw error;
    }
  },

  /**
   * Continue an existing conversation with a follow-up message
   */
  async continueConversation(options: ContinueConversationOptions): Promise<ConversationResponse> {
    const { conversationId, userMessage, maxTokens = 2000 } = options;

    if (!KIMI_API_KEY) {
      throw new Error('Kimi API key is not configured. Please check your .env file.');
    }

    const conversation = conversationService.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    // Add user message to conversation
    conversationService.addMessage({
      conversationId,
      role: 'user',
      content: userMessage
    });

    // Get all messages for API call
    const messages = conversationService.getAllMessages(conversationId);

    const requestBody = {
      model: KIMI_MODEL,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature: 1
    };

    console.log('[Kimi AI] Continuing conversation:', conversationId);

    try {
      const startTime = Date.now();
      
      const response = await fetchWithRetry(`${KIMI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIMI_API_KEY}`,
          'X-App-ID': KIMI_APP_ID
        },
        body: JSON.stringify(requestBody)
      }, 3);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API request failed: 429 (Too Many Requests). Please wait a minute and try again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
      }

      const data: KimiResponse = await response.json();
      const duration = Date.now() - startTime;
      
      const generatedText = data.choices[0]?.message?.content || '';
      const { content, title, hashtags } = parseAIResponse(generatedText);

      // Add assistant response to conversation
      const assistantMessage = conversationService.addMessage({
        conversationId,
        role: 'assistant',
        content: generatedText,
        metadata: {
          tokens: data.usage.total_tokens,
          duration,
          model: data.model
        }
      });

      return {
        conversationId,
        message: assistantMessage,
        content,
        title,
        hashtags,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('[Kimi AI] Conversation continue error:', error);
      throw error;
    }
  },

  /**
   * Get a conversation by ID
   */
  getConversation(id: string): Conversation | undefined {
    return conversationService.getConversation(id);
  },

  /**
   * Get conversation messages for display
   */
  getConversationMessages(id: string): Message[] {
    return conversationService.getConversationMessages(id);
  },

  /**
   * Generate content using Kimi K2.5 based on a content brief
   */
  async generateContent(options: GenerateContentOptions): Promise<GeneratedContent> {
    const { 
      brief, 
      tone = 'professional', 
      language = 'en', 
      channel = 'general', 
      maxTokens = 2000,
      streaming = false,
      onStream
    } = options;

    if (!KIMI_API_KEY) {
      throw new Error('Kimi API key is not configured. Please check your .env file.');
    }

    const systemPrompt = `You are an expert content creator for social media and marketing. 
Create engaging, high-quality content based on the provided brief.

Tone: ${tone}
Language: ${language === 'en' ? 'English' : language === 'zh-HK' ? 'Traditional Chinese (Hong Kong)' : language === 'zh-CN' ? 'Simplified Chinese' : language}
Channel/Platform: ${channel}

Guidelines:
- Write in a ${tone} tone
- Optimize for ${channel} platform
- Use appropriate formatting for the channel
- Include relevant hashtags if applicable
- Keep content concise and engaging
- Follow platform-specific best practices (e.g., character limits, hashtag usage)`;

    const userPrompt = `Create content based on the following brief:

Title: ${brief.title}
Objective: ${brief.objective}
Target Audience: ${brief.targetAudience}
Key Messages: ${brief.keyMessages.join(', ')}
${brief.callToAction ? `Call to Action: ${brief.callToAction}` : ''}
${brief.keywords && brief.keywords.length > 0 ? `Keywords to include: ${brief.keywords.join(', ')}` : ''}
${brief.length ? `Length: ${brief.length}` : ''}

Please provide:
1. A compelling title
2. The main content body (optimized for ${channel})
3. Relevant hashtags (if applicable for the platform)

Format your response as:
TITLE: [title]
CONTENT: [content]
HASHTAGS: [hashtags]`;

    const requestBody = {
      model: KIMI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 1,
      stream: streaming || false
    };

    console.log('[Kimi AI] Sending request to:', `${KIMI_API_URL}/chat/completions`);
    console.log('[Kimi AI] Streaming mode:', streaming ? 'enabled' : 'disabled');

    try {
      // Handle streaming mode
      if (streaming && onStream) {
        return await generateContentStream(requestBody, onStream);
      }

      // Non-streaming mode with retry
      const response = await fetchWithRetry(`${KIMI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIMI_API_KEY}`,
          'X-App-ID': KIMI_APP_ID
        },
        body: JSON.stringify(requestBody)
      }, 3);

      console.log('[Kimi AI] Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status}`;
        if (response.status === 429) {
          errorMessage = 'API request failed: 429 (Too Many Requests). Please wait a minute and try again.';
        } else {
          try {
            const errorData = await response.json();
            console.error('[Kimi AI] Error response:', errorData);
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
          } catch (e) {
            const errorText = await response.text();
            console.error('[Kimi AI] Error text:', errorText);
            errorMessage = errorText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      const data: KimiResponse = await response.json();
      console.log('[Kimi AI] Success response received');
      console.log('[Kimi AI] Full response data:', JSON.stringify(data, null, 2));
      
      const generatedText = data.choices[0]?.message?.content || '';
      console.log('[Kimi AI] Raw generated text:', generatedText);
      console.log('[Kimi AI] Generated text length:', generatedText.length);
      console.log('[Kimi AI] Finish reason:', data.choices[0]?.finish_reason);
      
      const { content, title, hashtags } = parseAIResponse(generatedText);
      
      console.log('[Kimi AI] Parsed content length:', content.length);
      console.log('[Kimi AI] Parsed title:', title);
      console.log('[Kimi AI] Parsed hashtags:', hashtags);
      
      // Warn if content seems truncated
      if (data.choices[0]?.finish_reason === 'length') {
        console.warn('[Kimi AI] ⚠️ Content was truncated due to max_tokens limit');
      }

      return {
        content,
        title,
        hashtags,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('[Kimi AI] Generation error:', error);
      throw error;
    }
  },

  /**
   * Generate content variations for multiple channels
   */
  async generateMultiChannelContent(
    brief: ContentBrief,
    channels: string[],
    tone: string = 'professional'
  ): Promise<Record<string, GeneratedContent>> {
    const results: Record<string, GeneratedContent> = {};

    for (const channel of channels) {
      try {
        results[channel] = await this.generateContent({
          brief,
          tone,
          channel,
          maxTokens: 1500
        });
      } catch (error) {
        console.error(`[Kimi AI] Failed to generate content for ${channel}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results[channel] = {
          content: `Error generating content for ${channel}: ${errorMessage}`,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
        };
      }
    }

    return results;
  },

  /**
   * Rewrite content for a different tone or channel
   */
  async rewriteContent(
    originalContent: string,
    options: {
      tone?: string;
      channel?: string;
      language?: string;
    }
  ): Promise<GeneratedContent> {
    const { tone = 'professional', channel = 'general', language = 'en' } = options;

    if (!KIMI_API_KEY) {
      throw new Error('Kimi API key is not configured. Please check your .env file.');
    }

    const systemPrompt = `You are an expert content rewriter. Rewrite the provided content to match the specified tone and channel requirements.
Tone: ${tone}
Channel: ${channel}
Language: ${language === 'en' ? 'English' : language === 'zh-HK' ? 'Traditional Chinese (Hong Kong)' : language === 'zh-CN' ? 'Simplified Chinese' : language}`;

    const userPrompt = `Please rewrite the following content:

${originalContent}

Requirements:
- Tone: ${tone}
- Optimized for: ${channel}
- Language: ${language}

Provide only the rewritten content without any additional explanations.`;

    try {
      const response = await fetchWithRetry(`${KIMI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIMI_API_KEY}`,
          'X-App-ID': KIMI_APP_ID
        },
        body: JSON.stringify({
          model: KIMI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 2000,
          temperature: 1
        })
      }, 3);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API request failed: 429 (Too Many Requests). Please wait a minute and try again.');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: KimiResponse = await response.json();
      const content = data.choices[0]?.message?.content || '';

      return {
        content: content.trim(),
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('[Kimi AI] Rewrite error:', error);
      throw error;
    }
  },

  /**
   * Check if Kimi AI service is available
   */
  async checkStatus(): Promise<{ available: boolean; message: string; error?: string; details?: unknown }> {
    console.log('[Kimi AI] Checking status...');
    
    if (!KIMI_API_KEY) {
      return { 
        available: false, 
        message: 'Kimi AI is not configured',
        error: 'API key is missing. Please check your .env file.'
      };
    }

    try {
      console.log('[Kimi AI] Fetching:', `${KIMI_API_URL}/models`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${KIMI_API_URL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KIMI_API_KEY}`,
          'X-App-ID': KIMI_APP_ID
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('[Kimi AI] Status check response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[Kimi AI] Available models:', data.data?.map((m: {id: string}) => m.id).join(', '));
        return { 
          available: true, 
          message: `Kimi AI (K2.5) is available`,
          details: { models: data.data }
        };
      } else {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.error?.message || JSON.stringify(errorData);
        } catch {
          errorDetail = await response.text();
        }
        return { 
          available: false, 
          message: `Kimi AI service error: ${response.status}`,
          error: errorDetail
        };
      }
    } catch (error: unknown) {
      console.error('[Kimi AI] Status check error:', error);
      
      let errorMessage = 'Unknown error';
      let errorType = 'Unknown';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorType = error.name;
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorType = 'CORS or Network';
          errorMessage = 'Cannot connect to Kimi API. This is likely due to CORS policy (browser security restriction). You need a backend proxy server to make requests to the Kimi API from a browser.';
        } else if (error.name === 'AbortError') {
          errorType = 'Timeout';
          errorMessage = 'Request timed out after 10 seconds';
        }
      }
      
      return { 
        available: false, 
        message: 'Kimi AI service is unreachable',
        error: `[${errorType}] ${errorMessage}`,
        details: error
      };
    }
  }
};

// Legacy exports for backward compatibility
export const generateContent = kimiAIProvider.generateContent.bind(kimiAIProvider);
export const generateMultiChannelContent = kimiAIProvider.generateMultiChannelContent.bind(kimiAIProvider);
export const rewriteContent = kimiAIProvider.rewriteContent.bind(kimiAIProvider);
export const checkKimiAiStatus = kimiAIProvider.checkStatus.bind(kimiAIProvider);
export const startConversation = kimiAIProvider.startConversation.bind(kimiAIProvider);
export const continueConversation = kimiAIProvider.continueConversation.bind(kimiAIProvider);

/**
 * Mock generation for development/testing without API calls
 */
export function mockGenerateContent(options: GenerateContentOptions): GeneratedContent {
  const { brief, channel = 'linkedin' } = options;
  
  const channelContent: Record<string, string> = {
    linkedin: `🚀 ${brief.title}

${brief.objective}

Key takeaways:
${brief.keyMessages.map(msg => `• ${msg}`).join('\n')}

${brief.callToAction ? brief.callToAction : 'What are your thoughts? Share in the comments below! 👇'}

#Innovation #Leadership #BusinessGrowth`,
    
    twitter: `🚀 ${brief.title}

${brief.objective?.substring(0, 100)}...

Key points:
${brief.keyMessages.slice(0, 2).join(' ')}

${brief.callToAction || 'Thoughts? 💭'}

#Trending #Tech`,
    
    facebook: `We're thrilled to share insights on ${brief.title}!

${brief.objective}

This is an important development for ${brief.targetAudience}. Here's what you need to know:

${brief.keyMessages.map(msg => `→ ${msg}`).join('\n')}

${brief.callToAction || 'Like and share if you found this helpful! ❤️'}

#Community #BusinessUpdate`,
    
    instagram: `${brief.title} ✨

${brief.objective}

${brief.keyMessages.slice(0, 3).join('\n\n')}

${brief.callToAction || 'Double tap if you agree! ❤️'}

#InstaBusiness #DigitalMarketing`,
    
    thread: `${brief.title}

A thread on why this matters 🧵👇

1/ ${brief.keyMessages[0] || brief.objective}

2/ ${brief.keyMessages[1] || 'More insights coming...'}

3/ ${brief.keyMessages[2] || 'Stay tuned for updates!'}

${brief.callToAction || 'Follow for more insights'}

#Thread #Insights`
  };

  return {
    content: channelContent[channel] || channelContent.linkedin,
    title: brief.title,
    hashtags: ['#Innovation', '#Business', '#Leadership'],
    usage: {
      promptTokens: 150,
      completionTokens: 250,
      totalTokens: 400
    }
  };
}

export default kimiAIProvider;
