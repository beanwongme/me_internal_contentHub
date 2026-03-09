import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Globe, 
  Tag,
  Eye,
  Share2,
  MessageSquare,
  ThumbsUp,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AtSign,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Globe2,
  MessageSquareText
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockContents, mockChannels } from '@/data/mockData';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  review: 'bg-warning/20 text-warning',
  approved: 'bg-success/20 text-success',
  scheduled: 'bg-info/20 text-info',
  published: 'bg-primary/20 text-primary',
  archived: 'bg-muted text-muted-foreground'
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  review: 'In Review',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived'
};

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  thread: AtSign,
  wordpress: Globe2,
  slack: MessageSquareText
};

// Mock content variations for different channels
const mockChannelContent: Record<string, Record<string, string>> = {
  '1': {
    linkedin: `AI Ethics in Healthcare: What You Need to Know

As healthcare organizations increasingly adopt AI technologies, ethical considerations have become paramount. Here are key insights for industry leaders:

1. Data Privacy & Security
Patient data protection remains the foundation of ethical AI implementation. Organizations must ensure robust security measures and transparent data handling practices.

2. Algorithmic Bias
AI systems can perpetuate existing biases in healthcare. Regular audits and diverse training data are essential to ensure equitable outcomes for all patient populations.

3. Human Oversight
AI should augment, not replace, clinical decision-making. Maintaining human oversight ensures accountability and preserves the doctor-patient relationship.

What ethical challenges is your organization facing with AI adoption?`,
    twitter: `AI Ethics in Healthcare: 3 Key Considerations 

1. Data Privacy - Protect patient data with robust security
2. Algorithmic Bias - Audit systems for equitable outcomes  
3. Human Oversight - AI augments, doesn't replace, clinicians

The future of healthcare AI depends on getting ethics right from the start.

#AI #Healthcare #Ethics #DigitalHealth`,
    facebook: `AI Ethics in Healthcare: What You Need to Know

Healthcare is being transformed by artificial intelligence, but with great power comes great responsibility. Here are the key ethical considerations every healthcare leader should know:

Data Privacy & Security
Patient data protection is non-negotiable. Organizations must implement comprehensive security measures and maintain transparency about data usage.

Algorithmic Bias
AI systems trained on biased data can produce biased outcomes. Regular audits and diverse datasets are crucial for ensuring all patients receive equitable care.

Human Oversight
Technology should enhance, not replace, human judgment. Maintaining clinician oversight ensures accountability and preserves quality patient care.

What steps is your organization taking to ensure ethical AI implementation?`,
    thread: `AI ethics in healthcare isn't just about compliance—it's about building trust.

3 things that matter:
→ Patient data must be protected like the precious resource it is
→ Algorithms need regular bias checks  
→ Human doctors should always have the final say

The best AI in healthcare amplifies human expertise, not replaces it.`,
    wordpress: `<h2>AI Ethics in Healthcare: A Comprehensive Guide</h2>

<p>The integration of artificial intelligence into healthcare systems presents unprecedented opportunities for improving patient outcomes and operational efficiency. However, these advances also raise critical ethical considerations that healthcare organizations must address proactively.</p>

<h3>Data Privacy and Security</h3>
<p>Patient data represents some of the most sensitive personal information. Healthcare organizations implementing AI solutions must establish robust security frameworks that protect patient privacy while enabling the data analysis that powers AI insights.</p>

<h3>Algorithmic Fairness</h3>
<p>AI systems can inadvertently perpetuate or amplify existing biases in healthcare delivery. Organizations must implement regular bias audits and ensure training data represents diverse patient populations.</p>

<h3>Human-AI Collaboration</h3>
<p>The most effective healthcare AI implementations treat artificial intelligence as a tool that augments human expertise rather than replacing it. Maintaining meaningful human oversight ensures accountability and preserves the essential elements of patient care.</p>`
  }
};

