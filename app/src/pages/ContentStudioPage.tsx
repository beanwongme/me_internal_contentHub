import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  ArrowLeft, 
  Sparkles, 
  Save, 
  Send, 
  Clock, 
  CheckCircle,
  MoreHorizontal,
  Copy,
  AlertCircle,
  Languages,
  Loader2,
  Terminal,
  StopCircle,
  RefreshCw,
  Database
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { mockGenerateContent } from '@/services/kimiAi';


// OPTIMIZED: Token limits for complete content generation
// Increased to ensure content isn't truncated mid-sentence
// LinkedIn/Facebook need more tokens for full articles with sections
const CHANNEL_CONFIG = {
  twitter:   { name: 'Twitter/X',   characterLimit: 280,   maxTokens: 400,   estTime: '4-6s' },
  thread:    { name: 'Thread',      characterLimit: 500,   maxTokens: 500,   estTime: '5-8s' },
  instagram: { name: 'Instagram',   characterLimit: 2200,  maxTokens: 800,   estTime: '8-12s' },
  linkedin:  { name: 'LinkedIn',    characterLimit: 3000,  maxTokens: 1500,  estTime: '12-18s' },
  facebook:  { name: 'Facebook',    characterLimit: 63206, maxTokens: 2000,  estTime: '15-20s' }
} as const;

type ChannelId = keyof typeof CHANNEL_CONFIG;

const channels = Object.entries(CHANNEL_CONFIG).map(([id, config]) => ({
  id,
  ...config
}));

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh-HK', name: '繁體中文 (香港)' },
  { code: 'zh-CN', name: '简体中文' },
];

// Feature toggles - can be set via localStorage or .env
const USE_MOCK_MODE = localStorage.getItem('mock_mode') === 'true';
const USE_STREAMING = localStorage.getItem('use_streaming') !== 'false' && 
                      (import.meta.env.VITE_USE_STREAMING !== 'false');

interface StreamingState {
  isStreaming: boolean;
  content: string;
  title: string;
  hashtags: string[];
  isComplete: boolean;
  error?: string;
  tokensReceived: number;
  startTime: number;
  // Token rate tracking
  tokenRate: number; // tokens per second
  estimatedTotalTime: number; // estimated seconds to completion
  lastTokenTime: number;
}

