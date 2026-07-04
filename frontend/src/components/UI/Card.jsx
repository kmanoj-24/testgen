export const Card = ({ children, className = '', hover = false, elevated = false, glass = false }) => {
  const base = glass ? 'surface-glass' : elevated ? 'surface-elevated' : hover ? 'surface-hover' : 'surface';
  return (
    <div className={`${base} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-border ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-5 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-border bg-secondary/50 rounded-b-xl ${className}`}>
    {children}
  </div>
);