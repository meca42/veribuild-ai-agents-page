import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { Button } from './Button';

export interface JSONViewProps {
  data: any;
  className?: string;
}

export const JSONView = ({ data, className }: JSONViewProps) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          aria-label={copied ? 'Copied' : 'Copy JSON'}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre
        className={cn(
          'rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-4 overflow-x-auto text-xs font-mono',
          'text-neutral-900 dark:text-neutral-100'
        )}
        aria-label="JSON data"
      >
        {jsonString}
      </pre>
    </div>
  );
};
