import { Card, CardHeader, CardContent } from '../UI/Card';
import { EmptyState } from '../UI/EmptyState';
import { Clock, Wand2, CheckCircle2, FileText } from 'lucide-react';

const activities = []; // Populate from API

const activityIcons = {
  generate: Wand2,
  approve: CheckCircle2,
  fetch: FileText,
};

const activityColors = {
  generate: 'text-primary bg-primary/10',
  approve: 'text-success bg-success/10',
  fetch: 'text-info bg-info/10',
};

export const RecentActivity = () => {
  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
          <span className="text-xs text-foreground-subtle">Last 24 hours</span>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No recent activity"
            description="Your recent actions will appear here once you start generating test cases."
            className="py-8"
          />
        ) : (
          <div className="space-y-4">
            {activities.map((activity, i) => {
              const Icon = activityIcons[activity.type] || FileText;
              const colorClass = activityColors[activity.type] || activityColors.fetch;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.title}</p>
                    <p className="text-xs text-foreground-subtle mt-0.5">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};