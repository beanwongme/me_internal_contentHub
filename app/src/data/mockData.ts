import type { 
  User, Content, Idea, Channel, CompanyProfile, Product, 
  CaseStudy, MediaAsset, Activity, PipelineStage, AIAgent, 
  KeywordPool, DashboardStats 
} from '@/types';

// Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Michael Wong',
    email: 'michael@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    role: 'editor',
    status: 'active',
    joinedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Emily Liu',
    email: 'emily@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    role: 'writer',
    status: 'active',
    joinedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    role: 'viewer',
    status: 'active',
    joinedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Jessica Tan',
    email: 'jessica@company.com',
    role: 'writer',
    status: 'pending',
    joinedAt: '2024-03-10T00:00:00Z'
  }
];

// Channels
export const mockChannels: Channel[] = [
  { id: '1', name: 'LinkedIn', type: 'social', platform: 'linkedin', icon: 'linkedin', connected: true, status: 'active' },
  { id: '2', name: 'Twitter/X', type: 'social', platform: 'twitter', icon: 'twitter', connected: true, status: 'active' },
  { id: '3', name: 'Facebook', type: 'social', platform: 'facebook', icon: 'facebook', connected: true, status: 'active' },
  { id: '4', name: 'Instagram', type: 'social', platform: 'instagram', icon: 'instagram', connected: false, status: 'pending' },
  { id: '5', name: 'Thread', type: 'social', platform: 'thread', icon: 'at-sign', connected: true, status: 'active' },
  { id: '6', name: 'Company Blog', type: 'cms', platform: 'wordpress', icon: 'globe', connected: true, status: 'active' },
  { id: '7', name: 'Slack', type: 'notification', platform: 'slack', icon: 'message-square', connected: true, status: 'active' }
];

// Content
export const mockContents: Content[] = [
  {
    id: '1',
    title: 'AI Ethics in Healthcare: What You Need to Know',
    type: 'thought_leadership',
    status: 'published',
    author: mockUsers[2],
    channels: [mockChannels[0], mockChannels[1]],
    keywords: ['AI', 'healthcare', 'ethics'],
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-05T14:00:00Z',
    publishedAt: '2024-03-05T15:00:00Z',
    performance: { views: 2450, clicks: 180, engagement: 7.3, shares: 45 }
  },
  {
    id: '2',
    title: 'Product Launch: SmartWidget Pro',
    type: 'product',
    status: 'review',
    author: mockUsers[2],
    channels: [mockChannels[0], mockChannels[2], mockChannels[5]],
    keywords: ['product', 'launch', 'smartwidget'],
    createdAt: '2024-03-08T09:00:00Z',
    updatedAt: '2024-03-08T16:00:00Z'
  },
  {
    id: '3',
    title: 'Company Milestone: 10 Years of Innovation',
    type: 'company_news',
    status: 'draft',
    author: mockUsers[1],
    channels: [mockChannels[0], mockChannels[5]],
    keywords: ['milestone', 'anniversary', 'company'],
    createdAt: '2024-03-09T11:00:00Z',
    updatedAt: '2024-03-09T11:00:00Z'
  },
  {
    id: '4',
    title: 'Customer Success: How MetroPro Increased Efficiency by 76%',
    type: 'customer_story',
    status: 'scheduled',
    author: mockUsers[2],
    channels: [mockChannels[0], mockChannels[1]],
    keywords: ['case study', 'metropro', 'efficiency'],
    createdAt: '2024-03-06T13:00:00Z',
    updatedAt: '2024-03-07T10:00:00Z',
    scheduledAt: '2024-03-12T09:00:00Z'
  },
  {
    id: '5',
    title: 'Spring Promotion: 20% Off All Services',
    type: 'promotional',
    status: 'approved',
    author: mockUsers[1],
    channels: [mockChannels[1], mockChannels[2]],
    keywords: ['promotion', 'spring', 'discount'],
    createdAt: '2024-03-07T08:00:00Z',
    updatedAt: '2024-03-08T12:00:00Z'
  },
  {
    id: '6',
    title: 'The Future of Remote Work in Hong Kong',
    type: 'thought_leadership',
    status: 'draft',
    author: mockUsers[2],
    channels: [mockChannels[0]],
    keywords: ['remote work', 'hong kong', 'future'],
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z'
  }
];

