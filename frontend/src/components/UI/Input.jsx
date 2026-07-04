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
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`input ${Icon ? 'pl-10' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-danger">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}
      {helper && !error && (
        <p className="text-xs text-foreground-subtle">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';