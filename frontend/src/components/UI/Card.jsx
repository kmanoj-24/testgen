export const Card = ({ children, className = '', hover = false, onClick }) => (
  <div
    className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm ${hover ? 'hover:shadow-md hover:border-border-strong transition-all duration-200' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between px-4 py-3 border-b border-border ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 ${className}`}>
    {children}
  </div>
);