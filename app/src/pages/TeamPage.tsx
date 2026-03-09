import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Mail, 
  MoreHorizontal, 
  Shield, 
  PenLine, 
  Eye,
  UserCheck,
  UserX,
  Clock,
  Settings,
  Check,
  X
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { mockUsers } from '@/data/mockData';
import type { User } from '@/types';

const roleConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-primary/20 text-primary' },
  editor: { label: 'Editor', icon: PenLine, color: 'bg-success/20 text-success' },
  writer: { label: 'Writer', icon: UserCheck, color: 'bg-info/20 text-info' },
  viewer: { label: 'Viewer', icon: Eye, color: 'bg-muted text-muted-foreground' }
};

// Status configuration for future use

// Role permissions definition
const rolePermissions: Record<string, { name: string; permissions: string[] }> = {
  admin: {
    name: 'Administrator',
    permissions: [
      'Full system access',
      'Manage users and roles',
      'Configure settings',
      'Create, edit, publish all content',
      'Access analytics',
      'Manage API integrations'
    ]
  },
  editor: {
    name: 'Editor',
    permissions: [
      'Create and edit all content',
      'Publish content',
      'Review submissions',
      'Access analytics',
      'Manage media library'
    ]
  },
  writer: {
    name: 'Writer',
    permissions: [
      'Create content',
      'Edit own content',
      'Submit for review',
      'View media library'
    ]
  },
  viewer: {
    name: 'Viewer',
    permissions: [
      'View content',
      'View analytics (read-only)',
      'Cannot create or edit content'
    ]
  }
};

export function TeamPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('writer');

  const handleInvite = () => {
    console.log('Inviting:', inviteEmail, 'as', inviteRole);
    setInviteDialogOpen(false);
    setInviteEmail('');
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole as User['role'] } : u
    ));
    setRoleDialogOpen(false);
    setSelectedUser(null);
  };

  const activeUsers = users.filter(u => u.status === 'active');
  const pendingUsers = users.filter(u => u.status === 'pending');

  return (
    <AppShell>
      <Header 
        title="Team Management" 
        subtitle="Manage team members and their permissions."
        actions={
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="writer">Writer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="mt-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold mt-1">{users.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold mt-1 text-success">{activeUsers.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold mt-1 text-warning">{pendingUsers.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Members */}
        <div>
          <h2 className="font-heading text-lg font-semibold mb-4">Active Members</h2>
          <div className="space-y-3">
            {activeUsers.map((user, index) => {
              const role = roleConfig[user.role];
              const RoleIcon = role.icon;
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">{user.name}</h3>
                              <Badge 
                                variant="secondary" 
                                className={cn('text-xs gap-1', role.color)}
                              >
                                <RoleIcon className="w-3 h-3" />
                                {role.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground">Joined</p>
                            <p className="text-sm">{new Date(user.joinedAt).toLocaleDateString()}</p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setRoleDialogOpen(true);
                                }}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <UserX className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pending Invitations */}
        {pendingUsers.length > 0 && (
          <div>
            <h2 className="font-heading text-lg font-semibold mb-4">Pending Invitations</h2>
            <div className="space-y-3">
              {pendingUsers.map((user, index) => {
                const role = roleConfig[user.role];
                const RoleIcon = role.icon;
                
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="bg-card border-border border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-warning/10 text-warning">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-foreground">{user.name || user.email}</h3>
                                <Badge 
                                  variant="secondary" 
                                  className={cn('text-xs gap-1', role.color)}
                                >
                                  <RoleIcon className="w-3 h-3" />
                                  {role.label}
                                </Badge>
                                <Badge variant="secondary" className="text-xs bg-warning/20 text-warning gap-1">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Resend
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Role Management Dialog */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Manage Roles
              </DialogTitle>
              <DialogDescription>
                {selectedUser && `Change role for ${selectedUser.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {Object.entries(rolePermissions).map(([roleKey, roleData]) => {
                const isSelected = selectedUser?.role === roleKey;
                return (
                  <div
                    key={roleKey}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all',
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/30'
                    )}
                    onClick={() => selectedUser && handleChangeRole(selectedUser.id, roleKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{roleData.name}</span>
                        {isSelected && (
                          <Badge variant="default" className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {roleData.permissions.map((perm, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
