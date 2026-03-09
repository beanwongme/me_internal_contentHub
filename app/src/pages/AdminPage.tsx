import { useState } from 'react';
import { 
  Users, 
  DollarSign,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Bot,
  BarChart3,
  Package
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Subscriber {
  id: string;
  companyName: string;
  email: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  joinedAt: string;
  expiresAt: string;
  monthlyUsage: {
    aiTokens: number;
    contentGenerated: number;
    apiCalls: number;
  };
  payment: {
    method: string;
    lastPayment: string;
    nextBilling: string;
    amount: number;
  };
}

const mockSubscribers: Subscriber[] = [
  {
    id: '1',
    companyName: 'TechCorp Solutions',
    email: 'admin@techcorp.com',
    plan: 'enterprise',
    status: 'active',
    joinedAt: '2024-01-15T00:00:00Z',
    expiresAt: '2025-01-15T00:00:00Z',
    monthlyUsage: {
      aiTokens: 2450000,
      contentGenerated: 156,
      apiCalls: 45200
    },
    payment: {
      method: 'Credit Card',
      lastPayment: '2024-03-01T00:00:00Z',
      nextBilling: '2024-04-01T00:00:00Z',
      amount: 499
    }
  },
  {
    id: '2',
    companyName: 'Digital Marketing Pro',
    email: 'billing@dmpro.com',
    plan: 'professional',
    status: 'active',
    joinedAt: '2024-02-01T00:00:00Z',
    expiresAt: '2025-02-01T00:00:00Z',
    monthlyUsage: {
      aiTokens: 890000,
      contentGenerated: 78,
      apiCalls: 12300
    },
    payment: {
      method: 'PayPal',
      lastPayment: '2024-03-05T00:00:00Z',
      nextBilling: '2024-04-05T00:00:00Z',
      amount: 199
    }
  },
  {
    id: '3',
    companyName: 'StartupXYZ',
    email: 'founder@startupxyz.io',
    plan: 'starter',
    status: 'active',
    joinedAt: '2024-02-20T00:00:00Z',
    expiresAt: '2025-02-20T00:00:00Z',
    monthlyUsage: {
      aiTokens: 320000,
      contentGenerated: 34,
      apiCalls: 5600
    },
    payment: {
      method: 'Credit Card',
      lastPayment: '2024-03-10T00:00:00Z',
      nextBilling: '2024-04-10T00:00:00Z',
      amount: 49
    }
  },
  {
    id: '4',
    companyName: 'Creative Agency Ltd',
    email: 'finance@creativeagency.com',
    plan: 'professional',
    status: 'suspended',
    joinedAt: '2023-11-10T00:00:00Z',
    expiresAt: '2024-11-10T00:00:00Z',
    monthlyUsage: {
      aiTokens: 0,
      contentGenerated: 0,
      apiCalls: 0
    },
    payment: {
      method: 'Bank Transfer',
      lastPayment: '2024-01-15T00:00:00Z',
      nextBilling: '2024-02-15T00:00:00Z',
      amount: 199
    }
  },
  {
    id: '5',
    companyName: 'Freelance Writer Co',
    email: 'hello@freelancewriter.co',
    plan: 'free',
    status: 'active',
    joinedAt: '2024-03-01T00:00:00Z',
    expiresAt: '2025-03-01T00:00:00Z',
    monthlyUsage: {
      aiTokens: 45000,
      contentGenerated: 12,
      apiCalls: 800
    },
    payment: {
      method: 'N/A',
      lastPayment: '',
      nextBilling: '',
      amount: 0
    }
  }
];

const planColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  starter: 'bg-info/20 text-info',
  professional: 'bg-primary/20 text-primary',
  enterprise: 'bg-success/20 text-success'
};

const statusColors: Record<string, string> = {
  active: 'bg-success/20 text-success',
  suspended: 'bg-warning/20 text-warning',
  cancelled: 'bg-destructive/20 text-destructive'
};