export function ContentStudioPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('brief');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Record<string, { content: string; title?: string }>>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Streaming state for each channel
  const [streamingStates, setStreamingStates] = useState<Record<string, StreamingState>>({});
  
  // Proxy connection status
  const [proxyStatus, setProxyStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [proxyInfo, setProxyInfo] = useState<{provider?: string; latency?: string}>({});
  
  // RAG (Vector DB) status
  const [ragStatus, setRagStatus] = useState<{ initialized: boolean; count: number } | null>(null);
  const [useRag, setUseRag] = useState(true); // Enable RAG by default if available
  
  // Check proxy and RAG connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const KIMI_API_URL = import.meta.env.VITE_KIMI_API_URL || 'http://localhost:3001/api';
      
      try {
        const response = await fetch(`${KIMI_API_URL.replace('/api', '')}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProxyStatus(data.status === 'ok' ? 'connected' : 'error');
          setProxyInfo({
            provider: data.provider?.name,
            latency: data.provider?.connection?.latency ? `${data.provider.connection.latency}ms` : undefined
          });
          
          // Check RAG status
          if (data.rag) {
            setRagStatus({
              initialized: data.rag.initialized,
              count: data.rag.documentCount
            });
          }
          
          console.log('[Proxy] Connected:', data.provider?.name, 'RAG:', data.rag?.documentCount || 0, 'docs');
        } else {
          setProxyStatus('error');
        }
      } catch (error) {
        setProxyStatus('error');
        console.error('[Proxy] Connection failed:', error);
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const [brief, setBrief] = useState({
    topic: 'AI Ethics in Healthcare: What You Need to Know',
    keywords: ['AI', 'healthcare', 'ethics', 'regulation'],
    talkingPoints: [
      'Recent regulatory developments in AI healthcare',
      'Patient privacy concerns',
      'Best practices for ethical AI implementation'
    ],
    tone: {
      formality: 70,
      enthusiasm: 50,
      complexity: 60
    },
    selectedChannels: ['linkedin', 'twitter'],
    language: 'en',
    objective: 'Educate healthcare professionals about AI ethics',
    targetAudience: 'Healthcare professionals and administrators',
    callToAction: 'Share your thoughts on AI ethics in your practice',
  });

  const getToneLabel = (formality: number, enthusiasm: number) => {
    if (formality > 70 && enthusiasm < 40) return 'professional';
    if (formality < 40 && enthusiasm > 70) return 'casual';
    if (formality > 70 && enthusiasm > 70) return 'enthusiastic professional';
    if (formality < 40 && enthusiasm < 40) return 'conversational';
    return 'balanced';
  };

  const parseStreamingContent = (text: string) => {
    // Try standard format first
    const titleMatch = text.match(/TITLE:\s*(.+?)(?=\n|CONTENT:|$)/i);
    const contentMatch = text.match(/CONTENT:\s*([\s\S]+?)(?=HASHTAGS:|$)/i);
    const hashtagsMatch = text.match(/HASHTAGS:\s*(.+?)(?=\n|$)/i);

    // If standard format not found, try to extract any meaningful content
    if (!titleMatch && !contentMatch) {
      // Check if text contains hashtags
      const hashtagRegex = /#[\w\u4e00-\u9fa5]+/g;
      const foundHashtags = text.match(hashtagRegex) || [];
      
      // Try to find a title (first line or sentence)
      const lines = text.split('\n').filter(l => l.trim());
      const potentialTitle = lines[0]?.trim() || '';
      
      // Rest is content
      const potentialContent = lines.slice(1).join('\n').trim() || text;
      
      return {
        title: potentialTitle.substring(0, 100),
        content: potentialContent,
        hashtags: foundHashtags
      };
    }

    return {
      title: titleMatch ? titleMatch[1].trim() : '',
      content: contentMatch ? contentMatch[1].trim() : text,
      hashtags: hashtagsMatch 
        ? hashtagsMatch[1].trim().split(/\s+/).filter(h => h.startsWith('#'))
        : []
    };
  };

  const handleStreamResponse = async (channelId: string, response: Response, maxTokens: number) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let tokenCount = 0;
    const startTime = Date.now();

    if (!reader) {
      throw new Error('No reader available');
    }

    console.log(`[Stream ${channelId}] Starting stream read...`);
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log(`[Stream ${channelId}] Stream DONE signal received`);
          console.log(`[Stream ${channelId}] Total tokens collected: ${tokenCount}`);
          console.log(`[Stream ${channelId}] Full content length: ${fullContent.length}`);
          
          if (fullContent.length === 0) {
            console.error(`[Stream ${channelId}] ERROR: No content received from stream!`);
            setStreamingStates(prev => ({
              ...prev,
              [channelId]: {
                ...prev[channelId],
                isStreaming: false,
                isComplete: true,
                error: 'No content received. The model may have returned an error or the stream was empty.'
              }
            }));
            break;
          }
          
          const finalParsed = parseStreamingContent(fullContent);
          console.log(`[Stream ${channelId}] Content preview: "${fullContent.substring(0, 80)}..."`);
          console.log(`[Stream ${channelId}] Parsed title: "${finalParsed.title?.substring(0, 40)}..."`);
          
          setStreamingStates(prev => ({
            ...prev,
            [channelId]: {
              ...prev[channelId],
              isStreaming: false,
              isComplete: true,
              content: finalParsed.content || fullContent,  // Use parsed content if available
              title: finalParsed.title,
              hashtags: finalParsed.hashtags
            }
          }));
          
          setGeneratedContent(prev => ({
            ...prev,
            [channelId]: finalParsed
          }));
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        
        if (chunk.length > 0) {
          console.log(`[Stream ${channelId}] Raw chunk: ${chunk.length} chars`);
        }
        
        const lines = chunk.split('\n');
        let chunksInThisBatch = 0;

        for (const line of lines) {
          if (!line.trim()) continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log(`[Stream ${channelId}] [DONE] marker received`);
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Kimi K2.5 may use 'reasoning_content' OR 'content'
              const delta = parsed.choices?.[0]?.delta || {};
              const content = delta.content || '';
              const reasoning = delta.reasoning_content || '';
              
              // Use content if available, otherwise use reasoning as fallback
              const textChunk = content || reasoning || '';
              
              if (textChunk) {
                chunksInThisBatch++;
                fullContent += textChunk;
                tokenCount++;
                
                // Log first few chunks
                if (tokenCount <= 3) {
                  console.log(`[Stream ${channelId}] Token #${tokenCount}: "${textChunk.substring(0, 40)}${textChunk.length > 40 ? '...' : ''}"`);
                }
                
                const now = Date.now();
                const elapsedSeconds = (now - startTime) / 1000;
                const tokenRate = elapsedSeconds > 0 ? tokenCount / elapsedSeconds : 0;
                const estimatedTotalTime = tokenRate > 0 ? maxTokens / tokenRate : 0;
                
                const parsedContent = parseStreamingContent(fullContent);
                
                setStreamingStates(prev => ({
                  ...prev,
                  [channelId]: {
                    ...prev[channelId],
                    content: fullContent,
                    title: parsedContent.title,
                    hashtags: parsedContent.hashtags,
                    tokensReceived: tokenCount,
                    tokenRate: Math.round(tokenRate * 10) / 10,
                    estimatedTotalTime: Math.round(estimatedTotalTime),
                    lastTokenTime: now
                  }
                }));
              }
            } catch (e) {
              // Silent fail for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted');
        setStreamingStates(prev => ({
          ...prev,
          [channelId]: {
            ...prev[channelId],
            isStreaming: false,
            isComplete: true
          }
        }));
      } else {
        throw error;
      }
    }
  };

  // Handle non-streaming response (all content at once)
  const handleNonStreamResponse = async (channelId: string, response: Response) => {
    console.log(`[NonStream ${channelId}] Processing complete response...`);
    
    try {
      const data = await response.json();
      
      console.log(`[NonStream ${channelId}] Response received:`, {
        model: data.model,
        usage: data.usage
      });
      
      const content = data.choices?.[0]?.message?.content || '';
      
      if (!content) {
        console.error(`[NonStream ${channelId}] No content in response`);
        setStreamingStates(prev => ({
          ...prev,
          [channelId]: {
            ...prev[channelId],
            isStreaming: false,
            isComplete: true,
            error: 'No content received from API'
          }
        }));
        return;
      }
      
      const parsedContent = parseStreamingContent(content);
      
      console.log(`[NonStream ${channelId}] Content parsed:`, {
        title: parsedContent.title?.substring(0, 40),
        contentLength: parsedContent.content?.length,
        hashtags: parsedContent.hashtags?.length
      });
      
      setStreamingStates(prev => ({
        ...prev,
        [channelId]: {
          ...prev[channelId],
          isStreaming: false,
          isComplete: true,
          content: parsedContent.content || content,
          title: parsedContent.title,
          hashtags: parsedContent.hashtags,
          tokensReceived: data.usage?.completion_tokens || 0
        }
      }));
      
      setGeneratedContent(prev => ({
        ...prev,
        [channelId]: parsedContent
      }));
      
    } catch (error) {
      console.error(`[NonStream ${channelId}] Error parsing response:`, error);
      setStreamingStates(prev => ({
        ...prev,
        [channelId]: {
          ...prev[channelId],
          isStreaming: false,
          isComplete: true,
          error: 'Failed to parse API response'
        }
      }));
    }
  };

  // Retry wrapper for rate limited requests
  const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // If rate limited, wait and retry
        if (response.status === 429) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`[Retry] Rate limited (429), waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[Retry] Request failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  };

  const generateWithStreaming = async (channelId: string) => {
    // Proxy server handles authentication - no API key needed in frontend
    const KIMI_API_URL = import.meta.env.VITE_KIMI_API_URL || 'http://localhost:3001/api';
    const KIMI_MODEL = import.meta.env.VITE_KIMI_MODEL || 'kimi-k2.5';

    const tone = getToneLabel(brief.tone.formality, brief.tone.enthusiasm);
    const channel = CHANNEL_CONFIG[channelId as ChannelId];
    const maxTokens = channel?.maxTokens || 1000; // Default to 1000 for faster generation

    // OPTIMIZED: Concise system prompt to reduce token overhead and thinking trace
    const systemPrompt = `Expert ${channel?.name} content creator. ${tone} tone. ${brief.language === 'en' ? 'English' : brief.language === 'zh-HK' ? 'Traditional Chinese (Hong Kong)' : 'Simplified Chinese'}.

