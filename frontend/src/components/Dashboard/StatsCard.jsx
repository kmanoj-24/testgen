import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../UI/Card';
import { Tooltip } from '../UI/Tooltip';

export const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary', delay = 0 }) => {
  const colors = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    success: 'from-success/20 to-success/5 text-success',
    warning: 'from-warning/20 to-warning/5 text-warning',
    danger: 'from-danger/20 to-danger/5 text-danger',
    info: 'from-info/20 to-info/5 text-info',
  };

  const iconBg = colors[color] || colors.primary;

  return (
    <Card hover className="p-5 animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground-muted">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
            {trend && (
              <Tooltip content={`${trendValue} from last period`}>
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {trendValue}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};