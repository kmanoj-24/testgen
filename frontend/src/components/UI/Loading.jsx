import { Loader2 } from 'lucide-react';

export const Loading = ({ message = 'Loading...', size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const content = (
    <div className="flex flex-col items-center gap-2">
      <Loader2 className={`${sizes[size]} animate-spin text-primary`} />
      {message && <p className="text-xs text-foreground-muted">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
};