// Ideas
export const mockIdeas: Idea[] = [
  {
    id: '1',
    headline: 'Blockchain Beyond Crypto: Enterprise Applications in 2024',
    summary: 'Major corporations are adopting blockchain for supply chain transparency, smart contracts, and secure data sharing.',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    relevanceScore: 92,
    keywords: ['blockchain', 'enterprise', 'technology'],
    createdAt: '2024-03-10T06:00:00Z',
    saved: false
  },
  {
    id: '2',
    headline: 'Sustainable Business Practices: What Hong Kong Companies Are Doing',
    summary: 'Local businesses are implementing ESG initiatives to meet regulatory requirements and consumer expectations.',
    source: 'South China Morning Post',
    sourceUrl: 'https://scmp.com',
    relevanceScore: 88,
    keywords: ['sustainability', 'ESG', 'hong kong'],
    createdAt: '2024-03-10T05:30:00Z',
    saved: true
  },
  {
    id: '3',
    headline: 'AI Regulation Updates: What Businesses Need to Know',
    summary: 'New guidelines for AI deployment are affecting how companies implement machine learning solutions.',
    source: 'Reuters',
    sourceUrl: 'https://reuters.com',
    relevanceScore: 85,
    keywords: ['AI', 'regulation', 'compliance'],
    createdAt: '2024-03-10T04:00:00Z',
    saved: false
  },
  {
    id: '4',
    headline: 'The Rise of Fintech in Southeast Asia',
    summary: 'Digital payment adoption is accelerating across SEA markets, with Hong Kong positioned as a key hub.',
    source: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com',
    relevanceScore: 81,
    keywords: ['fintech', 'southeast asia', 'payments'],
    createdAt: '2024-03-10T03:00:00Z',
    saved: false
  },
  {
    id: '5',
    headline: 'Cybersecurity Mesh Architecture: A New Approach',
    summary: 'Gartner\'s latest security framework is gaining traction among enterprise security teams.',
    source: 'Gartner',
    sourceUrl: 'https://gartner.com',
    relevanceScore: 78,
    keywords: ['cybersecurity', 'architecture', 'enterprise'],
    createdAt: '2024-03-10T02:00:00Z',
    saved: false
  },
  {
    id: '6',
    headline: 'Remote Work Productivity: Latest Research Findings',
    summary: 'New studies show hybrid work models can increase productivity by up to 13% when properly implemented.',
    source: 'Harvard Business Review',
    sourceUrl: 'https://hbr.org',
    relevanceScore: 75,
    keywords: ['remote work', 'productivity', 'hybrid'],
    createdAt: '2024-03-10T01:00:00Z',
    saved: false
  }
];

// Company Profile
export const mockCompanyProfile: CompanyProfile = {
  name: 'Acme Ltd',
  legalName: 'Acme Limited',
  overview: {
    en: 'Acme Ltd is a leading technology solutions provider specializing in digital transformation for businesses across Asia-Pacific. Founded in 2015, we have helped over 500 companies modernize their operations and achieve sustainable growth.',
    'zh-HK': 'Acme有限公司是亞太地區領先的技術解決方案提供商，專注於企業數字化轉型。自2015年成立以來，我們已幫助超過500家公司實現現代化運營和可持續增長。'
  },
  tagline: {
    en: 'Transforming Business Through Technology',
    'zh-HK': '通過技術轉型業務'
  },
  founded: 2015,
  locations: [
    { city: 'Hong Kong', type: 'headquarters', address: 'Central Plaza, 18 Harbour Road, Wanchai' },
    { city: 'Singapore', type: 'regional_office', address: 'Marina Bay Financial Centre' }
  ],
  contacts: {
    email: 'info@acme.com',
    phone: '+852 1234 5678',
    website: 'https://acme.com'
  },
  socialProfiles: {
    linkedin: 'https://linkedin.com/company/acme',
    twitter: 'https://twitter.com/acme',
    facebook: 'https://facebook.com/acme'
  }
};