export function ContentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = mockContents.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPreviewChannel, setSelectedPreviewChannel] = useState<string>('all');

  if (!content) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-xl font-semibold">Content not found</h2>
          <Button className="mt-4" onClick={() => navigate('/social-content')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Social Content
          </Button>
        </div>
      </AppShell>
    );
  }

  const getChannelContent = (channelId: string) => {
    const channel = mockChannels.find(c => c.id === channelId);
    if (!channel) return null;
    
    const contentVariations = mockChannelContent[content.id];
    if (!contentVariations) return null;
    
    return contentVariations[channel.platform] || contentVariations.linkedin;
  };

  const getChannelIcon = (platform: string) => {
    const Icon = channelIcons[platform] || Globe;
    return Icon;
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/social-content')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold line-clamp-1">{content.title}</h1>
              <Badge className={cn('text-xs', statusColors[content.status])}>
                {statusLabels[content.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {content.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {content.status === 'draft' && (
            <Button variant="outline" onClick={() => navigate(`/social-content/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {content.status === 'draft' && (
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Submit for Review
            </Button>
          )}
          {content.status === 'review' && (
            <>
              <Button variant="outline" className="gap-2">
                <XCircle className="w-4 h-4" />
                Request Changes
              </Button>
              <Button className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          {content.performance && (
            <TabsTrigger value="performance">Performance</TabsTrigger>
          )}
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Content Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-muted-foreground">
                        Content preview would be displayed here. This includes the full text,
                        formatted for the selected channels.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Channels */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Distribution Channels
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {content.channels.map((channel) => {
                        const ChannelIcon = getChannelIcon(channel.platform);
                        return (
                          <div 
                            key={channel.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary"
                          >
                            <ChannelIcon className="w-4 h-4 text-primary" />
                            <span className="text-sm">{channel.name}</span>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                'text-xs',
                                channel.connected ? 'bg-success/20 text-success' : 'bg-muted'
                              )}
                            >
                              {channel.connected ? 'Connected' : 'Pending'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm">Author</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={content.author.avatar} />
                        <AvatarFallback>
                          {content.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{content.author.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {content.author.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Dates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{new Date(content.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {content.scheduledAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Scheduled</span>
                        <span>{new Date(content.scheduledAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {content.publishedAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Published</span>
                        <span>{new Date(content.publishedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Keywords */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {content.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Channel Preview</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Preview for:</span>
                <Select value={selectedPreviewChannel} onValueChange={setSelectedPreviewChannel}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    {content.channels.map((channel) => {
                      const ChannelIcon = getChannelIcon(channel.platform);
                      return (
                        <SelectItem key={channel.id} value={channel.id}>
                          <div className="flex items-center gap-2">
                            <ChannelIcon className="w-4 h-4" />
                            {channel.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedPreviewChannel === 'all' ? (
                <div className="space-y-4">
                  {content.channels.map((channel) => {
                    const ChannelIcon = getChannelIcon(channel.platform);
                    const channelContent = getChannelContent(channel.id);
                    return (
                      <div key={channel.id} className="border border-border rounded-lg overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
                          <ChannelIcon className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{channel.name}</span>
                        </div>
                        <div className="p-4">
                          <pre className="whitespace-pre-wrap font-body text-sm text-foreground">
                            {channelContent || 'Content variation for this channel will be generated based on the template.'}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  {(() => {
                    const channel = content.channels.find(c => c.id === selectedPreviewChannel);
                    if (!channel) return null;
                    const ChannelIcon = getChannelIcon(channel.platform);
                    const channelContent = getChannelContent(channel.id);
                    return (
                      <>
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
                          <ChannelIcon className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{channel.name}</span>
                        </div>
                        <div className="p-4">
                          <pre className="whitespace-pre-wrap font-body text-sm text-foreground">
                            {channelContent || 'Content variation for this channel will be generated based on the template.'}
                          </pre>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {content.performance && (
          <TabsContent value="performance">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Views</p>
                      <p className="text-2xl font-bold">{content.performance.views.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <ThumbsUp className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                      <p className="text-2xl font-bold">{content.performance.engagement}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-info/10">
                      <Share2 className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Shares</p>
                      <p className="text-2xl font-bold">{content.performance.shares}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <MessageSquare className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="text-2xl font-bold">{content.performance.clicks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="history">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="text-sm">Content created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(content.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="text-sm">Last updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(content.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {content.publishedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-2" />
                    <div>
                      <p className="text-sm">Published</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(content.publishedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
