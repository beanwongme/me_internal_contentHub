import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Image, 
  Key, 
  Globe, 
  Tag,
  Save,
  Check,
  RefreshCw,
  Database,
  Plus,
  Trash2,
  Edit,
  Bot,
  Languages,
  Plug,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { kimiAIProvider } from '@/services/kimiAi';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { mockAIAgents, mockKeywordPools, mockChannels } from '@/data/mockData';

export function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [kimiStatus, setKimiStatus] = useState<{ available: boolean; message: string; error?: string } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    checkKimiStatus();
  }, []);

  const checkKimiStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await kimiAIProvider.checkStatus();
      setKimiStatus(status);
    } catch (error) {
      setKimiStatus({ 
        available: false, 
        message: 'Failed to check status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <Header 
        title="Settings" 
        subtitle="Configure your ContentHub workspace."
        actions={
          <Button 
            className="gap-2" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </Button>
        }
      />
      
      <div className="mt-8">
        <Tabs defaultValue="ai-agents" className="space-y-6">
          <TabsList className="bg-secondary flex-wrap h-auto gap-1">
            <TabsTrigger value="ai-agents" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="channels" className="gap-2">
              <Globe className="w-4 h-4" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="master-data" className="gap-2">
              <Database className="w-4 h-4" />
              Master Data
            </TabsTrigger>
            <TabsTrigger value="language" className="gap-2">
              <Languages className="w-4 h-4" />
              Language
            </TabsTrigger>
            <TabsTrigger value="keywords" className="gap-2">
              <Tag className="w-4 h-4" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Key className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* AI Agents */}
          <TabsContent value="ai-agents" className="space-y-6">
            {/* AI Provider Selection */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Provider Selection
                </CardTitle>
                <CardDescription>
                  Choose between ContentHub bundled KIMI AI or use your own AI provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <span className="font-medium">ContentHub Bundled KIMI AI</span>
                      </div>
                      {kimiStatus && (
                        <Badge 
                          variant="secondary" 
                          className={kimiStatus.available ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}
                        >
                          {kimiStatus.available ? 'Connected' : 'Error'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use our pre-configured KIMI AI agents. No additional setup required.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="">Current Plan</Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={checkKimiStatus}
                        disabled={isCheckingStatus}
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                        {isCheckingStatus ? 'Checking...' : 'Refresh'}
                      </Button>
                      <Link to="/test/kimi">
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Test Connection
                        </Button>
                      </Link>
                    </div>
                    {kimiStatus?.error && (
                      <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{kimiStatus.error}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Bring Your Own AI</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect your own OpenAI, Claude, or other AI provider API keys.
                    </p>
                    <Badge variant="secondary" className="mt-2">Advanced Plan</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {mockAIAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {agent.type === 'research' && <Search className="w-5 h-5 text-primary" />}
                          {agent.type === 'writing' && <Sparkles className="w-5 h-5 text-primary" />}
                          {agent.type === 'image' && <Image className="w-5 h-5 text-primary" />}
                          <CardTitle className="font-heading text-lg">{agent.name}</CardTitle>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            'text-xs',
                            agent.status === 'active' && 'bg-success/20 text-success'
                          )}
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Configure your {agent.type} AI agent settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Provider</Label>
                        <Select defaultValue={agent.provider.toLowerCase()}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {agent.type === 'research' && (
                              <>
                                <SelectItem value="perplexity">Perplexity</SelectItem>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="claude">Claude</SelectItem>
                              </>
                            )}
                            {agent.type === 'writing' && (
                              <>
                                <SelectItem value="claude">Claude</SelectItem>
                                <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                                <SelectItem value="gemini">Google Gemini</SelectItem>
                              </>
                            )}
                            {agent.type === 'image' && (
                              <>
                                <SelectItem value="dall-e">DALL-E 3</SelectItem>
                                <SelectItem value="midjourney">Midjourney</SelectItem>
                                <SelectItem value="flux">Flux</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Model</Label>
                        <Select defaultValue={agent.model.toLowerCase().replace(/\s+/g, '-')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={agent.model.toLowerCase().replace(/\s+/g, '-')}>
                              {agent.model}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {agent.config.temperature !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Temperature</Label>
                            <span className="text-sm text-muted-foreground">
                              {agent.config.temperature}
                            </span>
                          </div>
                          <Slider 
                            defaultValue={[agent.config.temperature * 100]} 
                            max={100}
                            step={10}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input 
                          type="password" 
                          value="sk-••••••••••••••••••••••••••••••"
                          readOnly
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Channels */}
          <TabsContent value="channels" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {mockChannels.map((channel, index) => (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            {channel.name[0]}
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{channel.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {channel.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              'text-xs',
                              channel.connected 
                                ? 'bg-success/20 text-success' 
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {channel.connected ? 'Connected' : 'Not Connected'}
                          </Badge>
                          <Switch checked={channel.connected} />
                        </div>
                      </div>
                      
                      {/* API Config for Channel */}
                      {channel.connected && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="space-y-2">
                            <Label className="text-xs flex items-center gap-1">
                              <Plug className="w-3 h-3" />
                              API Configuration
                            </Label>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                value="token_••••••••••••"
                                className="text-sm h-8"
                                readOnly
                              />
                              <Button variant="outline" size="sm" className="h-8">
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Master Data */}
          <TabsContent value="master-data" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Content Types */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Content Types</span>
                    <Button size="sm" className="gap-1">
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Product', 'Thought Leadership', 'Company News', 'Customer Story', 'Promotional'].map((type) => (
                      <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <span className="text-sm">{type}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Content Tags</span>
                    <Button size="sm" className="gap-1">
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['AI', 'Technology', 'Product', 'Launch', 'Company', 'News', 'Case Study', 'Promotion'].map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1">
                        {tag}
                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Categories */}
              <Card className="bg-card border-border md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Product Categories</span>
                    <Button size="sm" className="gap-1">
                      <Plus className="w-4 h-4" />
                      Add Category
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { name: 'Hardware', subcategories: ['IoT Devices', 'Sensors', 'Controllers'] },
                      { name: 'Software', subcategories: ['SaaS', 'Mobile Apps', 'Desktop'] },
                      { name: 'Services', subcategories: ['Consulting', 'Support', 'Training'] }
                    ].map((cat) => (
                      <div key={cat.name} className="p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{cat.name}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {cat.subcategories.map((sub) => (
                            <Badge key={sub} variant="outline" className="text-xs">
                              {sub}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Language Settings */}
          <TabsContent value="language" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  UI Language
                </CardTitle>
                <CardDescription>
                  Select your preferred interface language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select defaultValue="en">
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh-HK">Traditional Chinese (繁體中文)</SelectItem>
                    <SelectItem value="ja">Japanese (日本語)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Content Languages
                </CardTitle>
                <CardDescription>
                  Select up to 4 languages for content creation (English is always included)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { code: 'en', name: 'English', flag: '🇬🇧', default: true },
                    { code: 'zh-HK', name: 'Traditional Chinese', flag: '🇭🇰' },
                    { code: 'zh-CN', name: 'Simplified Chinese', flag: '🇨🇳' },
                    { code: 'yue', name: 'Cantonese', flag: '🇭🇰' },
                    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
                    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
                    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
                    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
                    { code: 'fr', name: 'French', flag: '🇫🇷' }
                  ].map((lang) => (
                    <label 
                      key={lang.code}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        lang.default 
                          ? 'border-primary bg-primary/5 cursor-not-allowed' 
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <input 
                        type="checkbox" 
                        defaultChecked={lang.default}
                        disabled={lang.default}
                        className="rounded"
                      />
                      <span className="text-lg">{lang.flag}</span>
                      <div className="flex-1">
                        <span className="text-sm font-medium">{lang.name}</span>
                        {lang.default && (
                          <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Selected: 1/4 languages (English is always included)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keywords */}
          <TabsContent value="keywords" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold">Keyword Pools</h2>
                <p className="text-sm text-muted-foreground">
                  Manage the keywords your Research Agent monitors
                </p>
              </div>
              <Button className="gap-2">
                <Sparkles className="w-4 h-4" />
                Add Pool
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {mockKeywordPools.map((pool, index) => (
                <motion.div
                  key={pool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={cn(
                    'bg-card border-border',
                    !pool.active && 'opacity-60'
                  )}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{pool.name}</h3>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                'text-xs capitalize',
                                pool.priority === 'high' && 'bg-destructive/20 text-destructive',
                                pool.priority === 'medium' && 'bg-warning/20 text-warning',
                                pool.priority === 'low' && 'bg-muted text-muted-foreground'
                              )}
                            >
                              {pool.priority}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {pool.keywords.map((keyword) => (
                              <Badge key={keyword} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Switch checked={pool.active} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Account */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Workspace Settings</CardTitle>
                <CardDescription>
                  Manage your workspace configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Workspace Name</Label>
                  <Input defaultValue="Acme Ltd" />
                </div>

                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh-HK">Traditional Chinese</SelectItem>
                      <SelectItem value="zh-CN">Simplified Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        Receive email updates about content status
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Slack Integration</p>
                      <p className="text-xs text-muted-foreground">
                        Send notifications to Slack
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