// Products
export const mockProducts: Product[] = [
  {
    id: 'p1',
    sku: 'ACME-SW-001',
    name: {
      en: 'SmartWidget Pro',
      'zh-HK': '智能組件專業版'
    },
    category: ['hardware', 'iot'],
    description: {
      short: { en: 'Next-generation IoT device for smart offices' },
      full: { en: 'The SmartWidget Pro is an advanced IoT solution designed for modern workplaces. It integrates seamlessly with existing infrastructure to provide real-time monitoring, automation, and analytics.' }
    },
    features: [
      { name: 'Real-time Monitoring', description: '24/7 sensor data collection', benefit: 'Never miss critical events' },
      { name: 'AI-powered Analytics', description: 'Machine learning insights', benefit: 'Predict maintenance needs' },
      { name: 'Easy Integration', description: 'Works with 100+ platforms', benefit: 'Minimal setup time' }
    ],
    benefits: ['Reduce operational costs by 30%', 'Improve response time by 50%', 'Extend equipment lifespan'],
    useCases: [
      { scenario: 'Smart Office Deployment', outcome: '20% energy savings within 3 months' },
      { scenario: 'Manufacturing Floor', outcome: 'Zero unplanned downtime for 6 months' }
    ],
    pricing: {
      currency: 'HKD',
      tiers: [
        { name: 'Starter', price: 2999, features: ['1 device', 'Basic analytics', 'Email support'] },
        { name: 'Professional', price: 7999, features: ['5 devices', 'Advanced analytics', 'Priority support'] }
      ]
    },
    availability: 'in_stock',
    media: []
  }
];

// Case Studies
export const mockCaseStudies: CaseStudy[] = [
  {
    id: 'cs1',
    title: 'MetroPro Services: Digital Transformation Success',
    client: { name: 'MetroPro Services', industry: 'Professional Services', size: '25 employees' },
    challenge: {
      situation: 'MetroPro struggled with manual processes and inconsistent client communication.',
      stakes: 'They were losing 20% of potential clients due to slow response times.'
    },
    solution: {
      approach: 'Implemented our complete digital transformation suite with custom workflows.',
      implementation: '3-month phased rollout with comprehensive staff training.'
    },
    results: {
      metrics: [
        { label: 'Response Time', value: '48 hours', change: '-75%' },
        { label: 'Client Retention', value: '94%', change: '+18%' },
        { label: 'Revenue Growth', value: '32%', change: '+32%' }
      ],
      testimonial: 'Acme transformed our business. We\'re now more efficient than ever.',
      quoteAttribution: 'John Smith, Operations Director'
    },
    visibility: 'public',
    approvalStatus: 'client_approved',
    media: []
  }
];

// Media Assets
export const mockMediaAssets: MediaAsset[] = [
  {
    id: 'm1',
    name: 'Product Launch Hero',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200',
    size: 2457600,
    dimensions: { width: 1920, height: 1080 },
    tags: ['product', 'launch', 'hero'],
    uploadedBy: mockUsers[0],
    uploadedAt: '2024-03-01T10:00:00Z',
    usageCount: 5
  },
  {
    id: 'm2',
    name: 'Team Photo 2024',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200',
    size: 1843200,
    dimensions: { width: 1600, height: 900 },
    tags: ['team', 'company', 'about'],
    uploadedBy: mockUsers[1],
    uploadedAt: '2024-03-05T14:00:00Z',
    usageCount: 3
  },
  {
    id: 'm3',
    name: 'Office Tour Video',
    type: 'video',
    url: 'https://example.com/video.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200',
    size: 52428800,
    tags: ['office', 'tour', 'culture'],
    uploadedBy: mockUsers[0],
    uploadedAt: '2024-03-08T09:00:00Z',
    usageCount: 1
  }
];

