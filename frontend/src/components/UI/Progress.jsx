export const Progress = ({ value = 0, max = 100, size = 'md', showValue = false, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const sizes = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full overflow-hidden rounded-full bg-muted ${sizes[size]}`}>
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out-expo relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-shimmer" />
        </div>
      </div>
      {showValue && (
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-foreground-muted">{value} of {max}</span>
          <span className="text-xs font-medium text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};