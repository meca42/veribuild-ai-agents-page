import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-10 text-sm text-neutral-900',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500',
            'dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100',
            'dark:disabled:bg-neutral-900 dark:disabled:text-neutral-600',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-neutral-500 dark:text-neutral-400"
          aria-hidden="true"
        />
      </div>
    );
  }
);

Select.displayName = 'Select';
