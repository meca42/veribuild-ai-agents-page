import { type ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

export interface FormRowProps {
  label?: string;
  htmlFor?: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const FormRow = ({ label, htmlFor, help, error, required, children, className }: FormRowProps) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
        >
          {label}
          {required && <span className="text-red-600 dark:text-red-400 ml-1" aria-label="required">*</span>}
        </label>
      )}

      {children}

      {help && !error && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400" id={htmlFor ? `${htmlFor}-help` : undefined}>
          {help}
        </p>
      )}

      {error && (
        <p
          className="text-xs text-red-600 dark:text-red-400"
          id={htmlFor ? `${htmlFor}-error` : undefined}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};
