import { motion } from 'framer-motion';
import { 
  FilePlus, 
  FileEdit, 
  Send, 
  Sparkles, 
  CheckCircle, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { Activity } from '@/types';

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons: Record<string, React.ElementType> = {
  content_created: FilePlus,
  content_updated: FileEdit,
  content_published: Send,
  ai_generated: Sparkles,
  review_submitted: CheckCircle,
  comment_added: MessageSquare
};

const activityColors: Record<string, string> = {
  content_created: 'text-primary',
  content_updated: 'text-info',
  content_published: 'text-success',
  ai_generated: 'text-warning',
  review_submitted: 'text-success',
  comment_added: 'text-muted-foreground'
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getActivityLink(activity: Activity): string {
  if (activity.targetType === 'content' && activity.target) {
    return '/social-content';
  }
  if (activity.targetType === 'draft' && activity.target) {
    return '/social-content';
  }
  return '/dashboard';
}

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const Icon = activityIcons[activity.type] || Clock;
  const colorClass = activityColors[activity.type] || 'text-muted-foreground';
  const link = getActivityLink(activity);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Link 
        to={link}
        className="flex items-start gap-3 py-3 border-b border-border last:border-0 hover:bg-secondary/30 rounded-lg px-2 -mx-2 transition-colors"
      >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={activity.actor.avatar} alt={activity.actor.name} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {activity.actor.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium">{activity.actor.name}</span>{' '}
          <span className="text-muted-foreground">{activity.description}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Icon className={cn('w-3 h-3', colorClass)} />
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(activity.createdAt)}
          </span>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-0">
            {activities.map((activity, index) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                index={index}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
