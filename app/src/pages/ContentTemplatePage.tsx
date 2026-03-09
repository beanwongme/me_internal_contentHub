import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  LayoutTemplate, 
  Edit, 
  Trash2, 
  Copy,
  MessageSquare,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AtSign,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Globe2
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { mockChannels } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select';
  required: boolean;
  languages: string[];
  channels: string[];
}

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
  tone: string;
  createdAt: string;
}

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'casual', label: 'Casual' },
  { value: 'technical', label: 'Technical' }
];

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' }
];

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  thread: AtSign,
  wordpress: Globe2
};

const socialChannels = mockChannels.filter(c => c.type === 'social');

export function ContentTemplatePage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([
    {
      id: '1',
      name: 'Product Launch Announcement',
      description: 'Standard template for announcing new product launches across social channels',
      fields: [
        { id: 'f1', name: 'Product Name', type: 'text', required: true, languages: ['en'], channels: ['1', '2', '3', '4', '5'] },
        { id: 'f2', name: 'Key Features', type: 'textarea', required: true, languages: ['en'], channels: ['1', '5'] },
        { id: 'f3', name: 'Call to Action', type: 'text', required: false, languages: ['en'], channels: ['1', '2', '3', '4', '5'] }
      ],
      tone: 'professional',
      createdAt: '2024-03-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Weekly Newsletter',
      description: 'Template for weekly company updates and news',
      fields: [
        { id: 'f1', name: 'Week Highlights', type: 'textarea', required: true, languages: ['en'], channels: ['1', '5'] },
        { id: 'f2', name: 'Upcoming Events', type: 'textarea', required: false, languages: ['en'], channels: ['1', '2', '5'] }
      ],
      tone: 'friendly',
      createdAt: '2024-03-05T00:00:00Z'
    },
    {
      id: '3',
      name: 'Customer Success Story',
      description: 'Template for sharing customer testimonials and case studies',
      fields: [
        { id: 'f1', name: 'Customer Name', type: 'text', required: true, languages: ['en'], channels: ['1', '2', '3', '4', '5'] },
        { id: 'f2', name: 'Challenge', type: 'textarea', required: true, languages: ['en'], channels: ['1', '5'] },
        { id: 'f3', name: 'Solution', type: 'textarea', required: true, languages: ['en'], channels: ['1', '5'] },
        { id: 'f4', name: 'Results', type: 'textarea', required: true, languages: ['en'], channels: ['1', '5'] }
      ],
      tone: 'enthusiastic',
      createdAt: '2024-03-08T00:00:00Z'
    }
  ]);

  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<ContentTemplate>>({
    name: '',
    description: '',
    tone: 'professional',
    fields: []
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newField, setNewField] = useState<Partial<TemplateField>>({
    name: '',
    type: 'text',
    required: false,
    channels: []
  });

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleDuplicate = (template: ContentTemplate) => {
    const newTemplate: ContentTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name) return;
    
    const template: ContentTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description || '',
      tone: newTemplate.tone || 'professional',
      fields: newTemplate.fields || [],
      createdAt: new Date().toISOString()
    };
    
    setTemplates(prev => [...prev, template]);
    setIsCreating(false);
    setNewTemplate({ name: '', description: '', tone: 'professional', fields: [] });
  };

  const handleUpdateTemplate = (id: string, updates: Partial<ContentTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleAddField = (templateId: string) => {
    if (!newField.name) return;
    
    const field: TemplateField = {
      id: `f${Date.now()}`,
      name: newField.name,
      type: (newField.type as 'text' | 'textarea' | 'select') || 'text',
      required: newField.required || false,
      languages: ['en'],
      channels: newField.channels || []
    };
    
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { ...t, fields: [...t.fields, field] }
        : t
    ));
    
    setNewField({ name: '', type: 'text', required: false, channels: [] });
    setEditingField(null);
  };

  const handleUpdateField = (templateId: string, fieldId: string, updates: Partial<TemplateField>) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { ...t, fields: t.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) }
        : t
    ));
  };

  const handleDeleteField = (templateId: string, fieldId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { ...t, fields: t.fields.filter(f => f.id !== fieldId) }
        : t
    ));
  };

  const toggleChannelForField = (templateId: string, fieldId: string, channelId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { 
            ...t, 
            fields: t.fields.map(f => {
              if (f.id !== fieldId) return f;
              const channels = f.channels.includes(channelId)
                ? f.channels.filter(c => c !== channelId)
                : [...f.channels, channelId];
              return { ...f, channels };
            })
          }
        : t
    ));
  };

  const getChannelIcon = (platform: string) => {
    const Icon = channelIcons[platform] || Globe2;
    return Icon;
  };

  return (
    <AppShell>
      <Header 
        title="Content Templates" 
        subtitle="Create and manage reusable content templates for your social media."
        actions={
          !isCreating && (
            <Button className="gap-2" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          )
        }
      />

      <div className="mt-8 space-y-6">
        {/* Create New Template Form */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border border-primary/30">
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input 
                    placeholder="e.g. Product Launch Announcement" 
                    value={newTemplate.name}
                    onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the purpose of this template..."
                    value={newTemplate.description}
                    onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Tone</Label>
                  <Select 
                    value={newTemplate.tone} 
                    onValueChange={tone => setNewTemplate({ ...newTemplate, tone })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map(tone => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className={cn(
                "bg-card border-border h-full transition-colors",
                expandedTemplate === template.id && "border-primary/30"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <LayoutTemplate className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        {editingTemplate === template.id ? (
                          <Input 
                            value={template.name}
                            onChange={e => handleUpdateTemplate(template.id, { name: e.target.value })}
                            className="h-8 text-sm font-medium"
                            onBlur={() => setEditingTemplate(null)}
                            onKeyDown={e => e.key === 'Enter' && setEditingTemplate(null)}
                            autoFocus
                          />
                        ) : (
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {template.fields.length} fields
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs capitalize">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {template.tone}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Expand/Collapse Fields */}
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => setExpandedTemplate(
                        expandedTemplate === template.id ? null : template.id
                      )}
                    >
                      <span className="text-xs font-medium">Fields & Channel Config</span>
                      {expandedTemplate === template.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>

                    {expandedTemplate === template.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-3"
                      >
                        {/* Existing Fields */}
                        {template.fields.map((field) => (
                          <div key={field.id} className="p-3 rounded-lg bg-secondary/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <Input 
                                  value={field.name}
                                  onChange={e => handleUpdateField(template.id, field.id, { name: e.target.value })}
                                  className="h-7 text-sm flex-1"
                                />
                                <Select 
                                  value={field.type}
                                  onValueChange={type => handleUpdateField(template.id, field.id, { type: type as any })}
                                >
                                  <SelectTrigger className="w-24 h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {fieldTypes.map(t => (
                                      <SelectItem key={t.value} value={t.value} className="text-xs">
                                        {t.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 ml-1"
                                onClick={() => handleDeleteField(template.id, field.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            {/* Channel Selection for Field */}
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Channels:</p>
                              <div className="flex flex-wrap gap-1">
                                {socialChannels.map(channel => {
                                  const ChannelIcon = getChannelIcon(channel.platform);
                                  const isSelected = field.channels.includes(channel.id);
                                  return (
                                    <button
                                      key={channel.id}
                                      onClick={() => toggleChannelForField(template.id, field.id, channel.id)}
                                      className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                                        isSelected 
                                          ? "bg-primary/20 text-primary" 
                                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                                      )}
                                    >
                                      <ChannelIcon className="w-3 h-3" />
                                      {channel.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={`required-${field.id}`}
                                checked={field.required}
                                onCheckedChange={checked => 
                                  handleUpdateField(template.id, field.id, { required: checked as boolean })
                                }
                              />
                              <Label htmlFor={`required-${field.id}`} className="text-xs cursor-pointer">
                                Required field
                              </Label>
                            </div>
                          </div>
                        ))}

                        {/* Add New Field */}
                        {editingField === template.id ? (
                          <div className="p-3 rounded-lg border border-primary/30 space-y-2">
                            <Input 
                              placeholder="Field name"
                              value={newField.name}
                              onChange={e => setNewField({ ...newField, name: e.target.value })}
                              className="h-8 text-sm"
                            />
                            <Select 
                              value={newField.type}
                              onValueChange={type => setNewField({ ...newField, type: type as any })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map(t => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Select channels:</p>
                              <div className="flex flex-wrap gap-1">
                                {socialChannels.map(channel => {
                                  const ChannelIcon = getChannelIcon(channel.platform);
                                  const isSelected = (newField.channels || []).includes(channel.id);
                                  return (
                                    <button
                                      key={channel.id}
                                      onClick={() => {
                                        const channels = newField.channels || [];
                                        setNewField({
                                          ...newField,
                                          channels: channels.includes(channel.id)
                                            ? channels.filter(c => c !== channel.id)
                                            : [...channels, channel.id]
                                        });
                                      }}
                                      className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                                        isSelected 
                                          ? "bg-primary/20 text-primary" 
                                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                                      )}
                                    >
                                      <ChannelIcon className="w-3 h-3" />
                                      {channel.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleAddField(template.id)}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingField(null);
                                  setNewField({ name: '', type: 'text', required: false, channels: [] });
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-1"
                            onClick={() => setEditingField(template.id)}
                          >
                            <Plus className="w-3 h-3" />
                            Add Field
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setEditingTemplate(template.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <LayoutTemplate className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-medium">No templates yet</h3>
            <p className="text-muted-foreground mt-1">
              Create your first content template to get started
            </p>
            <Button className="mt-4 gap-2" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4" />
              Create Template
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
