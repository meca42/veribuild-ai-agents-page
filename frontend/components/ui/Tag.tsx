import { type HTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}

export const Tag = ({ className, children, onRemove, ...props }: TagProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-sm text-neutral-700 border border-neutral-200',
        'dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label="Remove tag"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  );
};
