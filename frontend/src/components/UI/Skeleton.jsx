export const Skeleton = ({ className = '', width, height }) => (
  <div
    className={`relative overflow-hidden rounded-md bg-muted ${className}`}
    style={{ width, height }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground-muted/5 to-transparent animate-shimmer" />
  </div>
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-3.5"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);