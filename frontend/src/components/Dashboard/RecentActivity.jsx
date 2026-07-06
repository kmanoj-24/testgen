import { Clock } from 'lucide-react';
import { Card } from '../UI/Card';

export const RecentActivity = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Recent Activity</h2>
      <span className="text-xs text-foreground-subtle">Last 24h</span>
    </div>
    <Card className="p-4">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-2 rounded-lg bg-secondary border border-border mb-3">
          <Clock className="h-5 w-5 text-foreground-muted" />
        </div>
        <p className="text-sm text-foreground-muted">No recent activity</p>
        <p className="text-xs text-foreground-subtle mt-0.5">Start by fetching a Jira ticket</p>
      </div>
    </Card>
  </div>
);