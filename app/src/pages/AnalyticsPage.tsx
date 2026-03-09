import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MessageSquare, 
  Share2, 
  ThumbsUp,
  Calendar,
  Download,
  Linkedin,
  Twitter,
  Facebook,
  Instagram
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock analytics data
const mockAnalyticsData = {
  overview: {
    totalVisitors: 45230,
    visitorChange: 12.5,
    totalInteractions: 8750,
    interactionChange: 8.3,
    engagementRate: 4.2,
    engagementChange: -1.2,
    totalShares: 1234,
    shareChange: 15.7
  },
  byChannel: [
    { 
      id: '1', 
      name: 'LinkedIn', 
      icon: Linkedin,
      visitors: 18500, 
      interactions: 3200, 
      engagement: 5.8,
      color: 'bg-blue-500'
    },
    { 
      id: '2', 
      name: 'Twitter/X', 
      icon: Twitter,
      visitors: 15200, 
      interactions: 2800, 
      engagement: 4.2,
      color: 'bg-sky-500'
    },
    { 
      id: '3', 
      name: 'Facebook', 
      icon: Facebook,
      visitors: 8900, 
      interactions: 2100, 
      engagement: 3.5,
      color: 'bg-blue-600'
    },
    { 
      id: '4', 
      name: 'Instagram', 
      icon: Instagram,
      visitors: 2630, 
      interactions: 650, 
      engagement: 6.2,
      color: 'bg-pink-500'
    }
  ],
  topContent: [
    { id: '1', title: 'AI Ethics in Healthcare: What You Need to Know', views: 2450, engagement: 7.3, shares: 45 },
    { id: '2', title: 'Product Launch: SmartWidget Pro', views: 1890, engagement: 5.8, shares: 32 },
    { id: '3', title: 'Company Milestone: 10 Years of Innovation', views: 1520, engagement: 4.9, shares: 28 },
    { id: '4', title: 'Customer Success: MetroPro Case Study', views: 1340, engagement: 6.1, shares: 24 },
    { id: '5', title: 'Spring Promotion: 20% Off All Services', views: 980, engagement: 3.2, shares: 15 }
  ]
};

const timeRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' }
];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon,
    format = 'number'
  }: { 
    title: string; 
    value: number; 
    change: number; 
    icon: React.ElementType;
    format?: 'number' | 'percent';
  }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {format === 'percent' ? `${value}%` : value.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={change >= 0 ? 'w-4 h-4 text-success' : 'w-4 h-4 text-destructive'} />
              <span className={change >= 0 ? 'text-sm text-success' : 'text-sm text-destructive'}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppShell>
      <Header 
        title="Analytics" 
        subtitle="Track your social media performance and audience engagement."
        actions={
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="mt-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="channels">By Channel</TabsTrigger>
            <TabsTrigger value="content">Top Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Visitors" 
                value={mockAnalyticsData.overview.totalVisitors} 
                change={mockAnalyticsData.overview.visitorChange}
                icon={Users}
              />
              <StatCard 
                title="Interactions" 
                value={mockAnalyticsData.overview.totalInteractions} 
                change={mockAnalyticsData.overview.interactionChange}
                icon={MessageSquare}
              />
              <StatCard 
                title="Engagement Rate" 
                value={mockAnalyticsData.overview.engagementRate} 
                change={mockAnalyticsData.overview.engagementChange}
                icon={ThumbsUp}
                format="percent"
              />
              <StatCard 
                title="Total Shares" 
                value={mockAnalyticsData.overview.totalShares} 
                change={mockAnalyticsData.overview.shareChange}
                icon={Share2}
              />
            </div>

            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Visitor Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-lg">
                      <p className="text-muted-foreground">Visitor trend chart would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Engagement by Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-lg">
                      <p className="text-muted-foreground">Engagement chart would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {mockAnalyticsData.byChannel.map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-lg ${channel.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">{channel.name}</h3>
                            <p className="text-sm text-muted-foreground">Social Channel</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Visitors</p>
                            <p className="text-lg font-semibold">{channel.visitors.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Interactions</p>
                            <p className="text-lg font-semibold">{channel.interactions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Engagement</p>
                            <p className="text-lg font-semibold">{channel.engagement}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalyticsData.topContent.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{content.title}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {content.views.toLocaleString()} views
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {content.engagement}% engagement
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Share2 className="w-3 h-3" />
                              {content.shares} shares
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
