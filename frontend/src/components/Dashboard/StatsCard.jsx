import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatsCard = ({ label, value, trend, trendUp, icon: Icon }) => {
  const TrendIcon = trendUp === true ? TrendingUp : trendUp === false ? TrendingDown : Minus;
  const trendColor = trendUp === true ? 'text-success' : trendUp === false ? 'text-destructive' : 'text-foreground-muted';

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-4 hover:shadow-md hover:border-border-strong transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="p-1.5 rounded-md bg-secondary border border-border">
          <Icon className="h-4 w-4 text-foreground-muted" strokeWidth={1.5} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-foreground-muted mt-0.5 uppercase tracking-wide">{label}</p>
    </div>
  );
};