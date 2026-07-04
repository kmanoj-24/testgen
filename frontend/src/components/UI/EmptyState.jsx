import { FileQuestion, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  actionLabel,
  actionIcon = ArrowRight,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="mb-6 p-4 rounded-2xl bg-secondary border border-border">
        <Icon className="h-8 w-8 text-foreground-muted" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground-muted max-w-sm mb-6">{description}</p>
      {onAction && (
        <Button onClick={onAction} icon={actionIcon} iconRight={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};