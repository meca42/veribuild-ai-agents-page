import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/ui/cn';
import { badgeColors, type BadgeVariant } from '@/lib/ui/status-colors';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ variant = 'neutral', className, children, ...props }: BadgeProps) => {
  const colors = badgeColors[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