RULES:
- Be concise. Max 300 words.
- No thinking process. Direct output only.
- No explanations or meta-commentary.
- Strict format compliance.

OUTPUT FORMAT:
TITLE: [title]
CONTENT: [body]
HASHTAGS: [tags]`;

    // OPTIMIZED: Directive user prompt for faster completion
    const userPrompt = `Brief: ${brief.topic}
Goal: ${brief.objective}
Audience: ${brief.targetAudience}
Messages: ${brief.talkingPoints.join(', ')}
${brief.callToAction ? `CTA: ${brief.callToAction}` : ''}
Keywords: ${brief.keywords.join(', ')}

Requirements:
- Platform: ${channel?.name}
- Tone: ${tone}
- Max chars: ${channel?.characterLimit || 2000}
- Include hashtags
- Concise, no fluff`;

    // OPTIMIZED: Temperature from env (0.7-0.85 recommended for faster/cheaper output)
    // Kimi K2.5 requires exactly 1.0, Fireworks/DeepInfra work well with 0.7-0.8
    const temperature = parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.8');
    
    const requestBody = {
      model: KIMI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens, // Optimized per-channel (350-800)
      temperature: temperature,
      stream: USE_STREAMING
    };
    
    console.log(`[Generate] Channel: ${channelId}, max_tokens: ${maxTokens}`);
    console.log(`[Generate] Streaming: ${USE_STREAMING}`);
    console.log(`[Generate] API URL: ${KIMI_API_URL}`);
    console.log(`[Generate] Using proxy server (auth handled server-side)`);

    // Initialize streaming state with token rate tracking
    const startTime = Date.now();
    setStreamingStates(prev => ({
      ...prev,
      [channelId]: {
        isStreaming: true,
        content: '',
        title: '',
        hashtags: [],
        isComplete: false,
        tokensReceived: 0,
        startTime,
        tokenRate: 0,
        estimatedTotalTime: 0,
        lastTokenTime: startTime
      }
    }));

    abortControllerRef.current = new AbortController();

    try {
      console.log(`[Generate] Fetching from ${KIMI_API_URL}/chat/completions...`);
      
      const response = await fetchWithRetry(`${KIMI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Note: Authorization is handled by proxy server
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      }, 3); // 3 retries with exponential backoff
      
      console.log(`[Generate] Response received:`, {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
        hasBody: !!response.body
      });
      
      // Handle proxy errors (includes Kimi API errors passed through by proxy)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Generate] Proxy error:', errorData);
        throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}`);
      }

      if (USE_STREAMING) {
        await handleStreamResponse(channelId, response, maxTokens);
      } else {
        await handleNonStreamResponse(channelId, response);
      }
      
      toast.success(`Content generated for ${channel?.name}!`);
    } catch (error) {
      console.error('[Generate] Error caught:', error);
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('[Generate] Streaming error:', error);
        setStreamingStates(prev => ({
          ...prev,
          [channelId]: {
            ...prev[channelId],
            isStreaming: false,
            error: error.message,
            isComplete: true
          }
        }));
        toast.error(`Failed to generate for ${channel?.name}: ${error.message}`);
      } else if (error instanceof Error) {
        console.log('[Generate] Request aborted');
      }
    }
  };

  const handleGenerate = async () => {
    console.log('[handleGenerate] Starting generation...', {
      channels: brief.selectedChannels,
      useMockMode: USE_MOCK_MODE
    });
    
    if (brief.selectedChannels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    setIsGenerating(true);
    setActiveTab('drafts');
    
    // Clear previous errors
    setStreamingStates({});
    setGeneratedContent({});

    if (USE_MOCK_MODE) {
      // Mock generation with simulated streaming
      for (const channelId of brief.selectedChannels) {
        const mockResult = mockGenerateContent({
          brief: {
            title: brief.topic,
            objective: brief.objective,
            targetAudience: brief.targetAudience,
            keyMessages: brief.talkingPoints,
            callToAction: brief.callToAction,
            keywords: brief.keywords
          },
          tone: getToneLabel(brief.tone.formality, brief.tone.enthusiasm),
          channel: channelId,
          language: brief.language
        });

        setGeneratedContent(prev => ({
          ...prev,
          [channelId]: {
            content: mockResult.content,
            title: mockResult.title
          }
        }));

        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success('Content generated! (Mock Mode)');
      setIsGenerating(false);
    } else {
      // Real streaming generation
      const promises = brief.selectedChannels.map(channelId => 
        generateWithStreaming(channelId)
      );

      await Promise.all(promises);
      setIsGenerating(false);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    toast.info('Generation stopped');
  };

  const handleCopy = (channelId: string) => {
    const content = streamingStates[channelId]?.content || generatedContent[channelId]?.content;
    if (content) {
      navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard!');
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/social-content')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Content Studio
            </h1>
            <p className="text-sm text-muted-foreground">
              Create content with real-time AI streaming
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {USE_MOCK_MODE && (
            <Badge variant="outline" className="text-amber-500 border-amber-500">
              <AlertCircle className="w-3 h-3 mr-1" />
              Mock Mode
            </Badge>
          )}
          
          {/* Proxy Connection Status */}
          {!USE_MOCK_MODE && (
            <Badge 
              variant="outline" 
              className={proxyStatus === 'connected' 
                ? 'text-green-500 border-green-500' 
                : proxyStatus === 'checking' 
                  ? 'text-amber-500 border-amber-500'
                  : 'text-red-500 border-red-500'
              }
              title={proxyInfo.provider ? `${proxyInfo.provider} ${proxyInfo.latency || ''}` : 'Proxy connection status'}
            >
              <span className={`w-2 h-2 rounded-full mr-1 ${
                proxyStatus === 'connected' 
                  ? 'bg-green-500' 
                  : proxyStatus === 'checking' 
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-red-500'
              }`} />
              {proxyStatus === 'connected' 
                ? `Proxy: ${proxyInfo.provider?.split(' ')[0] || 'Connected'}` 
                : proxyStatus === 'checking' 
                  ? 'Connecting...'
                  : 'Proxy Error'}
            </Badge>
          )}
          
          {/* RAG Status */}
          {useRag && ragStatus && ragStatus.count > 0 && (
            <Badge variant="outline" className="text-blue-500 border-blue-500" title="Using company knowledge base">
              <Database className="w-3 h-3 mr-1" />
              RAG: {ragStatus.count} docs
            </Badge>
          )}
          
          <Badge variant="secondary" className="bg-warning/20 text-warning">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </Badge>
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Send className="w-4 h-4" />
                Publish
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Publish Now</DropdownMenuItem>
              <DropdownMenuItem>Schedule</DropdownMenuItem>
              <DropdownMenuItem>Send for Review</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts
            {Object.keys(generatedContent).length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {Object.keys(generatedContent).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="brief" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Brief Editor */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg">Content Brief</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Topic */}
                  <div className="space-y-2">
                    <Label>Topic / Title</Label>
                    <Input 
                      value={brief.topic}
                      onChange={(e) => setBrief({ ...brief, topic: e.target.value })}
                      placeholder="Enter content topic..."
                    />
                  </div>

                  {/* Objective */}
                  <div className="space-y-2">
                    <Label>Objective</Label>
                    <Textarea
                      value={brief.objective}
                      onChange={(e) => setBrief({ ...brief, objective: e.target.value })}
                      placeholder="What do you want to achieve with this content?"
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Input
                      value={brief.targetAudience}
                      onChange={(e) => setBrief({ ...brief, targetAudience: e.target.value })}
                      placeholder="e.g., Healthcare professionals, C-suite executives..."
                    />
                  </div>

                  {/* Keywords */}
                  <div className="space-y-2">
                    <Label>Keywords</Label>
                    <div className="flex flex-wrap gap-2">
                      {brief.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {keyword}
                          <button 
                            onClick={() => setBrief({ 
                              ...brief, 
                              keywords: brief.keywords.filter((_, i) => i !== index) 
                            })}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      <Input 
                        placeholder="Add keyword..."
                        className="w-32 h-7 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = e.currentTarget.value.trim();
                            if (value && !brief.keywords.includes(value)) {
                              setBrief({ ...brief, keywords: [...brief.keywords, value] });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Talking Points */}
                  <div className="space-y-2">
                    <Label>Key Messages / Talking Points</Label>
                    <div className="space-y-2">
                      {brief.talkingPoints.map((point, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={point} readOnly className="flex-1" />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setBrief({
                              ...brief,
                              talkingPoints: brief.talkingPoints.filter((_, i) => i !== index)
                            })}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Input 
                        placeholder="Add talking point..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = e.currentTarget.value.trim();
                            if (value) {
                              setBrief({ 
                                ...brief, 
                                talkingPoints: [...brief.talkingPoints, value] 
                              });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Tone Settings */}
                  <div className="space-y-4">
                    <Label>Tone & Style</Label>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Casual</span>
                        <span>Formal</span>
                      </div>
                      <Slider 
                        value={[brief.tone.formality]} 
                        onValueChange={([v]) => setBrief({ ...brief, tone: { ...brief.tone, formality: v } })}
                        max={100}
                        step={10}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Measured</span>
                        <span>Enthusiastic</span>
                      </div>
                      <Slider 
                        value={[brief.tone.enthusiasm]} 
                        onValueChange={([v]) => setBrief({ ...brief, tone: { ...brief.tone, enthusiasm: v } })}
                        max={100}
                        step={10}
                      />
                    </div>

                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Tone: <span className="font-medium text-foreground capitalize">
                          {getToneLabel(brief.tone.formality, brief.tone.enthusiasm)}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Channels */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg">Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {channels.map((channel) => (
                      <div key={channel.id} className="flex items-center space-x-3">
                        <Checkbox 
                          id={channel.id}
                          checked={brief.selectedChannels.includes(channel.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBrief({ 
                                ...brief, 
                                selectedChannels: [...brief.selectedChannels, channel.id] 
                              });
                            } else {
                              setBrief({
                                ...brief,
                                selectedChannels: brief.selectedChannels.filter(c => c !== channel.id)
                              });
                            }
                          }}
                        />
                        <label 
                          htmlFor={channel.id}
                          className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {channel.name}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {channel.characterLimit.toLocaleString()} chars
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Language */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Language
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={brief.language}
                    onValueChange={(value) => setBrief({ ...brief, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* AI Provider Info */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI Provider
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Kimi K2.5</p>
                    <p className="text-xs text-muted-foreground">
                      ContentHub Bundled AI Provider for high-quality content generation.
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      <Terminal className="w-3 h-3 mr-1" />
                      Streaming Enabled
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={isGenerating ? stopGeneration : handleGenerate}
                disabled={brief.selectedChannels.length === 0 || proxyStatus === 'error'}
              >
                {isGenerating ? (
                  <>
                    <StopCircle className="w-4 h-4" />
                    Stop Generation
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Content
                  </>
                )}
              </Button>

              {/* Proxy Error Warning */}
              {proxyStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 font-medium">⚠️ Proxy Server Error</p>
                  <p className="text-xs text-red-500 mt-1">
                    Cannot connect to proxy server on port 3001. Make sure it's running:
                    <code className="block mt-1 p-1 bg-red-100 rounded">cd proxy-server && npm start</code>
                  </p>
                </div>
              )}
              
              {/* Feature Toggles */}
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={USE_MOCK_MODE}
                    onChange={(e) => {
                      localStorage.setItem('mock_mode', e.target.checked ? 'true' : 'false');
                      window.location.reload();
                    }}
                    className="rounded"
                  />
                  Use Mock Mode (for testing UI)
                </label>
                <label className="flex items-center gap-2 cursor-pointer" title="Disable streaming if you get 429 rate limit errors">
                  <input 
                    type="checkbox" 
                    checked={USE_STREAMING}
                    onChange={(e) => {
                      localStorage.setItem('use_streaming', e.target.checked ? 'true' : 'false');
                      window.location.reload();
                    }}
                    className="rounded"
                  />
                  Use Streaming Mode (real-time generation)
                </label>
                {ragStatus && ragStatus.count > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer" title="Use company knowledge base for more accurate content">
                    <input 
                      type="checkbox" 
                      checked={useRag}
                      onChange={(e) => setUseRag(e.target.checked)}
                      className="rounded"
                    />
                    <Database className="w-3 h-3" />
                    Use RAG ({ragStatus.count} docs)
                  </label>
                )}
                {ragStatus && ragStatus.count === 0 && (
                  <p className="text-amber-600">
                    <Database className="w-3 h-3 inline mr-1" />
                    No vector DB - <a href="/test/kimi" className="underline">Add documents</a>
                  </p>
                )}
              </div>

              {brief.selectedChannels.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Select at least one channel to generate content
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {channels.filter(c => brief.selectedChannels.includes(c.id)).map((channel) => {
              const streamState = streamingStates[channel.id];
              const hasContent = streamState?.content || generatedContent[channel.id]?.content;
              
              return (
                <Card key={channel.id} className={cn(
                  "bg-card border-border transition-all duration-300",
                  streamState?.isStreaming && "border-primary/50 ring-1 ring-primary/20"
                )}>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="font-heading text-lg flex items-center gap-2">
                      {channel.name}
                      {streamState?.isStreaming && (
                        <Badge variant="secondary" className="text-xs animate-pulse">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Generating...
                        </Badge>
                      )}
                      {streamState?.isComplete && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {hasContent && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopy(channel.id)}
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Streaming Content Display */}
                    <div className="min-h-[200px] bg-secondary/30 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                      {streamState?.error ? (
                        <div className="text-red-600">
                          <p className="font-semibold">❌ Generation Failed</p>
                          <p className="text-xs mt-1">{streamState.error}</p>
                          {streamState.error?.includes('401') && (
                            <p className="text-xs mt-2 text-red-500">
                              API Key is invalid. Check proxy-server/.env and restart.
                            </p>
                          )}
                          {(streamState.error?.includes('429') || streamState.error?.includes('Too Many Requests')) && (
                            <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
                              <p className="font-medium">⚠️ Rate Limited (Too Many Requests)</p>
                              <p className="mt-1">You've hit the API rate limit. Solutions:</p>
                              <ul className="list-disc ml-4 mt-1">
                                <li>Wait 1 minute before retrying</li>
                                <li>Generate fewer channels at once</li>
                                <li>Use Mock Mode for testing (checkbox below)</li>
                              </ul>
                            </div>
                          )}
                          {streamState.error?.includes('overloaded') && (
                            <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
                              <p className="font-medium">⚠️ Kimi servers are overloaded</p>
                              <p className="mt-1">Try one of these:</p>
                              <ul className="list-disc ml-4 mt-1">
                                <li>Wait 1-2 minutes and retry</li>
                                <li>Enable Mock Mode (checkbox below)</li>
                                <li>Switch to moonshot-v1-128k model</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : streamState?.isStreaming || streamState?.content ? (
                        <div className="space-y-2">
                          {/* Title */}
                          {streamState?.title && streamState.title !== 'Thinking...' ? (
                            <h4 className="font-semibold text-base">{streamState.title}</h4>
                          ) : streamState?.title === 'Thinking...' ? (
                            <h4 className="font-semibold text-base text-amber-600 flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              AI is thinking...
                            </h4>
                          ) : null}
                          
                          {/* Content with typing animation effect */}
                          <div className="relative">
                            {streamState?.content && streamState.content !== '(AI is reasoning through the request)' ? (
                              <p>{streamState.content}</p>
                            ) : streamState?.content === '(AI is reasoning through the request)' ? (
                              <p className="text-muted-foreground italic">Analyzing your brief and crafting content...</p>
                            ) : (
                              <p className="text-muted-foreground italic">Receiving content...</p>
                            )}
                            {streamState?.isStreaming && (
                              <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                            )}
                          </div>
                          
                          {/* Hashtags */}
                          {streamState?.hashtags && streamState.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                              {streamState.hashtags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {/* Truncation Warning */}
                          {streamState?.isComplete && streamState.content && (
                            streamState.content.endsWith('...') || 
                            (streamState.content.length > 200 && 
                             !streamState.content.includes('**3.') && 
                             !streamState.content.toLowerCase().includes('conclusion'))
                          ) && (
                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                              <span className="font-medium">⚠️ Content may be truncated</span>
                              <p className="mt-1">The AI reached the token limit. Try increasing max_tokens or generating a shorter brief.</p>
                            </div>
                          )}
                          
                          {/* Debug: Show token count when streaming */}
                          {streamState?.isStreaming && streamState.tokensReceived > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Received {streamState.tokensReceived} tokens...
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Click "Generate Content" to start</p>
                        </div>
                      )}
                    </div>

                    {/* Streaming Stats with Token Rate */}
                    {streamState?.isStreaming && (
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1" title="Tokens generated">
                          <Terminal className="w-3 h-3" />
                          {streamState.tokensReceived} tokens
                        </span>
                        <span className="flex items-center gap-1" title="Elapsed time">
                          <Clock className="w-3 h-3" />
                          {formatDuration(Date.now() - streamState.startTime)}
                        </span>
                        <span className="flex items-center gap-1 text-primary" title="Generation speed">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          {streamState.tokenRate > 0 ? `${streamState.tokenRate} tok/s` : '...'}
                        </span>
                        {streamState.estimatedTotalTime > 0 && streamState.tokenRate > 0 && (
                          <span className="flex items-center gap-1 text-amber-600" title="Estimated total time">
                            ~{streamState.estimatedTotalTime}s total
                          </span>
                        )}
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                          max: {CHANNEL_CONFIG[channel.id as ChannelId]?.maxTokens || 1000}
                        </span>
                      </div>
                    )}

                    {/* Character Count */}
                    {hasContent && (
                      <div className="flex items-center justify-between mt-3">
                        <span className={cn(
                          'text-xs',
                          (streamState?.content?.length || 0) > channel.characterLimit 
                            ? 'text-destructive' 
                            : 'text-muted-foreground'
                        )}>
                          {streamState?.content?.length || generatedContent[channel.id]?.content?.length || 0} / {channel.characterLimit}
                        </span>
                        {streamState?.isComplete && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Error Display with Retry */}
                    {streamState?.error && (
                      <div className="mt-3 p-3 bg-destructive/10 rounded text-destructive text-sm">
                        <p className="font-medium mb-2">Generation Failed</p>
                        <p className="mb-2">{streamState.error}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => generateWithStreaming(channel.id)}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Preview mode coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Version history coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

export default ContentStudioPage;
