import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { AppShell } from '@/components/layout/AppShell';
import { kimiAIProvider, mockGenerateContent } from '@/services/kimiAi';
import { CheckCircle, XCircle, AlertCircle, Loader2, Terminal, Sparkles, Database, Upload, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function KimiTestPage() {
  const [status, setStatus] = useState<{ available: boolean; message: string; error?: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Simple test form state
  const [topic, setTopic] = useState('AI in Healthcare');
  const [objective, setObjective] = useState('Educate healthcare professionals about AI ethics');
  const [simpleTestResult, setSimpleTestResult] = useState<string | null>(null);
  const [isSimpleTesting, setIsSimpleTesting] = useState(false);
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const [maxTokens, setMaxTokens] = useState(1200);
  
  // Generation timer state
  const [generationTime, setGenerationTime] = useState(0);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  
  // RAG state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);
  const [isCreatingDb, setIsCreatingDb] = useState(false);
  const [ragStats, setRagStats] = useState<{ initialized: boolean; count: number } | null>(null);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<any[] | null>(null);
  const [isQueryingRag, setIsQueryingRag] = useState(false);
  
  // Crawl options
  const [enableCrawl, setEnableCrawl] = useState(false);
  const [maxPages, setMaxPages] = useState(10);
  const [maxDepth, setMaxDepth] = useState(2);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      addLog(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    // Load RAG stats on mount
    loadRagStats();

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  // Timer effect for generation tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSimpleTesting && generationStartTime) {
      interval = setInterval(() => {
        setGenerationTime(Math.floor((Date.now() - generationStartTime) / 1000));
      }, 100);
    }
    // Note: We don't reset generationTime to 0 here so it persists after generation
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimpleTesting, generationStartTime]);

  const loadRagStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rag/stats');
      if (response.ok) {
        const data = await response.json();
        setRagStats(data);
      }
    } catch (error) {
      console.log('RAG stats not available');
    }
  };

  const checkStatus = async () => {
    setIsChecking(true);
    addLog('Checking Kimi AI status...');
    try {
      const result = await kimiAIProvider.checkStatus();
      setStatus(result);
      addLog(`Status check result: ${result.available ? 'AVAILABLE' : 'UNAVAILABLE'}`);
      addLog(`Message: ${result.message}`);
      if (result.error) {
        addLog(`Error: ${result.error}`);
      }
    } catch (error) {
      addLog(`Exception during status check: ${error}`);
    } finally {
      setIsChecking(false);
    }
  };

  const testGeneration = async () => {
    setIsTesting(true);
    setTestResult(null);
    addLog('Starting test content generation...');

    try {
      const result = await kimiAIProvider.generateContent({
        brief: {
          title: 'Test Content Generation',
          objective: 'Test the Kimi AI integration',
          targetAudience: 'Developers',
          keyMessages: ['Testing API connection', 'Verifying response format'],
          callToAction: 'Check the logs',
          keywords: ['test', 'api']
        },
        tone: 'professional',
        channel: 'linkedin',
        language: 'en',
        maxTokens: 500
      });

      addLog('Generation successful!');
      addLog(`Title: ${result.title || 'N/A'}`);
      addLog(`Content length: ${result.content.length} characters`);
      addLog(`Token usage: ${result.usage.totalTokens}`);
      setTestResult(result.content);
      toast.success('Test generation successful!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Generation failed: ${errorMsg}`);
      toast.error(`Test failed: ${errorMsg}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testMockGeneration = () => {
    addLog('Testing mock generation...');
    const result = mockGenerateContent({
      brief: {
        title: 'Mock Test',
        objective: 'Test mock mode',
        targetAudience: 'Testers',
        keyMessages: ['Mock message 1', 'Mock message 2'],
      },
      channel: 'linkedin'
    });
    addLog(`Mock generation successful! Content length: ${result.content.length}`);
    setTestResult(result.content);
  };

  // Simple test with just topic and objective
  const testSimpleGeneration = async () => {
    if (!topic.trim() || !objective.trim()) {
      toast.error('Please enter both topic and objective');
      return;
    }

    setIsSimpleTesting(true);
    setSimpleTestResult('');
    setGenerationStartTime(Date.now());
    setGenerationTime(0);
    addLog('=== Simple Test Generation ===');
    addLog(`Topic: ${topic}`);
    addLog(`Objective: ${objective}`);
    addLog(`Max Tokens: ${maxTokens}`);
    addLog(`Streaming: ${streamingEnabled ? 'enabled' : 'disabled'}`);
    
    console.log('=== Simple Test Generation ===');
    console.log('Topic:', topic);
    console.log('Objective:', objective);
    console.log('Streaming:', streamingEnabled);

    try {
      let accumulatedContent = '';
      
      const requestOptions = {
        brief: {
          title: topic,
          objective: objective,
          targetAudience: 'General audience',
          keyMessages: [objective],
        },
        tone: 'professional',
        channel: 'linkedin',
        language: 'en',
        maxTokens: maxTokens,
        streaming: streamingEnabled,
        onStream: streamingEnabled ? (chunk: string) => {
          accumulatedContent += chunk;
          setSimpleTestResult(accumulatedContent);
        } : undefined
      };
      
      console.log('Request options:', JSON.stringify({ ...requestOptions, onStream: undefined }, null, 2));
      
      const result = await kimiAIProvider.generateContent(requestOptions);

      // If streaming, result is already accumulated; otherwise use result.content
      const finalContent = streamingEnabled ? accumulatedContent : result.content;

      console.log('=== API Response ===');
      console.log('Title:', result.title);
      console.log('Content length:', finalContent.length);
      console.log('Content preview:', finalContent.substring(0, 200));
      console.log('Full content:', finalContent);
      if (!streamingEnabled) {
        console.log('Usage:', result.usage);
      }
      console.log('Hashtags:', result.hashtags);
      
      if (finalContent.length > 100 && 
          !finalContent.includes('**3.') && 
          !finalContent.includes('Conclusion')) {
        console.warn('⚠️ Content may be truncated - missing expected sections');
      }

      addLog('✅ Generation successful!');
      addLog(`Title: ${result.title || 'N/A'}`);
      addLog(`Content length: ${finalContent.length} characters`);
      if (!streamingEnabled) {
        addLog(`Token usage: ${result.usage.totalTokens}`);
      }
      
      if (finalContent.length > 100 && finalContent.endsWith('...')) {
        addLog('⚠️ Content may be truncated');
      }
      
      // Ensure final content is set (in case streaming didn't complete)
      setSimpleTestResult(finalContent);
      
      toast.success(streamingEnabled 
        ? 'Content generated with streaming!' 
        : 'Content generated successfully!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Generation error:', error);
      addLog(`❌ Generation failed: ${errorMsg}`);
      toast.error(`Generation failed: ${errorMsg}`);
    } finally {
      setIsSimpleTesting(false);
    }
  };

  // RAG: Create/Update Vector DB
  const createVectorDb = async () => {
    if (!websiteUrl && !uploadedFiles?.length) {
      toast.error('Please provide a URL or upload files');
      return;
    }

    setIsCreatingDb(true);
    addLog(enableCrawl ? `Crawling website: ${websiteUrl}` : `Adding URL: ${websiteUrl}`);

    try {
      const formData = new FormData();
      
      if (websiteUrl) {
        formData.append('url', websiteUrl);
        // Add crawl options
        formData.append('crawl', enableCrawl ? 'true' : 'false');
        formData.append('maxPages', maxPages.toString());
        formData.append('maxDepth', maxDepth.toString());
      }
      
      if (uploadedFiles) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          formData.append('files', uploadedFiles[i]);
        }
      }

      const response = await fetch('http://localhost:3001/api/rag/create-db', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        addLog(`✅ Vector DB updated: ${data.stats.newChunks} chunks added`);
        addLog(`Total documents: ${data.stats.totalDocuments}`);
        
        // Show crawl info if available
        if (data.stats.crawlInfo) {
          addLog(`🌐 Crawled ${data.stats.crawlInfo.pagesCrawled} pages`);
        }
        
        toast.success(
          data.stats.crawlInfo 
            ? `Crawled ${data.stats.crawlInfo.pagesCrawled} pages, added ${data.stats.newChunks} chunks`
            : `Vector DB updated with ${data.stats.newChunks} chunks`
        );
        
        // Update stats
        setRagStats({
          initialized: true,
          count: data.stats.totalDocuments
        });
        
        // Clear inputs
        setWebsiteUrl('');
        setUploadedFiles(null);
      } else {
        throw new Error(data.message || 'Failed to create vector DB');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Vector DB creation failed: ${errorMsg}`);
      toast.error(`Failed to create vector DB: ${errorMsg}`);
    } finally {
      setIsCreatingDb(false);
    }
  };

  // RAG: Query Vector DB
  const queryRag = async () => {
    if (!ragQuery.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsQueryingRag(true);
    setRagResults(null);
    addLog(`Querying RAG: ${ragQuery}`);

    try {
      const response = await fetch('http://localhost:3001/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery, nResults: 5 })
      });

      const data = await response.json();

      if (response.ok) {
        setRagResults(data.results);
        addLog(`✅ Found ${data.results.length} relevant documents`);
      } else {
        throw new Error(data.message || 'Query failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ RAG query failed: ${errorMsg}`);
      toast.error(`Query failed: ${errorMsg}`);
    } finally {
      setIsQueryingRag(false);
    }
  };

  // RAG: Clear Vector DB
  const clearVectorDb = async () => {
    if (!confirm('Are you sure you want to clear the vector DB? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/rag/clear', {
        method: 'POST'
      });

      if (response.ok) {
        addLog('✅ Vector DB cleared');
        toast.success('Vector DB cleared');
        setRagStats({ initialized: true, count: 0 });
      }
    } catch (error) {
      toast.error('Failed to clear vector DB');
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Kimi AI Connection Test</h1>
          <p className="text-muted-foreground">Test AI connection and RAG vector database</p>
        </div>

        {/* RAG Vector DB Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              RAG Vector Database
              {ragStats && (
                <Badge variant={ragStats.count > 0 ? "default" : "secondary"}>
                  {ragStats.count} docs
                </Badge>
              )}
              <Badge variant="outline" className="text-xs font-normal">Cloud: contentHub</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Documents */}
            <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add Company Information</h4>
                <Badge variant="outline" className="text-xs">Chroma Cloud: contentHub</Badge>
              </div>
              
              {/* URL Input */}
              <div>
                <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website URL
                </Label>
                <Input
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com/about"
                  className="mt-1"
                />
              </div>

              {/* Crawl Options */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableCrawl"
                    checked={enableCrawl}
                    onChange={(e) => setEnableCrawl(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="enableCrawl" className="text-sm cursor-pointer">
                    🕷️ Crawl entire website (not just this page)
                  </Label>
                </div>
                
                {enableCrawl && (
                  <div className="flex gap-4 pl-6">
                    <div>
                      <Label htmlFor="maxPages" className="text-xs text-muted-foreground">Max Pages</Label>
                      <Input
                        id="maxPages"
                        type="number"
                        min={1}
                        max={50}
                        value={maxPages}
                        onChange={(e) => setMaxPages(parseInt(e.target.value) || 10)}
                        className="w-20 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDepth" className="text-xs text-muted-foreground">Max Depth</Label>
                      <Input
                        id="maxDepth"
                        type="number"
                        min={1}
                        max={5}
                        value={maxDepth}
                        onChange={(e) => setMaxDepth(parseInt(e.target.value) || 2)}
                        className="w-20 h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="fileUpload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Files (PDF, TXT, MD)
                </Label>
                <Input
                  id="fileUpload"
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,.json"
                  onChange={(e) => setUploadedFiles(e.target.files)}
                  className="mt-1"
                />
                {uploadedFiles && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadedFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <Button 
                onClick={createVectorDb} 
                disabled={isCreatingDb || (!websiteUrl && !uploadedFiles?.length)}
                className="w-full"
              >
                {isCreatingDb ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Database className="w-4 h-4 mr-2" />
                )}
                Add to Chroma Cloud DB
              </Button>
            </div>

            {/* Query DB */}
            <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium">Test RAG Query</h4>
              
              <div>
                <Label htmlFor="ragQuery">Query</Label>
                <Input
                  id="ragQuery"
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  placeholder="Ask a question about your company info..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={queryRag} 
                  disabled={isQueryingRag || !ragQuery.trim()}
                  variant="outline"
                >
                  {isQueryingRag ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Query DB
                </Button>
                
                <Button 
                  onClick={clearVectorDb} 
                  variant="destructive"
                  size="sm"
                >
                  Clear DB
                </Button>
              </div>

              {/* Query Results */}
              {ragResults && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-medium">Results:</h5>
                  {ragResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No relevant documents found</p>
                  ) : (
                    ragResults.map((result, i) => (
                      <div key={i} className="p-2 bg-background rounded border text-sm">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Source: {result.metadata?.source}</span>
                          <span>Score: {(1 - result.distance).toFixed(3)}</span>
                        </div>
                        <p className="line-clamp-3">{result.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Simple Test Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Simple Content Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., AI in Healthcare"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="objective">Objective</Label>
                <Textarea
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="e.g., Educate professionals about AI ethics"
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              {/* Streaming Toggle */}
              <div className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg">
                <div className="flex flex-col">
                  <Label htmlFor="streamingEnabled" className="text-sm font-medium cursor-pointer">
                    ⚡ Streaming Mode
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    See content appear in real-time as it's generated
                  </span>
                </div>
                <Switch
                  id="streamingEnabled"
                  checked={streamingEnabled}
                  onCheckedChange={setStreamingEnabled}
                />
              </div>
              
              {/* Max Tokens Selector */}
              <div className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg">
                <div className="flex flex-col">
                  <Label htmlFor="maxTokens" className="text-sm font-medium">
                    🎯 Max Tokens
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Higher = longer content, slower generation
                  </span>
                </div>
                <select
                  id="maxTokens"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="h-8 px-2 rounded border border-input bg-background text-sm"
                  disabled={isSimpleTesting}
                >
                  <option value={400}>400 (Fast)</option>
                  <option value={600}>600</option>
                  <option value={800}>800</option>
                  <option value={1000}>1000</option>
                  <option value={1200}>1200 (Default)</option>
                  <option value={1500}>1500</option>
                  <option value={2000}>2000 (Slow)</option>
                </select>
              </div>
              
              <Button 
                onClick={testSimpleGeneration} 
                disabled={isSimpleTesting} 
                className="w-full"
              >
                {isSimpleTesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate Content
              </Button>
              
              {/* Generation Timer */}
              {isSimpleTesting && (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating... {generationTime}s</span>
                </div>
              )}
            </div>

            {simpleTestResult && (
              <div className="bg-secondary/50 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">Generated Content:</h4>
                    {!isSimpleTesting && generationTime > 0 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        ⏱️ {generationTime}s
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(simpleTestResult);
                        toast.success('Content copied to clipboard');
                      }}
                    >
                      Copy Content
                    </Button>
                  </div>
                </div>
                <pre className="text-sm whitespace-pre-wrap max-h-96 overflow-auto">{simpleTestResult}</pre>
                
                {/* Generation Time Display */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {isSimpleTesting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>
                      {isSimpleTesting ? 'Generating...' : '⏱️ Total time:'} 
                      <span className="font-medium text-foreground">{generationTime}s</span>
                      <span className="text-xs ml-2">({maxTokens} tokens)</span>
                    </span>
                  </div>
                  {!isSimpleTesting && generationTime > 0 && (
                    <span className="text-xs">{generationTime < 10 ? '⚡ Fast' : generationTime < 30 ? '✓ Normal' : '🐢 Slow'}</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">API URL:</span>
                <code className="ml-2 bg-secondary px-2 py-1 rounded">
                  {import.meta.env.VITE_KIMI_API_URL || 'Not set'}
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">Model:</span>
                <code className="ml-2 bg-secondary px-2 py-1 rounded">
                  {import.meta.env.VITE_KIMI_MODEL || 'Not set'}
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">App ID:</span>
                <Badge variant={import.meta.env.VITE_KIMI_APP_ID ? 'default' : 'destructive'}>
                  {import.meta.env.VITE_KIMI_APP_ID ? 'Set' : 'Missing'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">API Key:</span>
                <Badge variant={import.meta.env.VITE_KIMI_API_KEY ? 'default' : 'destructive'}>
                  {import.meta.env.VITE_KIMI_API_KEY ? 'Set' : 'Missing'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={checkStatus} disabled={isChecking}>
                {isChecking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Check Connection
              </Button>
              
              {status && (
                <div className="flex items-center gap-2">
                  {status.available ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={status.available ? 'text-green-600' : 'text-red-600'}>
                    {status.message}
                  </span>
                </div>
              )}
            </div>

            {status?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <strong>Error Details:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{status.error}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Generation (Advanced) */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Test Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button onClick={testGeneration} disabled={isTesting} variant="outline">
                {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Test with Full Brief
              </Button>
              <Button onClick={testMockGeneration} variant="ghost">
                Test Mock Mode
              </Button>
            </div>

            {testResult && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Generated Content:</h4>
                <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Debug Logs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg h-64 overflow-auto">
              {logs.length === 0 ? (
                <span className="text-gray-500">No logs yet...</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="break-all">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-medium">RAG not working:</span>
                <span className="text-muted-foreground">
                  Make sure to create the vector DB first. Upload files or add a URL, then click "Create/Update Vector DB".
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">401 Unauthorized:</span>
                <span className="text-muted-foreground">
                  API key is invalid or expired. Verify your credentials in the .env file.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium">File upload fails:</span>
                <span className="text-muted-foreground">
                  Supported formats: PDF, TXT, MD, JSON. Max file size: 50MB.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default KimiTestPage;
