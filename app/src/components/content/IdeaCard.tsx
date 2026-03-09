import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Idea } from '@/types';

interface IdeaCardProps {
  idea: Idea;
  onConvert: (idea: Idea) => void;
  onSave: (idea: Idea) => void;
  index?: number;
}

export function IdeaCard({ idea, onSave, index = 0 }: IdeaCardProps) {
  const [expanded, setExpanded] = useState(false);

  const relevanceColor = idea.relevanceScore >= 80 ? 'text-success' : 
                         idea.relevanceScore >= 60 ? 'text-warning' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={cn(
        'bg-card border-border overflow-hidden transition-all duration-200',
        'hover:border-primary/30 hover:shadow-md',
        expanded && 'ring-1 ring-primary/30'
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground line-clamp-2">
                {idea.headline}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{idea.source}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(idea.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => onSave(idea)}
            >
              {idea.saved ? (
                <BookmarkCheck className="w-4 h-4 text-primary" />
              ) : (
                <Bookmark className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          {/* Relevance Score */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Relevance</span>
              <span className={cn('text-sm font-medium', relevanceColor)}>
                {idea.relevanceScore}%
              </span>
            </div>
            <Progress 
              value={idea.relevanceScore} 
              className="h-1.5"
            />
          </div>

          {/* Keywords */}
          <div className="flex flex-wrap gap-1 mt-3">
            {idea.keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {idea.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="link" size="sm" className="h-auto p-0" asChild>
                      <a href={idea.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Source
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  More
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3 mr-1" />
                Dismiss
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                asChild
              >
                <Link to={`/ideas/brief/${idea.id}`}>
                  Convert to Brief
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
