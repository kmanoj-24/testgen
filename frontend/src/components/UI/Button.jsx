import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    success: 'bg-success text-success-foreground hover:bg-success/90',
    outline: 'border border-border bg-transparent text-foreground hover:bg-secondary',
  };

  const sizeClasses = {
    sm: 'h-7 px-2.5 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    icon: 'h-9 w-9',
  };

  const classes = `${baseClasses[variant] || baseClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {!loading && Icon && <Icon className="h-4 w-4" />}
      {children && <span>{children}</span>}
      {!loading && IconRight && <IconRight className="h-4 w-4" />}
    </button>
  );
};