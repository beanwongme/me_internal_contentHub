import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Package, 
  Users, 
  Award,
  Plus,
  Edit,
  Eye,
  MapPin,
  Calendar,
  Linkedin,
  Twitter,
  User
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { mockCompanyProfile, mockProducts, mockCaseStudies } from '@/data/mockData';

const sections = [
  { id: 'company', name: 'Company Profile', icon: Building2 },
  { id: 'persons', name: 'Key Persons', icon: User },
  { id: 'milestones', name: 'Milestones', icon: Calendar },
  { id: 'locations', name: 'Locations', icon: MapPin },
  { id: 'products', name: 'Products & Services', icon: Package },
  { id: 'clients', name: 'Clients & Projects', icon: Users },
  { id: 'awards', name: 'Awards & Recognition', icon: Award },
];

// Mock data for Key Persons
const mockKeyPersons = [
  {
    id: '1',
    name: 'John Smith',
    title: 'Chief Executive Officer',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    bio: 'John has over 20 years of experience in technology leadership and has been instrumental in driving company growth.',
    shortDescription: 'Visionary leader with 20+ years in tech',
    links: { linkedin: 'https://linkedin.com/in/johnsmith', twitter: 'https://twitter.com/johnsmith' },
    socialMedia: { linkedin: 'johnsmith', twitter: '@johnsmith' }
  },
  {
    id: '2',
    name: 'Sarah Chen',
    title: 'Chief Technology Officer',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    bio: 'Sarah leads our engineering teams and oversees all technical strategy and product development.',
    shortDescription: 'Tech innovator and engineering leader',
    links: { linkedin: 'https://linkedin.com/in/sarahchen', twitter: 'https://twitter.com/sarahchen' },
    socialMedia: { linkedin: 'sarahchen', twitter: '@sarahchen' }
  },
  {
    id: '3',
    name: 'Michael Wong',
    title: 'Chief Marketing Officer',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    bio: 'Michael drives our brand strategy and marketing initiatives across all channels.',
    shortDescription: 'Marketing strategist with global experience',
    links: { linkedin: 'https://linkedin.com/in/michaelwong' },
    socialMedia: { linkedin: 'michaelwong' }
  }
];

// Mock data for Milestones
const mockMilestones = [
  { year: 2015, event: 'Company founded in Hong Kong' },
  { year: 2017, event: 'Launched first product - SmartWidget' },
  { year: 2018, event: 'Expanded to Singapore market' },
  { year: 2020, event: 'Reached 100 employees milestone' },
  { year: 2021, event: 'Series B funding - $50M raised' },
  { year: 2022, event: 'Opened Tokyo office' },
  { year: 2023, event: 'Launched AI-powered platform' },
  { year: 2024, event: '10-year anniversary celebration' }
];

// Mock data for Locations with categories
const mockLocations = [
  { 
    id: '1', 
    name: 'Hong Kong Headquarters', 
    type: 'office' as const, 
    category: 'Headquarters',
    address: 'Central Plaza, 18 Harbour Road, Wanchai, Hong Kong',
    phone: '+852 1234 5678'
  },
  { 
    id: '2', 
    name: 'Singapore Office', 
    type: 'office' as const, 
    category: 'Regional Office',
    address: 'Marina Bay Financial Centre, Singapore',
    phone: '+65 6789 0123'
  },
  { 
    id: '3', 
    name: 'Tokyo Office', 
    type: 'office' as const, 
    category: 'Regional Office',
    address: 'Roppongi Hills, Tokyo, Japan',
    phone: '+81 3-1234-5678'
  },
  { 
    id: '4', 
    name: 'Causeway Bay Store', 
    type: 'store' as const, 
    category: 'Retail',
    address: 'Times Square, Causeway Bay, Hong Kong',
    phone: '+852 2345 6789'
  },
  { 
    id: '5', 
    name: 'Tsim Sha Tsui Store', 
    type: 'store' as const, 
    category: 'Retail',
    address: 'Harbour City, Tsim Sha Tsui, Hong Kong',
    phone: '+852 3456 7890'
  }
];

