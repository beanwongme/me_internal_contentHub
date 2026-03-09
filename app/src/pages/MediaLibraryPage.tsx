import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Search, 
  Grid3X3, 
  List, 
  MoreHorizontal,
  Image,
  Video,
  FileText,
  Download,
  Trash2,
  Check
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { mockMediaAssets } from '@/data/mockData';
import type { MediaAsset } from '@/types';

const typeFilters = [
  { value: 'all', label: 'All', icon: null },
  { value: 'image', label: 'Images', icon: Image },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'document', label: 'Documents', icon: FileText },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function MediaLibraryPage() {
  const [assets] = useState<MediaAsset[]>(mockMediaAssets);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Get all unique tags from assets
  const allTags = Array.from(new Set(assets.flatMap(a => a.tags)));

  const toggleSelectAsset = (id: string) => {
    setSelectedAssets(prev => 
      prev.includes(id) 
        ? prev.filter(aid => aid !== id)
        : [...prev, id]
    );
  };

  const filteredAssets = assets.filter(asset => {
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesTag = tagFilter === 'all' || asset.tags.includes(tagFilter);
    const matchesSearch = searchQuery === '' ||
                         asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesTag && matchesSearch;
  });

  return (
    <AppShell>
      <Header 
        title="Media Library" 
        subtitle="Manage your images, videos, and documents."
        actions={
          <Button className="gap-2" asChild>
            <Link to="/media/upload">
              <Upload className="w-4 h-4" />
              Upload
            </Link>
          </Button>
        }
      />
      
      <div className="mt-8 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
              {typeFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setTypeFilter(filter.value)}
                  className={cn(
                    'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                    typeFilter === filter.value 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {filter.icon && <filter.icon className="w-4 h-4" />}
                    {filter.label}
                  </span>
                </button>
              ))}
            </div>

            {allTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedAssets.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedAssets.length} selected
                </span>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="destructive" size="sm" className="gap-1">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            )}
            
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(v) => v && setViewMode(v as 'grid' | 'list')}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid3X3 className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <List className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAssets.length} of {assets.length} assets
          </p>
        </div>

        {/* Assets Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card 
                  className={cn(
                    'bg-card border-border overflow-hidden cursor-pointer transition-all',
                    'hover:border-primary/30 hover:shadow-md',
                    selectedAssets.includes(asset.id) && 'ring-2 ring-primary'
                  )}
                  onClick={() => toggleSelectAsset(asset.id)}
                >
                  <div className="aspect-square relative bg-secondary">
                    {asset.type === 'image' ? (
                      <img 
                        src={asset.thumbnail || asset.url} 
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : asset.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Selection Overlay */}
                    {selectedAssets.includes(asset.id) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 left-2 text-xs capitalize"
                    >
                      {asset.type}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(asset.size)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {asset.usageCount} uses
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="w-12 p-3">
                    <Checkbox 
                      checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAssets(filteredAssets.map(a => a.id));
                        } else {
                          setSelectedAssets([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left p-3 text-sm font-medium">Asset</th>
                  <th className="text-left p-3 text-sm font-medium">Type</th>
                  <th className="text-left p-3 text-sm font-medium">Size</th>
                  <th className="text-left p-3 text-sm font-medium">Usage</th>
                  <th className="text-left p-3 text-sm font-medium">Uploaded</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    className={cn(
                      'border-t border-border hover:bg-secondary/30 transition-colors',
                      selectedAssets.includes(asset.id) && 'bg-primary/5'
                    )}
                  >
                    <td className="p-3">
                      <Checkbox 
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={() => toggleSelectAsset(asset.id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                          {asset.type === 'image' ? (
                            <Image className="w-5 h-5 text-muted-foreground" />
                          ) : asset.type === 'video' ? (
                            <Video className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium">{asset.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="capitalize">
                        {asset.type}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatFileSize(asset.size)}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {asset.usageCount} uses
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Image className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-lg font-medium text-foreground">
              No assets found
            </h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your filters or upload new media
            </p>
            <Button className="mt-4 gap-2" asChild>
              <Link to="/media/upload">
                <Upload className="w-4 h-4" />
                Upload Media
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
