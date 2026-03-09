import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Filter, RefreshCw, Bookmark } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { IdeaCard } from '@/components/content/IdeaCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockIdeas } from '@/data/mockData';
import type { Idea } from '@/types';

export function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConvert = (idea: Idea) => {
    // In a real app, this would navigate to the brief editor
    console.log('Converting idea:', idea);
  };

  const handleSave = (idea: Idea) => {
    setIdeas(prev => prev.map(i => 
      i.id === idea.id ? { ...i, saved: !i.saved } : i
    ));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesFilter = filter === 'all' ? true :
                         filter === 'saved' ? idea.saved :
                         filter === 'high' ? idea.relevanceScore >= 80 :
                         filter === 'medium' ? idea.relevanceScore >= 60 && idea.relevanceScore < 80 :
                         idea.relevanceScore < 60;
    
    const matchesSearch = searchQuery === '' ||
                         idea.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const savedCount = ideas.filter(i => i.saved).length;

  return (
    <AppShell>
      <Header 
        title="AI Research Hub" 
        subtitle="Daily curated content ideas powered by AI research agents."
      />
      
      <div className="mt-8 space-y-6">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm text-foreground">
              <span className="font-medium">Today's Research Complete:</span> Generated 10 new ideas from 847 sources across your keyword pools.
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={16} />
            Refresh
          </Button>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All Ideas</TabsTrigger>
              <TabsTrigger value="saved" className="gap-1">
                <Bookmark className="w-3 h-3" />
                Saved
                {savedCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {savedCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="high">High Relevance</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Filter by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredIdeas.length} of {ideas.length} ideas
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <Badge variant="secondary" className="text-xs cursor-pointer">
              Relevance
            </Badge>
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea, index) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onConvert={handleConvert}
              onSave={handleSave}
              index={index}
            />
          ))}
        </div>

        {filteredIdeas.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-medium text-foreground">
              No ideas found
            </h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
