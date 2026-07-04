import { Loader2, Sparkles } from 'lucide-react';

export const Loading = ({ message = 'Loading...', size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-primary`} />
        <div className="absolute inset-0 animate-ping opacity-20">
          <Sparkles className={`${sizes[size] || sizes.md} text-primary`} />
        </div>
      </div>
      {message && (
        <p className="text-sm text-foreground-muted font-medium animate-pulse-soft">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
};