export function AdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredSubscribers = subscribers.filter(s => 
    s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    totalSubscribers: subscribers.length,
    activeSubscribers: subscribers.filter(s => s.status === 'active').length,
    totalRevenue: subscribers.reduce((acc, s) => acc + (s.status === 'active' ? s.payment.amount : 0), 0),
    totalAiTokens: subscribers.reduce((acc, s) => acc + s.monthlyUsage.aiTokens, 0),
    totalContentGenerated: subscribers.reduce((acc, s) => acc + s.monthlyUsage.contentGenerated, 0)
  };

  const handleStatusChange = (id: string, status: 'active' | 'suspended' | 'cancelled') => {
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handlePriceAdjustment = (id: string, newAmount: number) => {
    setSubscribers(prev => prev.map(s => 
      s.id === id ? { ...s, payment: { ...s.payment, amount: newAmount } } : s
    ));
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage subscribers, payments, and KIMI AI usage</p>
        </div>
      </div>

      <Tabs defaultValue="subscribers" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Subscribers</p>
                    <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{stats.activeSubscribers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <DollarSign className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Bot className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AI Tokens Used</p>
                    <p className="text-2xl font-bold">{(stats.totalAiTokens / 1000000).toFixed(1)}M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search subscribers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          {/* Subscribers Table */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Company</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Monthly Fee</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">AI Usage</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Next Billing</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b border-border hover:bg-secondary/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{subscriber.companyName}</p>
                            <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={cn('text-xs capitalize', planColors[subscriber.plan])}>
                            {subscriber.plan}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={cn('text-xs capitalize', statusColors[subscriber.status])}>
                            {subscriber.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">${subscriber.payment.amount}</p>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p>{(subscriber.monthlyUsage.aiTokens / 1000).toFixed(0)}K tokens</p>
                            <p className="text-muted-foreground">{subscriber.monthlyUsage.contentGenerated} content</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">
                            {subscriber.payment.nextBilling 
                              ? new Date(subscriber.payment.nextBilling).toLocaleDateString()
                              : 'N/A'
                            }
                          </p>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedSubscriber(subscriber);
                                setIsEditDialogOpen(true);
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              {subscriber.status === 'active' ? (
                                <DropdownMenuItem 
                                  className="text-warning"
                                  onClick={() => handleStatusChange(subscriber.id, 'suspended')}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-success"
                                  onClick={() => handleStatusChange(subscriber.id, 'active')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSubscribers.length)} of {filteredSubscribers.length}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="w-5 h-5 text-primary" />
                  KIMI AI Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Tokens</span>
                    <span className="font-medium">{(stats.totalAiTokens / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Content Generated</span>
                    <span className="font-medium">{stats.totalContentGenerated}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg per Subscriber</span>
                    <span className="font-medium">
                      {(stats.totalAiTokens / subscribers.length / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-5 h-5 text-success" />
                  API Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total API Calls</span>
                    <span className="font-medium">
                      {subscribers.reduce((acc, s) => acc + s.monthlyUsage.apiCalls, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Integrations</span>
                    <span className="font-medium">24</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="w-5 h-5 text-info" />
                  Plan Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['free', 'starter', 'professional', 'enterprise'].map(plan => {
                    const count = subscribers.filter(s => s.plan === plan).length;
                    const percentage = (count / subscribers.length) * 100;
                    return (
                      <div key={plan} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{plan}</span>
                          <span>{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Plan Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Free', price: 0, features: ['500 AI tokens/day', '3 social channels', 'Basic templates'] },
                  { name: 'Starter', price: 49, features: ['10K AI tokens/day', '5 social channels', 'Advanced templates', 'Analytics'] },
                  { name: 'Professional', price: 199, features: ['50K AI tokens/day', 'Unlimited channels', 'Custom templates', 'API access'] },
                  { name: 'Enterprise', price: 499, features: ['Unlimited tokens', 'Priority support', 'Custom integrations', 'Dedicated account manager'] }
                ].map(plan => (
                  <div key={plan.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <ul className="text-sm text-muted-foreground mt-1">
                        {plan.features.map((feature, i) => (
                          <li key={i}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">${plan.price}</p>
                        <p className="text-sm text-muted-foreground">/month</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
          </DialogHeader>
          {selectedSubscriber && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={selectedSubscriber.companyName} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={selectedSubscriber.email} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Input value={selectedSubscriber.plan} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Monthly Fee</Label>
                <Input 
                  type="number"
                  value={selectedSubscriber.payment.amount}
                  onChange={e => {
                    const newAmount = parseInt(e.target.value) || 0;
                    setSelectedSubscriber({
                      ...selectedSubscriber,
                      payment: { ...selectedSubscriber.payment, amount: newAmount }
                    });
                  }}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (selectedSubscriber) {
                    handlePriceAdjustment(selectedSubscriber.id, selectedSubscriber.payment.amount);
                    setIsEditDialogOpen(false);
                  }
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
