import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Accordion } from '@/components/ui/Accordion';

export const NavigationDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded">
          <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Overview Content</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            This is the overview tab content. Switch between tabs to see different content.
          </p>
        </div>
      ),
    },
    {
      id: 'details',
      label: 'Details',
      content: (
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded">
          <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Details Content</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Detailed information goes here. Each tab can contain any React component.
          </p>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded">
          <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Settings Content</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Settings and configuration options would be displayed here.
          </p>
        </div>
      ),
    },
    {
      id: 'disabled',
      label: 'Disabled',
      content: <div>This tab is disabled</div>,
      disabled: true,
    },
  ];

  const breadcrumbItems = [
    { label: 'Home', onClick: () => console.log('Home clicked') },
    { label: 'Projects', onClick: () => console.log('Projects clicked') },
    { label: 'Project Alpha', onClick: () => console.log('Project Alpha clicked') },
    { label: 'Tasks' },
  ];

  const accordionItems = [
    {
      id: 'item1',
      title: 'What is VeriBuild?',
      content: (
        <p className="text-sm">
          VeriBuild is a comprehensive construction management platform that helps teams collaborate on building
          projects, manage workflows, and ensure quality compliance.
        </p>
      ),
    },
    {
      id: 'item2',
      title: 'How do I create a new project?',
      content: (
        <div className="text-sm space-y-2">
          <p>To create a new project:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Navigate to the Projects page</li>
            <li>Click the "New Project" button</li>
            <li>Fill in the project details</li>
            <li>Click "Create" to save</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'item3',
      title: 'Can I invite team members?',
      content: (
        <p className="text-sm">
          Yes! You can invite team members from the Settings page. Each team member can be assigned specific roles
          and permissions for different projects.
        </p>
      ),
    },
    {
      id: 'item4',
      title: 'How does the AI agent work?',
      content: (
        <p className="text-sm">
          The AI agent analyzes your project data, identifies potential issues, suggests optimizations, and helps
          automate routine tasks. It learns from your workflow patterns to provide increasingly helpful suggestions.
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Tabs</h3>
        <Tabs tabs={tabs} defaultTab={activeTab} onChange={setActiveTab} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Breadcrumbs</h3>
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Accordion</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Single item open by default (set allowMultiple prop for multi-expand)
        </p>
        <Accordion items={accordionItems} defaultOpen={['item1']} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Accordion (Multiple Open)</h3>
        <Accordion items={accordionItems} allowMultiple defaultOpen={['item1', 'item2']} />
      </div>
    </div>
  );
};
