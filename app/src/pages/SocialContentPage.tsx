import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Grid3X3, ArrowUpDown } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { ContentTable } from '@/components/content/ContentTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { mockContents, mockChannels } from '@/data/mockData';
import type { Content } from '@/types';

const statusFilters = [
  { value: 'all', label: 'All', count: 6 },
  { value: 'draft', label: 'Draft', count: 2 },
  { value: 'review', label: 'In Review', count: 1 },
  { value: 'approved', label: 'Approved', count: 1 },
  { value: 'scheduled', label: 'Scheduled', count: 1 },
  { value: 'published', label: 'Published', count: 1 },
];

const typeFilters = [
  { value: 'all', label: 'All Types' },
  { value: 'product', label: 'Product' },
  { value: 'thought_leadership', label: 'Thought Leadership' },
  { value: 'customer_story', label: 'Customer Story' },
  { value: 'promotional', label: 'Promotional' },
];

export function SocialContentPage() {
  const [contents] = useState<Content[]>(mockContents);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleAction = (action: string, content: Content) => {
    console.log('Action:', action, 'Content:', content);
    // Handle actions
  };

  const filteredContents = useMemo(() => {
    let result = contents.filter(content => {
      const matchesStatus = statusFilter === 'all' || content.status === statusFilter;
      const matchesType = typeFilter === 'all' || content.type === typeFilter;
      const matchesChannel = channelFilter === 'all' || content.channels.some(c => c.id === channelFilter);
      const matchesSearch = searchQuery === '' ||
                           content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           content.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesStatus && matchesType && matchesChannel && matchesSearch;
    });

    // Sort by date (updatedAt)
    result.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [contents, statusFilter, typeFilter, channelFilter, searchQuery, sortOrder]);

  return (
    <AppShell>
      <Header 
        title="Social Content" 
        subtitle="Manage and organize all your social media content."
        actions={
          <Button className="gap-2" asChild>
            <Link to="/social-content/new">
              <Plus className="w-4 h-4" />
              New Content
            </Link>
          </Button>
        }
      />
      
      <div className="mt-8 space-y-6">
        {/* Status Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-secondary flex-wrap h-auto gap-1">
            {statusFilters.map((filter) => (
              <TabsTrigger 
                key={filter.value} 
                value={filter.value}
                className="gap-2"
              >
                {filter.label}
                <Badge variant="secondary" className="text-xs">
                  {filter.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {typeFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">All Channels</option>
              {mockChannels.filter(c => c.type === 'social').map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </Button>
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(v) => v && setViewMode(v as 'list' | 'grid')}
            >
              <ToggleGroupItem value="list" aria-label="List view">
                <Filter className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid3X3 className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredContents.length} of {contents.length} content items
          </p>
          {filteredContents.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {filteredContents.filter(c => c.status === 'review').length} awaiting review
            </p>
          )}
        </div>

        {/* Content Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ContentTable 
            contents={filteredContents} 
            onAction={handleAction}
          />
        </motion.div>

        {filteredContents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-lg font-medium text-foreground">
              No content found
            </h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your filters or search query
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
