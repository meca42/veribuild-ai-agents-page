import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/ui/cn';
import { stepStatusColors, phaseStatusColors, type StepStatus, type PhaseStatus } from '@/lib/ui/status-colors';

export interface StatusPillProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: StepStatus | PhaseStatus;
  type?: 'step' | 'phase';
}

export const StatusPill = ({ status, type = 'step', className, ...props }: StatusPillProps) => {
  const colors = type === 'step' 
    ? stepStatusColors[status as StepStatus] 
    : phaseStatusColors[status as PhaseStatus];

  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
};