// Activities
export const mockActivities: Activity[] = [
  {
    id: 'a1',
    type: 'content_published',
    actor: mockUsers[2],
    target: 'AI Ethics in Healthcare',
    targetType: 'content',
    description: 'published "AI Ethics in Healthcare: What You Need to Know"',
    createdAt: '2024-03-05T15:00:00Z'
  },
  {
    id: 'a2',
    type: 'ai_generated',
    actor: mockUsers[2],
    target: 'Product Launch Draft',
    targetType: 'draft',
    description: 'generated a draft for "Product Launch: SmartWidget Pro"',
    createdAt: '2024-03-08T10:00:00Z'
  },
  {
    id: 'a3',
    type: 'review_submitted',
    actor: mockUsers[1],
    target: 'Product Launch Draft',
    targetType: 'draft',
    description: 'submitted review with 3 revision requests',
    createdAt: '2024-03-08T16:00:00Z'
  },
  {
    id: 'a4',
    type: 'content_created',
    actor: mockUsers[2],
    target: 'Company Milestone',
    targetType: 'content',
    description: 'created new content "Company Milestone: 10 Years of Innovation"',
    createdAt: '2024-03-09T11:00:00Z'
  }
];

// Pipeline Stages
export const mockPipelineStages: PipelineStage[] = [
  { id: 's1', name: 'Research', key: 'research', count: 3, items: [] },
  { id: 's2', name: 'Briefing', key: 'briefing', count: 2, items: [] },
  { id: 's3', name: 'Generation', key: 'generation', count: 1, items: [] },
  { id: 's4', name: 'Review', key: 'review', count: 2, items: mockContents.filter(c => c.status === 'review') },
  { id: 's5', name: 'Scheduled', key: 'scheduled', count: 1, items: mockContents.filter(c => c.status === 'scheduled') },
  { id: 's6', name: 'Published', key: 'published', count: 1, items: mockContents.filter(c => c.status === 'published') }
];

// AI Agents
export const mockAIAgents: AIAgent[] = [
  {
    id: 'agent1',
    name: 'ContentHub AI',
    type: 'writing',
    provider: 'Kimi AI',
    model: 'kimi-k2.5',
    status: 'active',
    config: { temperature: 0.7, maxTokens: 4000 },
    description: 'ContentHub Bundled AI Provider for content generation'
  },
  {
    id: 'agent2',
    name: 'Research Agent',
    type: 'research',
    provider: 'Perplexity',
    model: 'Pro',
    status: 'active',
    config: { temperature: 0.7, maxTokens: 2000 }
  },
  {
    id: 'agent3',
    name: 'Image Agent',
    type: 'image',
    provider: 'DALL-E',
    model: 'DALL-E 3',
    status: 'active',
    config: {}
  }
];

// Keyword Pools
export const mockKeywordPools: KeywordPool[] = [
  {
    id: 'kp1',
    name: 'Core Brand',
    keywords: ['Acme', 'SmartWidget', 'digital transformation'],
    priority: 'high',
    active: true
  },
  {
    id: 'kp2',
    name: 'Industry Terms',
    keywords: ['IoT', 'AI', 'machine learning', 'automation'],
    priority: 'high',
    active: true
  },
  {
    id: 'kp3',
    name: 'Market Trends',
    keywords: ['remote work', 'sustainability', 'ESG', 'fintech'],
    priority: 'medium',
    active: true
  },
  {
    id: 'kp4',
    name: 'Competitive',
    keywords: ['competitor A', 'competitor B'],
    priority: 'low',
    active: false
  }
];

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  contentCreated: 24,
  contentTrend: 14,
  aiUtilization: 78,
  aiTrend: 12,
  approvalRate: 92,
  approvalTrend: 5,
  channelReach: 12500,
  reachTrend: 23
};
