import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Icon size={32} className="text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--vb-neutral-900)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--vb-neutral-600)] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-[var(--vb-primary)] hover:bg-[var(--vb-primary)]/90">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
