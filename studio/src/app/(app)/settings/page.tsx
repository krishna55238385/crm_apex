'use client';

import { useState } from 'react';
import SettingsNav from '@/components/settings/settings-nav';
import ProfileSettings from '@/components/settings/profile-settings';
import { useAuth } from '@/hooks/use-auth';
import { Shield, Bot, Users, Building, HardDrive, Bell, Palette } from 'lucide-react';
import WorkspaceSettings from '@/components/settings/workspace-settings';
import AppearanceSettings from '@/components/settings/appearance-settings';
import PlaceholderSection from '@/components/settings/placeholder-section';
import AutomationSettings from '@/components/settings/automation-settings';
import LeadManagementSettings from '@/components/settings/lead-management-settings';
import SecuritySettings from '@/components/settings/security-settings';
import NotificationSettings from '@/components/settings/notification-settings';
import UsersAndRolesSettings from '@/components/settings/users-roles-settings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { hasRole } = useAuth();

  const renderContent = () => {
    // A simple router for the settings content
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'workspace':
        if (hasRole(['admin', 'super_admin'])) {
          return <WorkspaceSettings />;
        }
        return <PlaceholderSection title="Access Denied" description="You do not have permission to view workspace settings." icon={Shield} />;
      case 'users':
         if (hasRole(['admin', 'super_admin'])) {
            return <UsersAndRolesSettings />;
         }
         return null;
      case 'lead-management':
          if (hasRole(['admin', 'super_admin'])) {
            return <LeadManagementSettings />;
          }
          return null;
      case 'automation':
          if (hasRole(['admin', 'super_admin'])) {
            return <AutomationSettings />;
          }
          return null;
       case 'security':
          if (hasRole(['super_admin'])) {
             return <SecuritySettings />;
          }
          return null;
        case 'notifications':
            return <NotificationSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your personal and workspace settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-1">
          <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="lg:col-span-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
