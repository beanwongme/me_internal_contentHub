import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plug, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Trash2, 
  Edit,
  Check,
  Globe,
  Webhook,
  Key
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface APIChannel {
  id: string;
  name: string;
  type: 'webhook' | 'rest' | 'graphql';
  endpoint: string;
  status: 'active' | 'inactive' | 'error';
  lastUsed?: string;
  createdAt: string;
}

const mockApiChannels: APIChannel[] = [
  {
    id: '1',
    name: 'CRM Integration',
    type: 'webhook',
    endpoint: 'https://api.contenthub.io/webhooks/crm',
    status: 'active',
    lastUsed: '2024-03-10T14:30:00Z',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'External CMS',
    type: 'rest',
    endpoint: 'https://api.contenthub.io/v1/cms',
    status: 'active',
    lastUsed: '2024-03-09T10:15:00Z',
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Analytics Export',
    type: 'rest',
    endpoint: 'https://api.contenthub.io/v1/analytics',
    status: 'inactive',
    createdAt: '2024-02-20T00:00:00Z'
  }
];

const channelTypes = [
  { value: 'webhook', label: 'Webhook', icon: Webhook },
  { value: 'rest', label: 'REST API', icon: Globe },
  { value: 'graphql', label: 'GraphQL', icon: Plug }
];

export function ApiPage() {
  const [apiChannels, setApiChannels] = useState<APIChannel[]>(mockApiChannels);
  const [isCreating, setIsCreating] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiToken = 'ch_live_51H8m...xYz789';

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateToken = () => {
    // Simulate token regeneration
    console.log('Regenerating token...');
  };

  const handleDelete = (id: string) => {
    setApiChannels(prev => prev.filter(c => c.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppShell>
      <Header 
        title="API Management" 
        subtitle="Configure and manage API integrations for external systems."
        actions={
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create API Channel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Channel Name</Label>
                  <Input placeholder="e.g. CRM Integration" />
                </div>
                <div className="space-y-2">
                  <Label>Channel Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {channelTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Endpoint URL</Label>
                  <Input placeholder="https://your-endpoint.com/webhook" />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input placeholder="What does this integration do?" />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCreating(false)}>
                    Create Channel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mt-8 space-y-6">
        <Tabs defaultValue="channels">
          <TabsList className="bg-secondary">
            <TabsTrigger value="channels">API Channels</TabsTrigger>
            <TabsTrigger value="tokens">API Tokens</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-6">
            <div className="grid gap-4">
              {apiChannels.map((channel, index) => {
                const TypeIcon = channelTypes.find(t => t.value === channel.type)?.icon || Plug;
                
                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="bg-card border-border">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <TypeIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{channel.name}</h3>
                                <Badge className={cn('text-xs', getStatusColor(channel.status))}>
                                  {channel.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 font-mono">
                                {channel.endpoint}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="capitalize">{channel.type}</span>
                                {channel.lastUsed && (
                                  <span>
                                    Last used: {new Date(channel.lastUsed).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(channel.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {apiChannels.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-medium">No API channels yet</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    Create your first API channel to integrate with external systems
                  </p>
                  <Button className="mt-6 gap-2" onClick={() => setIsCreating(true)}>
                    <Plus className="w-4 h-4" />
                    Create Channel
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tokens" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Token
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your API Token</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showToken ? 'text' : 'password'}
                        value={apiToken}
                        readOnly
                        className="pr-20 font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyToken}
                      className={cn(copied && 'text-success')}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this token to authenticate API requests. Keep it secure!
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Token Management</Label>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={handleRegenerateToken}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate Token
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Regenerating will invalidate the current token immediately
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Requests per minute</p>
                      <p className="text-sm text-muted-foreground">Current plan limit</p>
                    </div>
                    <Badge variant="secondary">1,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Requests per hour</p>
                      <p className="text-sm text-muted-foreground">Current plan limit</p>
                    </div>
                    <Badge variant="secondary">10,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Requests per day</p>
                      <p className="text-sm text-muted-foreground">Current plan limit</p>
                    </div>
                    <Badge variant="secondary">100,000</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="font-medium mb-2">Base URL</h4>
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                    https://api.contenthub.io/v1
                  </code>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Include your API token in the Authorization header:
                  </p>
                  <code className="block text-sm font-mono bg-background px-3 py-2 rounded">
                    Authorization: Bearer {'{your_api_token}'}
                  </code>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Available Endpoints</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">GET</Badge>
                      <code>/content</code>
                      <span className="text-muted-foreground">- List all content</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">GET</Badge>
                      <code>/content/{'{id}'}</code>
                      <span className="text-muted-foreground">- Get content by ID</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">POST</Badge>
                      <code>/content</code>
                      <span className="text-muted-foreground">- Create new content</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">GET</Badge>
                      <code>/analytics</code>
                      <span className="text-muted-foreground">- Get analytics data</span>
                    </li>
                  </ul>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Globe className="w-4 h-4" />
                  View Full Documentation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
