import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { ButtonDemo } from './demos/ButtonDemo';
import { FormInputsDemo } from './demos/FormInputsDemo';
import { BadgesDemo } from './demos/BadgesDemo';
import { TableDemo } from './demos/TableDemo';
import { ModalsDemo } from './demos/ModalsDemo';
import { NavigationDemo } from './demos/NavigationDemo';
import { ToastDemo } from './demos/ToastDemo';
import { SkeletonDemo } from './demos/SkeletonDemo';
import { UserComponentsDemo } from './demos/UserComponentsDemo';
import { JSONViewDemo } from './demos/JSONViewDemo';
import { FileUploaderDemo } from './demos/FileUploaderDemo';
import { DateTimeDemo } from './demos/DateTimeDemo';

export default function Sandbox() {
  const [activeTab, setActiveTab] = useState('button');

  const tabs = [
    { id: 'button', label: 'Button', content: <ButtonDemo /> },
    { id: 'forms', label: 'Form Inputs', content: <FormInputsDemo /> },
    { id: 'badges', label: 'Badges & Pills', content: <BadgesDemo /> },
    { id: 'table', label: 'Table', content: <TableDemo /> },
    { id: 'modals', label: 'Modals & Dialogs', content: <ModalsDemo /> },
    { id: 'navigation', label: 'Navigation', content: <NavigationDemo /> },
    { id: 'toast', label: 'Toast', content: <ToastDemo /> },
    { id: 'skeleton', label: 'Skeleton', content: <SkeletonDemo /> },
    { id: 'user', label: 'User Components', content: <UserComponentsDemo /> },
    { id: 'json', label: 'JSON View', content: <JSONViewDemo /> },
    { id: 'upload', label: 'File Uploader', content: <FileUploaderDemo /> },
    { id: 'datetime', label: 'Date & Time', content: <DateTimeDemo /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            VeriBuild UI Component Library
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Interactive playground for all UI components with accessible, responsive designs
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <Tabs tabs={tabs} defaultTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
}
