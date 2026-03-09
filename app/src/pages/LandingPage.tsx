import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Menu, 
  X,
  Search,
  PenTool,
  Image,
  Users,
  Globe,
  Bot,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Language translations
const translations = {
  en: {
    nav: { features: 'Features', pricing: 'Pricing', faq: 'FAQ', signIn: 'Sign In', startTrial: 'Start Free Trial' },
    hero: {
      badge: 'Now with KIMI AI integration',
      title: 'The AI-Powered Content Engine for Growing Businesses',
      subtitle: 'From research to publication in minutes—not hours. ContentHub automates your entire content workflow while keeping your brand voice unmistakably human.',
      ctaPrimary: 'Start Free Trial',
      ctaSecondary: 'Sign In',
      trialNote: '14-day free trial',
      noCard: 'No credit card required'
    },
    aiAgents: {
      title: 'Three Intelligent Agents. One Unified Workflow.',
      subtitle: 'Zero creative bottlenecks.',
      kimiNote: 'KIMI AI is included as your bundled AI Agent. Upgrade to use your own AI agents.',
      agents: [
        { title: 'Research Agent', desc: 'Discovers what your audience cares about—before your competitors do' },
        { title: 'Writing Agent', desc: 'Crafts platform-perfect content in your brand voice' },
        { title: 'Image Agent', desc: 'Generates visuals that stop the scroll' }
      ]
    },
    features: {
      title: 'Everything You Need to Scale Content',
      subtitle: 'From ideation to publication, ContentHub streamlines every step of your content workflow.',
      items: [
        { title: 'AI Research & Ideas', desc: 'Wake up to 10 fresh content ideas every morning. Our Research Agent scans thousands of sources and ranks opportunities by relevance.', metric: '70% reduction in ideation time' },
        { title: 'Multi-Channel Creation', desc: 'One brief. Three platforms. Perfectly adapted. ContentHub understands each platform\'s unique language while keeping your message intact.', metric: '3x increase in content output' },
        { title: 'Team Workflows', desc: 'Writers draft with AI assistance. Editors review with full context. Admins oversee with complete visibility. Everyone knows their lane.', metric: 'Streamlined collaboration' },
        { title: 'Headless API Distribution', desc: 'Create once. Publish everywhere. Your content flows seamlessly to your website, app, social channels, and anywhere else your audience lives.', metric: 'Future-proof flexibility' }
      ]
    },
    pricing: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that fits your team. All plans include a 14-day free trial.',
      plans: [
        { name: 'Starter', desc: 'Solo creators, freelancers', cta: 'Start Free Trial' },
        { name: 'Professional', desc: 'Growing teams (2-5)', cta: 'Start Free Trial', popular: true },
        { name: 'Enterprise', desc: 'Scale operations', cta: 'Contact Sales' }
      ],
      kimiNote: 'KIMI AI included • Bring your own AI with Professional+'
    },
    faq: {
      title: 'Frequently Asked Questions'
    },
    cta: {
      title: 'Ready to Transform Your Content Workflow?',
      subtitle: 'Join hundreds of businesses already using ContentHub to create better content, faster.',
      primary: 'Start Free Trial',
      secondary: 'Sign In'
    }
  },
  'zh-HK': {
    nav: { features: '功能', pricing: '價格', faq: '常見問題', signIn: '登入', startTrial: '免費試用' },
    hero: {
      badge: '現已整合 KIMI AI',
      title: '為成長型企業打造的 AI 內容引擎',
      subtitle: '從研究到發布只需數分鐘，而非數小時。ContentHub 自動化您的整個內容工作流程，同時保持品牌聲音獨特的人性化。',
      ctaPrimary: '免費試用',
      ctaSecondary: '登入',
      trialNote: '14天免費試用',
      noCard: '無需信用卡'
    },
    aiAgents: {
      title: '三位智能代理。一個統一工作流程。',
      subtitle: '零創意瓶頸。',
      kimiNote: 'KIMI AI 已包含為您的捆綁 AI 代理。升級以使用您自己的 AI 代理。',
      agents: [
        { title: '研究代理', desc: '在競爭對手之前發現您的受眾關心什麼' },
        { title: '寫作代理', desc: '以您的品牌聲音打造完美的平台內容' },
        { title: '圖像代理', desc: '生成令人駐足的視覺效果' }
      ]
    },
    features: {
      title: '擴展內容所需的一切',
      subtitle: '從構思到發布，ContentHub 簡化您內容工作流程的每一步。',
      items: [
        { title: 'AI 研究與創意', desc: '每天早上醒來就有 10 個新鮮內容創意。我們的研究代理掃描數千個來源並按相關性排名機會。', metric: '構思時間減少 70%' },
        { title: '多渠道創作', desc: '一個簡介。三個平台。完美適配。ContentHub 理解每個平台的獨特語言，同時保持您的信息完整。', metric: '內容產出增加 3 倍' },
        { title: '團隊工作流程', desc: '作家在 AI 輔助下起草。編輯在完整上下文中審核。管理員全面監督。每個人都知道自己的角色。', metric: '簡化的協作' },
        { title: '無頭 API 分發', desc: '一次創建。隨處發布。您的內容無縫流向您的網站、應用程序、社交渠道以及受眾所在的任何其他地方。', metric: '面向未來的靈活性' }
      ]
    },
    pricing: {
      title: '簡單透明的定價',
      subtitle: '選擇適合您團隊的計劃。所有計劃均包含 14 天免費試用。',
      plans: [
        { name: '入門版', desc: '個人創作者、自由工作者', cta: '免費試用' },
        { name: '專業版', desc: '成長型團隊 (2-5人)', cta: '免費試用', popular: true },
        { name: '企業版', desc: '規模化運營', cta: '聯繫銷售' }
      ],
      kimiNote: '包含 KIMI AI • 專業版以上可自帶 AI'
    },
    faq: {
      title: '常見問題'
    },
    cta: {
      title: '準備好轉型您的內容工作流程了嗎？',
      subtitle: '加入數百家已經使用 ContentHub 更快創建更好內容的企業。',
      primary: '免費試用',
      secondary: '登入'
    }
  },
  ja: {
    nav: { features: '機能', pricing: '料金', faq: 'よくある質問', signIn: 'ログイン', startTrial: '無料トライアル' },
    hero: {
      badge: 'KIMI AI 統合済み',
      title: '成長企業のための AI コンテンツエンジン',
      subtitle: '研究から公開まで数分で完了。ContentHub はコンテンツワークフローを自動化し、ブランドの人間性を保ちます。',
      ctaPrimary: '無料トライアル',
      ctaSecondary: 'ログイン',
      trialNote: '14日間無料トライアル',
      noCard: 'クレジットカード不要'
    },
    aiAgents: {
      title: '3つのインテリジェントエージェント。1つの統合ワークフロー。',
      subtitle: 'クリエイティブのボトルネックゼロ。',
      kimiNote: 'KIMI AI がバンドル AI エージェントとして含まれています。アップグレードして独自の AI エージェントをご利用ください。',
      agents: [
        { title: 'リサーチエージェント', desc: '競合他社より先に、オーディエンスが何を気にしているかを発見' },
        { title: 'ライティングエージェント', desc: 'ブランドボイスでプラットフォームに最適なコンテンツを作成' },
        { title: 'イメージエージェント', desc: 'スクロールを止めるビジュアルを生成' }
      ]
    },
    features: {
      title: 'コンテンツ拡大に必要なすべて',
      subtitle: '企画から公開まで、ContentHub はコンテンツワークフローの各ステップを効率化します。',
      items: [
        { title: 'AI リサーチ＆アイデア', desc: '毎朝10の新しいコンテンツアイデアで目覚める。リサーチエージェントが数千のソースをスキャンし、関連性で機会をランク付け。', metric: '企画時間70%削減' },
        { title: 'マルチチャネル作成', desc: '1つのブリーフ。3つのプラットフォーム。完璧に適応。ContentHub は各プラットフォームの独自の言語を理解し、メッセージを保持。', metric: 'コンテンツ出力3倍増' },
        { title: 'チームワークフロー', desc: 'ライターはAI支援でドラフト作成。エディターは完全な文脈でレビュー。管理者は完全な可視性で監督。誰もが自分の役割を知っている。', metric: '効率化された協働' },
        { title: 'ヘッドレス API 配信', desc: '一度作成。どこにでも公開。コンテンツがウェブサイト、アプリ、ソーシャルチャネル、オーディエンスがいる他のすべての場所にシームレスに流れる。', metric: '将来を見据えた柔軟性' }
      ]
    },
    pricing: {
      title: 'シンプルで透明な料金',
      subtitle: 'チームに合ったプランを選択。すべてのプランに14日間の無料トライアルが含まれます。',
      plans: [
        { name: 'スターター', desc: '個人クリエイター、フリーランサー', cta: '無料トライアル' },
        { name: 'プロフェッショナル', desc: '成長チーム (2-5名)', cta: '無料トライアル', popular: true },
        { name: 'エンタープライズ', desc: 'スケール運営', cta: '営業に問い合わせ' }
      ],
      kimiNote: 'KIMI AI 含む • プロフェッショナル以上で独自AI利用可能'
    },
    faq: {
      title: 'よくある質問'
    },
    cta: {
      title: 'コンテンツワークフローの変革の準備はできましたか？',
      subtitle: 'ContentHub を使用してより良いコンテンツをより速く作成している数百の企業に参加してください。',
      primary: '無料トライアル',
      secondary: 'ログイン'
    }
  }
};

