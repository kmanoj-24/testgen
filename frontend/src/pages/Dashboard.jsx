import { Ticket, FileCheck, Clock, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { RecentActivity } from '../components/Dashboard/RecentActivity';
import { Card, CardHeader, CardContent } from '../components/UI/Card';

export const Dashboard = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-foreground-muted mt-1">Welcome back. Here's what's happening with your test generation.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-medium">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            System Operational
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Tickets" value="0" icon={Ticket} color="primary" trend="up" trendValue="12%" delay={0} />
        <StatsCard title="Test Cases Generated" value="0" icon={FileCheck} color="success" trend="up" trendValue="8%" delay={100} />
        <StatsCard title="Pending Review" value="0" icon={Clock} color="warning" delay={200} />
        <StatsCard title="Issues Found" value="0" icon={AlertCircle} color="danger" trend="down" trendValue="3%" delay={300} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <QuickActions />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Activity</h2>
          <RecentActivity />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">AI Generation Stats</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Success Rate</span>
                <span className="text-sm font-semibold text-foreground">98.5%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent w-[98.5%]" />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center"><div className="text-lg font-bold text-foreground">0</div><div className="text-xs text-foreground-muted">This Week</div></div>
                <div className="text-center"><div className="text-lg font-bold text-foreground">0</div><div className="text-xs text-foreground-muted">This Month</div></div>
                <div className="text-center"><div className="text-lg font-bold text-foreground">0</div><div className="text-xs text-foreground-muted">All Time</div></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="text-base font-semibold text-foreground">Coverage Overview</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Positive Cases', value: 0, total: 0, color: 'bg-success' },
                { label: 'Negative Cases', value: 0, total: 0, color: 'bg-danger' },
                { label: 'Boundary Cases', value: 0, total: 0, color: 'bg-warning' },
                { label: 'Edge Cases', value: 0, total: 0, color: 'bg-primary' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: item.total ? `${(item.value / item.total) * 100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};