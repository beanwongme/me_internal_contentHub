import { motion } from 'framer-motion';
import { MoreHorizontal, Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { PipelineStage, Content } from '@/types';

interface PipelineBoardProps {
  stages: PipelineStage[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  review: 'bg-warning/20 text-warning',
  approved: 'bg-success/20 text-success',
  scheduled: 'bg-info/20 text-info',
  published: 'bg-primary/20 text-primary',
  archived: 'bg-muted text-muted-foreground'
};

function PipelineCard({ content, index }: { content: Content; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Link to={`/social-content/${content.id}`}>
        <Card className="bg-secondary/50 border-border cursor-pointer hover:border-primary/30 transition-all duration-200 hover:shadow-md">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                {content.title}
              </h4>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={cn('text-xs', statusColors[content.status])}>
                {content.type.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{content.author.name.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(content.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {content.channels.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {content.channels.slice(0, 3).map((channel) => (
                  <div 
                    key={channel.id}
                    className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-xs"
                    title={channel.name}
                  >
                    {channel.name[0]}
                  </div>
                ))}
                {content.channels.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{content.channels.length - 3}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function PipelineBoard({ stages }: PipelineBoardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-lg">Content Pipeline</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/social-content">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6 pt-0">
          {/* Vertical Layout - All stages in one column */}
          <div className="space-y-4">
            {stages.map((stage, stageIndex) => (
              <div key={stage.id} className="border-l-2 border-border pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-sm text-foreground">{stage.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {stage.count}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {stage.items.length > 0 ? (
                    stage.items.slice(0, 2).map((content, index) => (
                      <PipelineCard 
                        key={content.id} 
                        content={content} 
                        index={stageIndex + index}
                      />
                    ))
                  ) : (
                    <div className="h-16 rounded-lg border border-dashed border-border flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">No items</p>
                    </div>
                  )}
                  {stage.items.length > 2 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                      <Link to={`/social-content?status=${stage.key}`}>
                        +{stage.items.length - 2} more
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
