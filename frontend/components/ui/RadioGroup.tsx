import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/ui/cn';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="radio"
            id={inputId}
            className={cn(
              'peer h-5 w-5 appearance-none rounded-full border-2 border-neutral-300 bg-white cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'checked:border-blue-600 checked:border-[6px]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-neutral-600 dark:bg-neutral-800',
              className
            )}
            {...props}
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

Radio.displayName = 'Radio';

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ name, options, value, onChange, orientation = 'vertical', className }, ref) => {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          'flex gap-3',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          className
        )}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            disabled={option.disabled}
          />
        ))}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