const features = [
  { icon: Search, image: '/ideas-preview.jpg' },
  { icon: PenTool, image: '/multichannel-preview.jpg' },
  { icon: Users, image: '/dashboard-preview.jpg' },
  { icon: Globe, image: '/hero-illustration.jpg' }
];

const pricingPlans = [
  {
    name: 'Starter',
    monthlyPrice: 388,
    annualPrice: 3888,
    features: ['1 user', '50 AI content/month', '3 keyword pools', '2 channels', '10GB storage', 'KIMI AI included']
  },
  {
    name: 'Professional',
    monthlyPrice: 1288,
    annualPrice: 12888,
    features: ['5 users', '200 AI content/month', '10 keyword pools', 'Unlimited channels', '100GB storage', 'API access', 'Bring your own AI']
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: 48888,
    features: ['Unlimited users', 'Unlimited AI content', 'Custom AI tuning', 'Dedicated infrastructure', 'SLA guarantee', 'Hong Kong deployment', 'Bring your own AI']
  }
];

const faqs = [
  {
    question: 'Which AI models work in Hong Kong?',
    answer: 'We configure connections using providers with verified Hong Kong availability: OpenAI, Anthropic Claude, Google Gemini, and open-weights models like Flux with regional deployment options. KIMI AI is included as your bundled AI agent.'
  },
  {
    question: 'Can we use our own AI API keys?',
    answer: 'Yes—Professional and Enterprise plans support bring-your-own-key for cost optimization and existing provider relationships. Starter plan uses KIMI AI as the bundled AI agent.'
  },
  {
    question: 'Who owns the content we create?',
    answer: 'You do, completely. All intellectual property rights remain with your organization. We never use your content for model training without explicit consent.'
  },
  {
    question: 'What happens if we cancel?',
    answer: 'Full export in standard formats (JSON, Markdown, images) with 30-day post-cancellation access. No content deletion without your explicit request.'
  }
];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'zh-HK' | 'ja'>('en');
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold text-foreground">ContentHub</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.features}</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.pricing}</a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.faq}</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Globe className="w-4 h-4" />
                    {lang === 'en' ? 'EN' : lang === 'zh-HK' ? '繁' : 'JP'}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLang('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang('zh-HK')}>繁體中文</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang('ja')}>日本語</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" asChild>
                <Link to="/login">{t.nav.signIn}</Link>
              </Button>
              <Button asChild>
                <Link to="/login">{t.nav.startTrial}</Link>
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-muted-foreground">{t.nav.features}</a>
              <a href="#pricing" className="block text-sm text-muted-foreground">{t.nav.pricing}</a>
              <a href="#faq" className="block text-sm text-muted-foreground">{t.nav.faq}</a>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setLang('en')}>EN</Button>
                <Button variant="outline" size="sm" onClick={() => setLang('zh-HK')}>繁</Button>
                <Button variant="outline" size="sm" onClick={() => setLang('ja')}>JP</Button>
              </div>
              <div className="pt-3 border-t border-border space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">{t.nav.signIn}</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/login">{t.nav.startTrial}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section - Split Dark/Light */}
      <section className="pt-32 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2">
            {/* Left Side - Dark */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="px-4 sm:px-6 lg:px-8 py-20 bg-background"
            >
              <Badge variant="secondary" className="mb-4">
                <Bot className="w-3 h-3 mr-1" />
                {t.hero.badge}
              </Badge>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                {t.hero.title.split('AI-Powered').map((part, i) => (
                  i === 0 ? <span key={i}>{part}</span> : <span key={i}><span className="text-gradient">AI-Powered</span>{part}</span>
                ))}
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                {t.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/login">
                    {t.hero.ctaPrimary}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">{t.hero.ctaSecondary}</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  {t.hero.trialNote}
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  {t.hero.noCard}
                </div>
              </div>
            </motion.div>
            
            {/* Right Side - White/Light */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-white dark:bg-gray-50 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-lg">
                <img 
                  src="/hero-illustration.jpg" 
                  alt="ContentHub AI Workflow" 
                  className="w-full h-auto"
                />
              </div>
              
              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute left-8 bottom-32 bg-white dark:bg-gray-900 border border-border rounded-xl p-4 shadow-lg"
              >
                <p className="text-2xl font-bold text-foreground">8-12x</p>
                <p className="text-sm text-muted-foreground">Efficiency gain</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute right-8 top-32 bg-white dark:bg-gray-900 border border-border rounded-xl p-4 shadow-lg"
              >
                <p className="text-2xl font-bold text-foreground">30-45min</p>
                <p className="text-sm text-muted-foreground">Time to publish</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              {t.aiAgents.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.aiAgents.subtitle}
            </p>
          </div>
          
          {/* KIMI AI Note */}
          <div className="flex justify-center mb-12">
            <Badge variant="outline" className="gap-2 px-4 py-2">
              <Bot className="w-4 h-4 text-primary" />
              {t.aiAgents.kimiNote}
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {t.aiAgents.agents.map((agent, index) => (
              <motion.div
                key={agent.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-card border-border h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      {index === 0 && <Search className="w-6 h-6 text-primary" />}
                      {index === 1 && <PenTool className="w-6 h-6 text-primary" />}
                      {index === 2 && <Image className="w-6 h-6 text-primary" />}
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                      {agent.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {agent.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              {t.features.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="space-y-24">
            {t.features.items.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'grid lg:grid-cols-2 gap-12 items-center'
                )}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {index === 0 && <Search className="w-6 h-6 text-primary" />}
                    {index === 1 && <PenTool className="w-6 h-6 text-primary" />}
                    {index === 2 && <Users className="w-6 h-6 text-primary" />}
                    {index === 3 && <Globe className="w-6 h-6 text-primary" />}
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg mb-4">
                    {feature.desc}
                  </p>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span className="text-foreground font-medium">{feature.metric}</span>
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="rounded-xl overflow-hidden shadow-lg border border-border">
                    <img 
                      src={features[index].image} 
                      alt={feature.title}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              {t.pricing.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.pricing.subtitle}
            </p>
            <div className="flex justify-center mt-4">
              <Badge variant="outline" className="gap-2">
                <Bot className="w-4 h-4 text-primary" />
                {t.pricing.kimiNote}
              </Badge>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={cn(
                  'bg-card border-border h-full',
                  index === 1 && 'border-primary ring-1 ring-primary'
                )}>
                  <CardContent className="p-6">
                    {index === 1 && (
                      <Badge className="mb-4 bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    )}
                    <h3 className="font-heading text-xl font-semibold text-foreground">
                      {t.pricing.plans[index].name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.pricing.plans[index].desc}
                    </p>
                    <div className="mt-4">
                      {plan.monthlyPrice ? (
                        <>
                          <span className="text-4xl font-bold text-foreground">
                            HK${plan.monthlyPrice.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold text-foreground">Custom</span>
                      )}
                    </div>
                    {plan.annualPrice && (
                      <p className="text-sm text-muted-foreground mt-1">
                        HK${plan.annualPrice.toLocaleString()}/year (save 16-17%)
                      </p>
                    )}
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-success flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-6" 
                      variant={index === 1 ? 'default' : 'outline'}
                      asChild
                    >
                      <Link to="/login">{t.pricing.plans[index].cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground">
              {t.faq.title}
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
                {t.cta.title}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                {t.cta.subtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/login">
                    {t.cta.primary}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">{t.cta.secondary}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-foreground">ContentHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ContentHub. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
              <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground">Settings</Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
