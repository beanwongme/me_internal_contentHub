import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppShell } from '@/components/layout/AppShell';
import { kimiAIProvider, mockGenerateContent } from '@/services/kimiAi';
import { 
  Zap, 
  Clock, 
  RefreshCw, 
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  id: string;
  type: 'api' | 'cache' | 'mock';
  duration: number;
  timestamp: Date;
  content?: string;
}

export function SpeedTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [cacheStats, setCacheStats] = useState<{ hits: number; misses: number; hitRate: string } | null>(null);

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/cache/stats');
      if (response.ok) {
        const data = await response.json();
        setCacheStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    }
  };

  useEffect(() => {
    fetchCacheStats();
    const interval = setInterval(fetchCacheStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const runSpeedTest = async (type: 'api' | 'cache' | 'mock') => {
    const testId = `${type}-${Date.now()}`;
    const startTime = Date.now();

    try {
      if (type === 'mock') {
        // Mock generation (instant)
        mockGenerateContent({
          brief: {
            title: 'Speed Test',
            objective: 'Testing generation speed',
            targetAudience: 'Developers',
            keyMessages: ['Speed matters', 'Performance counts']
          },
          channel: 'linkedin'
        });
      } else {
        // Real API or cache test
        await kimiAIProvider.generateContent({
          brief: {
            title: 'Speed Test Sample',
            objective: 'Test the Kimi AI generation speed with a sample brief',
            targetAudience: 'Testers',
            keyMessages: ['Testing speed', 'Performance check', 'Response time'],
            callToAction: 'Check the results'
          },
          tone: 'professional',
          channel: 'linkedin',
          language: 'en',
          maxTokens: 500
        });
      }

      const duration = Date.now() - startTime;
      
      setResults(prev => [{
        id: testId,
        type,
        duration,
        timestamp: new Date()
      }, ...prev].slice(0, 10));

      return duration;
    } catch (error) {
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const runFullTest = async () => {
    setIsTesting(true);
    setResults([]);

    toast.info('Starting speed test... This may take 15-30 seconds');

    // Test 1: Mock mode (baseline)
    toast.info('Test 1/3: Mock mode (instant)...');
    await runSpeedTest('mock');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: First API call (cache miss)
    toast.info('Test 2/3: First API call (cache miss - ~5-10s)...');
    await runSpeedTest('api');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: Second API call (cache hit)
    toast.info('Test 3/3: Second API call (cache hit - should be instant)...');
    await runSpeedTest('cache');

    toast.success('Speed test complete!');
    setIsTesting(false);
    fetchCacheStats();
  };

  const clearCache = async () => {
    try {
      const response = await fetch('http://localhost:3001/cache/clear', { method: 'POST' });
      if (response.ok) {
        toast.success('Cache cleared');
        fetchCacheStats();
      }
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const getAverageTime = (type: string) => {
    const typeResults = results.filter(r => r.type === type);
    if (typeResults.length === 0) return null;
    const avg = typeResults.reduce((sum, r) => sum + r.duration, 0) / typeResults.length;
    return avg.toFixed(0);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Speed Test
          </h1>
          <p className="text-muted-foreground">
            Compare API response times: First request vs Cached request
          </p>
        </div>

        {/* Cache Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="w-4 h-4" />
              Proxy Cache Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cacheStats ? (
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{cacheStats.hits}</div>
                  <div className="text-xs text-muted-foreground">Cache Hits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{cacheStats.misses}</div>
                  <div className="text-xs text-muted-foreground">Cache Misses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{cacheStats.hitRate}</div>
                  <div className="text-xs text-muted-foreground">Hit Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{getAverageTime('cache') || '0'}ms</div>
                  <div className="text-xs text-muted-foreground">Avg Cached</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Proxy server not running. Start it to see cache stats.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Performance Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This test will:
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Run mock mode (instant baseline)</li>
                <li>Make first API call (5-10 seconds - cache miss)</li>
                <li>Make identical API call (should be instant - cache hit)</li>
              </ol>
            </p>

            <div className="flex gap-3">
              <Button 
                onClick={runFullTest} 
                disabled={isTesting}
                className="gap-2"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {isTesting ? 'Running Test...' : 'Run Speed Test'}
              </Button>

              <Button 
                variant="outline" 
                onClick={clearCache}
                disabled={isTesting}
              >
                Clear Cache
              </Button>
            </div>

            {isTesting && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Testing in progress... First API call takes 5-10 seconds</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Test Results (Last 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result) => (
                  <div 
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="secondary"
                        className={
                          result.type === 'mock' ? 'bg-gray-100' :
                          result.type === 'cache' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }
                      >
                        {result.type === 'mock' && 'Mock'}
                        {result.type === 'cache' && 'Cache Hit'}
                        {result.type === 'api' && 'API Call'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${
                        result.duration < 100 ? 'text-green-600' :
                        result.duration < 1000 ? 'text-yellow-600' :
                        'text-blue-600'
                      }`}>
                        {result.duration}ms
                      </span>
                      {result.type === 'cache' && result.duration < 100 && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Mock Mode</div>
                  <div className="text-xl font-bold">{getAverageTime('mock') || '--'}ms</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">API (First)</div>
                  <div className="text-xl font-bold">{getAverageTime('api') || '--'}ms</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Cached</div>
                  <div className="text-xl font-bold text-green-600">{getAverageTime('cache') || '--'}ms</div>
                </div>
              </div>

              {results.some(r => r.type === 'api') && results.some(r => r.type === 'cache') && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">
                      Speed Improvement: {' '}
                      {(() => {
                        const apiAvg = parseInt(getAverageTime('api') || '0');
                        const cacheAvg = parseInt(getAverageTime('cache') || '0');
                        if (apiAvg && cacheAvg) {
                          const improvement = ((apiAvg - cacheAvg) / apiAvg * 100).toFixed(0);
                          return `${improvement}% faster with caching!`;
                        }
                        return 'Run both tests to see improvement';
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Explanation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Why Caching Matters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>First Request (Cache Miss):</strong>
              <br />
              Browser → Proxy → Kimi API → AI Processing → Response
              <br />
              <span className="text-muted-foreground">Takes 5-10 seconds for AI to generate content</span>
            </p>
            <p>
              <strong>Second Request (Cache Hit):</strong>
              <br />
              Browser → Proxy (cached response)
              <br />
              <span className="text-green-600">Takes &lt;100ms - instant response!</span>
            </p>
            <p className="text-muted-foreground">
              The proxy server caches identical requests for 5 minutes, making repeated content generation nearly instant.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default SpeedTestPage;
