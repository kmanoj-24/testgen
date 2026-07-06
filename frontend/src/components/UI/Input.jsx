import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const Input = forwardRef(({
  label,
  helper,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle pointer-events-none">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${Icon ? 'pl-10' : ''} ${error ? 'border-danger/50 focus:ring-danger/20 focus:border-danger' : ''} ${className}`}
          {...props}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-danger pointer-events-none">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger font-medium mt-1">{error}</p>
      )}
      {helper && !error && (
        <p className="text-xs text-foreground-subtle mt-1">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
