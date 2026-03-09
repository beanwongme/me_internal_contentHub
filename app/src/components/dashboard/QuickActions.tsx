import { motion } from 'framer-motion';
import { 
  Plus, 
  CheckSquare, 
  Lightbulb, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface QuickAction {
  name: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    name: 'Create Content',
    description: 'Start a new content piece',
    icon: Plus,
    href: '/social-content/new',
    color: 'bg-primary/10 text-primary'
  },
  {
    name: 'Review Pending',
    description: '2 items awaiting review',
    icon: CheckSquare,
    href: '/social-content?status=review',
    badge: 2,
    color: 'bg-warning/10 text-warning'
  },
  {
    name: 'Check Ideas',
    description: '6 new AI-generated ideas',
    icon: Lightbulb,
    href: '/ideas',
    badge: 6,
    color: 'bg-success/10 text-success'
  },
  {
    name: 'Schedule',
    description: 'Plan upcoming content',
    icon: Calendar,
    href: '/social-content?status=scheduled',
    color: 'bg-info/10 text-info'
  }
];

export function QuickActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 justify-start gap-3 hover:bg-secondary/50 transition-all duration-200 group"
                  asChild
                >
                  <Link to={action.href}>
                    <div className={cn('p-2 rounded-lg', action.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{action.name}</span>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
