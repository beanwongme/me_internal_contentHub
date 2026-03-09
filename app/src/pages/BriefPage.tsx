import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Save, 
  Target,
  Users,
  MessageSquare,
  FileText,
  Globe,
  Languages,
  Loader2
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { mockIdeas, mockChannels } from '@/data/mockData';
import { kimiAIProvider, mockGenerateContent } from '@/services/kimiAi';
import type { ContentBrief } from '@/types';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh-HK', name: '繁體中文 (香港)' },
  { code: 'zh-CN', name: '简体中文' },
];

// Use mock mode for development (set to false to use real API)
const USE_MOCK_MODE = false;

export function BriefPage() {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const idea = mockIdeas.find(i => i.id === ideaId);

  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: idea?.headline || '',
    objective: '',
    targetAudience: '',
    keywords: idea?.keywords.join(', ') || '',
    talkingPoints: '',
    callToAction: '',
    channels: [] as string[],
    length: 'medium' as 'short' | 'medium' | 'long',
    language: 'en',
    tone: {
      formality: 50,
      enthusiasm: 70,
      complexity: 50
    }
  });

  if (!idea) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-xl font-semibold">Idea not found</h2>
          <Button className="mt-4" onClick={() => navigate('/ideas')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ideas
          </Button>
        </div>
      </AppShell>
    );
  }

  const handleChannelToggle = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const getToneLabel = () => {
    const { formality, enthusiasm } = formData.tone;
    if (formality > 70 && enthusiasm < 40) return 'professional';
    if (formality < 40 && enthusiasm > 70) return 'casual';
    if (formality > 70 && enthusiasm > 70) return 'enthusiastic professional';
    if (formality < 40 && enthusiasm < 40) return 'conversational';
    return 'balanced';
  };

  const handleSave = () => {
    console.log('Saving brief:', formData);
    toast.success('Brief saved successfully!');
    navigate('/ideas');
  };

  const handleGenerate = async () => {
    if (formData.channels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    setIsGenerating(true);

    try {
      const contentBrief: ContentBrief = {
        title: formData.topic,
        objective: formData.objective || idea.summary,
        targetAudience: formData.targetAudience,
        keyMessages: formData.talkingPoints.split('\n').filter(p => p.trim()),
        callToAction: formData.callToAction,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        length: formData.length,
        channels: formData.channels
      };

      const tone = getToneLabel();

      if (USE_MOCK_MODE) {
        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate mock content for each selected channel
        const generatedContent: Record<string, { content: string; title?: string }> = {};
        
        for (const channelId of formData.channels) {
          const mockResult = mockGenerateContent({
            brief: contentBrief,
            tone,
            channel: channelId,
            language: formData.language,
          });
          generatedContent[channelId] = {
            content: mockResult.content,
            title: mockResult.title
          };
        }

        // Store generated content in session storage for the content studio
        sessionStorage.setItem('generatedContent', JSON.stringify({
          brief: formData,
          content: generatedContent
        }));

        toast.success('Content generated successfully! (Mock Mode)');
      } else {
        // Use real Kimi AI API
        const results = await kimiAIProvider.generateMultiChannelContent(
          contentBrief,
          formData.channels,
          tone
        );

        const generatedContent: Record<string, { content: string; title?: string }> = {};
        for (const [channelId, result] of Object.entries(results)) {
          generatedContent[channelId] = {
            content: result.content,
            title: result.title
          };
        }

        sessionStorage.setItem('generatedContent', JSON.stringify({
          brief: formData,
          content: generatedContent
        }));

        toast.success('Content generated with Kimi AI!');
      }

      navigate('/social-content/new');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/ideas')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Convert to Brief</h1>
            <p className="text-muted-foreground">Transform this idea into a content brief with Kimi AI</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} disabled={isGenerating}>
            <Save className="w-4 h-4 mr-2" />
            Save Brief
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || formData.channels.length === 0}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Original Idea */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Original Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{idea.headline}</h3>
                <p className="text-muted-foreground mt-2">{idea.summary}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Source:</span>
                <a 
                  href={idea.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {idea.source}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Relevance:</span>
                <Badge variant={idea.relevanceScore >= 80 ? 'default' : 'secondary'}>
                  {idea.relevanceScore}%
                </Badge>
              </div>

              <Separator />

              <div>
                <span className="text-sm text-muted-foreground">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {idea.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* AI Provider Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Kimi K2.5</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ContentHub Bundled AI Provider for high-quality content generation.
                </p>
                {USE_MOCK_MODE && (
                  <p className="text-xs text-amber-500 mt-1">
                    Mock mode enabled
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Brief Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Content Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic / Headline</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Enter content topic..."
                />
              </div>

              {/* Objective */}
              <div className="space-y-2">
                <Label htmlFor="objective">
                  <Target className="w-4 h-4 inline mr-1" />
                  Objective
                </Label>
                <Textarea
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="What do you want to achieve with this content?"
                  className="min-h-[80px]"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="audience">
                  <Users className="w-4 h-4 inline mr-1" />
                  Target Audience
                </Label>
                <Input
                  id="audience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g. Marketing professionals, C-suite executives..."
                />
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="e.g. AI, technology, innovation..."
                />
              </div>

              {/* Talking Points */}
              <div className="space-y-2">
                <Label htmlFor="talkingPoints">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Key Talking Points (one per line)
                </Label>
                <Textarea
                  id="talkingPoints"
                  value={formData.talkingPoints}
                  onChange={(e) => setFormData(prev => ({ ...prev, talkingPoints: e.target.value }))}
                  placeholder="List the main points to cover..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Call to Action */}
              <div className="space-y-2">
                <Label htmlFor="callToAction">Call to Action</Label>
                <Input
                  id="callToAction"
                  value={formData.callToAction}
                  onChange={(e) => setFormData(prev => ({ ...prev, callToAction: e.target.value }))}
                  placeholder="What action should readers take?"
                />
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Language
                </Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
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
              </div>

              {/* Channels */}
              <div className="space-y-2">
                <Label>
                  <Globe className="w-4 h-4 inline mr-1" />
                  Target Channels
                </Label>
                <div className="flex flex-wrap gap-2">
                  {mockChannels.filter(c => c.type === 'social').map((channel) => (
                    <Button
                      key={channel.id}
                      type="button"
                      variant={formData.channels.includes(channel.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleChannelToggle(channel.id)}
                    >
                      {channel.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content Length */}
              <div className="space-y-2">
                <Label>Content Length</Label>
                <div className="flex gap-2">
                  {(['short', 'medium', 'long'] as const).map((length) => (
                    <Button
                      key={length}
                      type="button"
                      variant={formData.length === length ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, length }))}
                      className="flex-1 capitalize"
                    >
                      {length}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tone Settings */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Tone & Manner
                </Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Casual</span>
                      <span>Formal</span>
                    </div>
                    <Slider
                      value={[formData.tone.formality]}
                      onValueChange={([value]) => setFormData(prev => ({ 
                        ...prev, 
                        tone: { ...prev.tone, formality: value }
                      }))}
                      max={100}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subdued</span>
                      <span>Enthusiastic</span>
                    </div>
                    <Slider
                      value={[formData.tone.enthusiasm]}
                      onValueChange={([value]) => setFormData(prev => ({ 
                        ...prev, 
                        tone: { ...prev.tone, enthusiasm: value }
                      }))}
                      max={100}
                      step={10}
                    />
                  </div>

                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Detected tone: <span className="font-medium text-foreground capitalize">{getToneLabel()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}

export default BriefPage;
