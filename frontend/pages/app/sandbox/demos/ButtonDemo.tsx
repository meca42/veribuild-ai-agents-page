import { useState } from 'react';
import { Plus, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup } from '@/components/ui/RadioGroup';

export const ButtonDemo = () => {
  const [variant, setVariant] = useState<'primary' | 'secondary' | 'ghost' | 'destructive'>('primary');
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [loading, setLoading] = useState(false);
  const [showLeftIcon, setShowLeftIcon] = useState(false);
  const [showRightIcon, setShowRightIcon] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Interactive Demo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Variant</label>
              <RadioGroup
                name="variant"
                options={[
                  { value: 'primary', label: 'Primary' },
                  { value: 'secondary', label: 'Secondary' },
                  { value: 'ghost', label: 'Ghost' },
                  { value: 'destructive', label: 'Destructive' },
                ]}
                value={variant}
                onChange={(val) => setVariant(val as any)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">Size</label>
              <RadioGroup
                name="size"
                options={[
                  { value: 'sm', label: 'Small' },
                  { value: 'md', label: 'Medium' },
                  { value: 'lg', label: 'Large' },
                ]}
                value={size}
                onChange={(val) => setSize(val as any)}
                orientation="horizontal"
              />
            </div>

            <div className="space-y-2">
              <Checkbox label="Loading state" checked={loading} onChange={(e) => setLoading(e.target.checked)} />
              <Checkbox label="Left icon" checked={showLeftIcon} onChange={(e) => setShowLeftIcon(e.target.checked)} />
              <Checkbox label="Right icon" checked={showRightIcon} onChange={(e) => setShowRightIcon(e.target.checked)} />
              <Checkbox label="Disabled" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
            </div>
          </div>

          <div className="flex items-center justify-center p-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <Button
              variant={variant}
              size={size}
              loading={loading}
              leftIcon={showLeftIcon && <Plus className="h-4 w-4" />}
              rightIcon={showRightIcon && <Download className="h-4 w-4" />}
              disabled={disabled}
            >
              Click Me
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">All Variants</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Primary</h4>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>With Icon</Button>
            <Button variant="primary" loading>Loading</Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Secondary</h4>
            <Button variant="secondary" size="sm">Small</Button>
            <Button variant="secondary">Medium</Button>
            <Button variant="secondary" size="lg">Large</Button>
            <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />}>With Icon</Button>
            <Button variant="secondary" loading>Loading</Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ghost</h4>
            <Button variant="ghost" size="sm">Small</Button>
            <Button variant="ghost">Medium</Button>
            <Button variant="ghost" size="lg">Large</Button>
            <Button variant="ghost" leftIcon={<Plus className="h-4 w-4" />}>With Icon</Button>
            <Button variant="ghost" disabled>Disabled</Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Destructive</h4>
            <Button variant="destructive" size="sm">Small</Button>
            <Button variant="destructive">Medium</Button>
            <Button variant="destructive" size="lg">Large</Button>
            <Button variant="destructive" leftIcon={<Trash2 className="h-4 w-4" />}>With Icon</Button>
            <Button variant="destructive" disabled>Disabled</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
