import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/ui/cn';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `toggle-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              'block h-6 w-11 rounded-full bg-neutral-300 cursor-pointer transition-colors',
              'peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2',
              'peer-checked:bg-blue-600',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              'dark:bg-neutral-600 dark:peer-checked:bg-blue-500',
              className
            )}
          >
            <span
              className={cn(
                'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                'peer-checked:translate-x-5'
              )}
              aria-hidden="true"
            />
          </label>
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';
