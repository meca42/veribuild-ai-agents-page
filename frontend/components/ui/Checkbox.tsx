import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/ui/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={cn(
              'peer h-5 w-5 appearance-none rounded border-2 border-neutral-300 bg-white cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'checked:bg-blue-600 checked:border-blue-600',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-neutral-600 dark:bg-neutral-800',
              className
            )}
            {...props}
          />
          <Check
            className="absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
            aria-hidden="true"
          />
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

Checkbox.displayName = 'Checkbox';
