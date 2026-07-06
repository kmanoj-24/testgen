import { FileQuestion } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
    <div className="mb-4 p-3 rounded-lg bg-secondary border border-border">
      <Icon className="h-6 w-6 text-foreground-muted" strokeWidth={1.5} />
    </div>
    <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-xs text-foreground-muted max-w-xs mb-4">{description}</p>
    {onAction && actionLabel && (
      <button onClick={onAction} className="btn-primary text-xs">
        {actionLabel}
      </button>
    )}
  </div>
);