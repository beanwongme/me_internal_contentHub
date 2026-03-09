import { FileText, Zap, CheckCircle, Globe } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { PipelineBoard } from '@/components/dashboard/PipelineBoard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { mockDashboardStats, mockPipelineStages, mockActivities } from '@/data/mockData';

export function DashboardPage() {
  return (
    <AppShell>
      <Header 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your content."
      />
      
      <div className="mt-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Content Created"
            value={mockDashboardStats.contentCreated}
            trend={mockDashboardStats.contentTrend}
            icon={FileText}
            delay={0}
          />
          <StatCard
            label="AI Utilization"
            value={mockDashboardStats.aiUtilization}
            trend={mockDashboardStats.aiTrend}
            icon={Zap}
            suffix="%"
            format="percent"
            delay={100}
          />
          <StatCard
            label="Approval Rate"
            value={mockDashboardStats.approvalRate}
            trend={mockDashboardStats.approvalTrend}
            icon={CheckCircle}
            suffix="%"
            format="percent"
            delay={200}
          />
          <StatCard
            label="Channel Reach"
            value={mockDashboardStats.channelReach}
            trend={mockDashboardStats.reachTrend}
            icon={Globe}
            delay={300}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Pipeline and Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PipelineBoard stages={mockPipelineStages} />
          </div>
          <div>
            <ActivityFeed activities={mockActivities} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
