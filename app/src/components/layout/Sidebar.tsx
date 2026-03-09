import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Lightbulb,
  FileText,
  Building2,
  Image,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  LayoutTemplate,
  BarChart3,
  Plug,
  Shield,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers } from '@/data/mockData';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ideas', href: '/ideas', icon: Lightbulb },
  { name: 'AI Assistant', href: '/conversation', icon: MessageSquare },
  { name: 'Social Content', href: '/social-content', icon: FileText },
  { name: 'Content Templates', href: '/content-templates', icon: LayoutTemplate },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Company Content', href: '/company-content', icon: Building2 },
  { name: 'Media Library', href: '/media', icon: Image },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'API', href: '/api', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Admin', href: '/admin', icon: Shield },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const currentUser = mockUsers[0];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-gradient-sidebar border-r border-border',
        'flex flex-col'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-heading text-xl font-bold text-foreground whitespace-nowrap"
              >
                ContentHub
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                'hover:bg-accent/10',
                isActive 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                  : 'text-muted-foreground border-l-2 border-transparent'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                isActive ? 'text-primary' : 'group-hover:text-foreground'
              )} />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-border">
        <div className={cn(
          'flex items-center gap-3 p-2 rounded-lg bg-secondary/50',
          collapsed && 'justify-center'
        )}>
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8 text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
