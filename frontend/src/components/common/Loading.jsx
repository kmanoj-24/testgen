import { Loader2 } from 'lucide-react';

export const Loading = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-8">
      <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};