export function CompanyContentPage() {
  const [activeSection, setActiveSection] = useState('company');
  const [editing, setEditing] = useState(false);

  return (
    <AppShell>
      <Header 
        title="Company Content" 
        subtitle="Manage your company knowledge base and content assets."
      />
      
      <div className="mt-8">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="bg-secondary flex-wrap h-auto gap-1">
            {sections.map((section) => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="gap-2"
              >
                <section.icon className="w-4 h-4" />
                {section.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Company Profile</h2>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setEditing(!editing)}
              >
                <Edit className="w-4 h-4" />
                {editing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input 
                      defaultValue={mockCompanyProfile.name}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Legal Name</Label>
                    <Input 
                      defaultValue={mockCompanyProfile.legalName}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input 
                    defaultValue={mockCompanyProfile.tagline.en}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Overview</Label>
                  <Textarea 
                    defaultValue={mockCompanyProfile.overview.en}
                    disabled={!editing}
                    className="min-h-[120px]"
                  />
                </div>

                <Separator />

                {/* Locations */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Locations</Label>
                    {editing && (
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Plus className="w-4 h-4" />
                        Add Location
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {mockCompanyProfile.locations.map((location, index) => (
                      <Card key={index} className="bg-secondary/50 border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{location.city}</h4>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {location.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {location.address}
                              </p>
                            </div>
                            {editing && (
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {editing && (
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setEditing(false)}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Products & Services</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {mockProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {product.name.en}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.description.short.en}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {product.category.map((cat) => (
                              <Badge key={cat} variant="secondary" className="text-xs capitalize">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Features</p>
                            <p className="text-sm font-medium">{product.features.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Use Cases</p>
                            <p className="text-sm font-medium">{product.useCases.length}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            'text-xs capitalize',
                            product.availability === 'in_stock' && 'bg-success/20 text-success'
                          )}
                        >
                          {product.availability.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Case Studies</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Case Study
              </Button>
            </div>

            <div className="space-y-4">
              {mockCaseStudies.map((caseStudy, index) => (
                <motion.div
                  key={caseStudy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">
                              {caseStudy.title}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                'text-xs',
                                caseStudy.approvalStatus === 'client_approved' 
                                  ? 'bg-success/20 text-success' 
                                  : 'bg-warning/20 text-warning'
                              )}
                            >
                              {caseStudy.approvalStatus.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {caseStudy.client.name} • {caseStudy.client.industry}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 mt-4">
                            {caseStudy.results.metrics.map((metric, i) => (
                              <div key={i}>
                                <p className="text-xs text-muted-foreground">{metric.label}</p>
                                <p className="text-sm font-medium">
                                  {metric.value}
                                  {metric.change && (
                                    <span className="text-success ml-1">{metric.change}</span>
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="persons" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Key Persons</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Person
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockKeyPersons.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={person.photo} alt={person.name} />
                          <AvatarFallback className="text-lg">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">{person.name}</h3>
                          <p className="text-sm text-primary">{person.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {person.shortDescription}
                          </p>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {person.bio}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-4">
                        {person.links.linkedin && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={person.links.linkedin} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {person.links.twitter && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={person.links.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <div className="flex-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Company Milestones</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Milestone
              </Button>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {mockMilestones.map((milestone, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative flex items-start gap-4 pl-10"
                      >
                        <div className="absolute left-2 w-5 h-5 rounded-full bg-primary border-4 border-background" />
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-1">
                            {milestone.year}
                          </Badge>
                          <p className="text-foreground">{milestone.event}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Locations</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Location
              </Button>
            </div>

            <Tabs defaultValue="office" className="space-y-4">
              <TabsList className="bg-secondary">
                <TabsTrigger value="office" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Offices
                </TabsTrigger>
                <TabsTrigger value="store" className="gap-2">
                  <MapPin className="w-4 h-4" />
                  Stores
                </TabsTrigger>
              </TabsList>

              <TabsContent value="office" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {mockLocations.filter(l => l.type === 'office').map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="bg-card border-border">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{location.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {location.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {location.address}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {location.phone}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="store" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {mockLocations.filter(l => l.type === 'store').map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="bg-card border-border">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{location.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {location.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {location.address}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {location.phone}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="awards" className="space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-lg font-medium text-foreground">
                  Awards & Recognition
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Track your company awards, certifications, and industry recognition. Coming soon.
                </p>
                <Button className="mt-6 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Award
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
