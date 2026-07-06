export const Progress = ({ value = 0, max = 100, size = 'sm', className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizes = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  };

  return (
    <div className={`w-full overflow-hidden rounded-full bg-muted ${sizes[size]} ${className}`}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};