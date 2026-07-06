export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    danger: 'bg-destructive/10 text-destructive border border-destructive/20',
    info: 'bg-info/10 text-info border border-info/20',
    neutral: 'bg-muted text-foreground-muted border border-border',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
};