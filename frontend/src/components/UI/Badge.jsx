export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    muted: 'badge-muted',
  };
  return (
    <span className={`${variants[variant] || variants.primary} ${className}`}>
      {children}
    </span>
  );
};