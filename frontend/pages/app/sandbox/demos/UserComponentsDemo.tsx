import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { UserMenu } from '@/components/ui/UserMenu';
import { OrgSwitcher } from '@/components/ui/OrgSwitcher';

export const UserComponentsDemo = () => {
  const [currentOrgId, setCurrentOrgId] = useState('org1');

  const mockUser = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@veribuild.com',
    avatar: undefined,
  };

  const mockOrganizations = [
    { id: 'org1', name: 'VeriBuild Construction Inc.' },
    { id: 'org2', name: 'Summit Builders LLC' },
    { id: 'org3', name: 'GreenTech Development' },
    { id: 'org4', name: 'Urban Projects Group' },
    { id: 'org5', name: 'Coastal Construction Co.' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Avatar</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Sizes</h4>
            <div className="flex items-center gap-4">
              <Avatar fallback="John Doe" size="sm" />
              <Avatar fallback="Jane Smith" size="md" />
              <Avatar fallback="Bob Wilson" size="lg" />
              <Avatar fallback="Alice Cooper" size="xl" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">With Image (Error Fallback)</h4>
            <div className="flex items-center gap-4">
              <Avatar src="https://invalid-url.com/avatar.jpg" fallback="Error Test" />
              <Avatar src="" fallback="No Source" />
              <Avatar fallback="Initials Only" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Different Names</h4>
            <div className="flex items-center gap-4">
              <Avatar fallback="A" size="md" />
              <Avatar fallback="John" size="md" />
              <Avatar fallback="Sarah Johnson" size="md" />
              <Avatar fallback="Michael Robert Thompson" size="md" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">User Menu</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Click to open the user menu (with profile, settings, logout actions)
        </p>
        <div className="inline-block">
          <UserMenu
            user={mockUser}
            onProfile={() => console.log('Profile clicked')}
            onSettings={() => console.log('Settings clicked')}
            onLogout={() => console.log('Logout clicked')}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Organization Switcher</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Features: search functionality, current selection indicator
        </p>
        <div className="max-w-xs">
          <OrgSwitcher
            organizations={mockOrganizations}
            currentOrgId={currentOrgId}
            onSwitch={(orgId) => {
              setCurrentOrgId(orgId);
              console.log('Switched to org:', orgId);
            }}
          />
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3">
          Current organization: {mockOrganizations.find((org) => org.id === currentOrgId)?.name}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Combined Example</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Typical header layout with org switcher and user menu
        </p>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">VeriBuild</h2>
              <div className="w-64">
                <OrgSwitcher
                  organizations={mockOrganizations}
                  currentOrgId={currentOrgId}
                  onSwitch={setCurrentOrgId}
                />
              </div>
            </div>
            <UserMenu
              user={mockUser}
              onProfile={() => console.log('Profile')}
              onSettings={() => console.log('Settings')}
              onLogout={() => console.log('Logout')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
