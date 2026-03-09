import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Content } from '@/types';

interface ContentTableProps {
  contents: Content[];
  onAction?: (action: string, content: Content) => void;
  selectable?: boolean;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  draft: { label: 'Draft', icon: Clock, color: 'bg-muted text-muted-foreground' },
  review: { label: 'In Review', icon: Eye, color: 'bg-warning/20 text-warning' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'bg-success/20 text-success' },
  scheduled: { label: 'Scheduled', icon: Calendar, color: 'bg-info/20 text-info' },
  published: { label: 'Published', icon: CheckCircle, color: 'bg-primary/20 text-primary' },
  archived: { label: 'Archived', icon: XCircle, color: 'bg-muted text-muted-foreground' }
};

const typeLabels: Record<string, string> = {
  product: 'Product',
  thought_leadership: 'Thought Leadership',
  company_news: 'Company News',
  customer_story: 'Customer Story',
  promotional: 'Promotional'
};

export function ContentTable({ contents, onAction, selectable = true }: ContentTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedRows.length === contents.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(contents.map(c => c.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            {selectable && (
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedRows.length === contents.length && contents.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Content</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Channels</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents.map((content, index) => {
            const status = statusConfig[content.status];
            const StatusIcon = status.icon;
            
            return (
              <motion.tr
                key={content.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={cn(
                  'border-b border-border transition-colors hover:bg-secondary/30 cursor-pointer',
                  selectedRows.includes(content.id) && 'bg-primary/5'
                )}
              >
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedRows.includes(content.id)}
                      onCheckedChange={() => toggleSelectRow(content.id)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Link to={`/social-content/${content.id}`} className="block">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground line-clamp-1 hover:text-primary transition-colors">
                        {content.title}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {content.keywords.slice(0, 2).map(kw => (
                          <span key={kw} className="text-xs text-muted-foreground">
                            #{kw}
                          </span>
                        ))}
                        {content.keywords.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{content.keywords.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {typeLabels[content.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={content.author.avatar} />
                      <AvatarFallback className="text-xs">
                        {content.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {content.author.name.split(' ')[0]}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full text-xs w-fit', status.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {content.channels.slice(0, 3).map(channel => (
                      <div 
                        key={channel.id}
                        className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-xs"
                        title={channel.name}
                      >
                        {channel.name[0]}
                      </div>
                    ))}
                    {content.channels.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{content.channels.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(content.updatedAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/social-content/${content.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/social-content/${content.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onAction?.('delete', content)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
