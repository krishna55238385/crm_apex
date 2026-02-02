'use client';

import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { User, Building, Users, Bot, Palette, Bell, Shield, Workflow } from 'lucide-react';

interface SettingsNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SettingsNav({ activeTab, setActiveTab }: SettingsNavProps) {
  const { hasRole } = useAuth();

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User, roles: ['user', 'admin', 'super_admin'] },
    { id: 'appearance', label: 'Appearance', icon: Palette, roles: ['user', 'admin', 'super_admin'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['user', 'admin', 'super_admin'] },
    { id: 'divider-1', type: 'divider', roles: ['admin', 'super_admin'] },
    { id: 'workspace', label: 'Workspace', icon: Building, roles: ['admin', 'super_admin'] },
    { id: 'users', label: 'Users & Roles', icon: Users, roles: ['admin', 'super_admin'] },
    { id: 'lead-management', label: 'Lead Management', icon: Workflow, roles: ['admin', 'super_admin'] },
    { id: 'automation', label: 'Automation & AI', icon: Bot, roles: ['admin', 'super_admin'] },
    { id: 'divider-2', type: 'divider', roles: ['super_admin'] },
    { id: 'security', label: 'Security', icon: Shield, roles: ['super_admin'] },
  ];

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => {
        if (item.roles && !hasRole(item.roles as any)) {
          return null;
        }

        if (item.type === 'divider') {
          return <div key={item.id} className="py-2"><hr className="border-border" /></div>;
        }
        
        const Icon = item.icon!;

        return (
          <button
            key={item.id}
            onClick={() => !item.disabled && setActiveTab(item.id)}
            disabled={item.disabled}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors w-full',
              activeTab === item.id
                ? 'bg-muted text-primary font-semibold'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              item.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
