import { Activity, FileCheck, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../components/UI/Card';

const stats = [
  { label: 'Total Tickets', value: '0', trend: '+12%', up: true, icon: Activity },
  { label: 'Test Cases', value: '0', trend: '+8%', up: true, icon: FileCheck },
  { label: 'Pending Review', value: '0', trend: '0%', up: null, icon: Clock },
  { label: 'Issues Found', value: '0', trend: '-3%', up: false, icon: AlertCircle },
];

const quickActions = [
  { title: 'Fetch Tickets', desc: 'Import from Jira', href: '/tickets', icon: '🎫' },
  { title: 'Generate', desc: 'AI test cases', href: '/tickets', icon: '✨' },
  { title: 'Review', desc: 'Approve & edit', href: '/testcases', icon: '✓' },
  { title: 'Workflow', desc: 'Automation', href: '/workflow', icon: '⚡' },
];

export const Dashboard = () => (
  <div className="space-y-6 animate-fade-in">
    {/* Header */}
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Overview of your test generation activity</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-medium text-success">System Operational</span>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="p-1.5 rounded-md bg-secondary border border-border">
              <stat.icon className="h-4 w-4 text-foreground-muted" strokeWidth={1.5} />
            </div>
            {stat.trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.up === true ? 'text-success' : stat.up === false ? 'text-destructive' : 'text-foreground-muted'}`}>
                {stat.up === true ? <TrendingUp className="h-3 w-3" /> : stat.up === false ? <TrendingDown className="h-3 w-3" /> : null}
                {stat.trend}
              </div>
            )}
          </div>
          <p className="text-2xl font-semibold text-foreground tabular-nums">{stat.value}</p>
          <p className="text-xs text-foreground-muted mt-0.5 uppercase tracking-wide">{stat.label}</p>
        </Card>
      ))}
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Quick Actions */}
      <div className="lg:col-span-2 space-y-3">
        <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="card p-4 hover:shadow-md hover:border-border-strong transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{action.icon}</span>
                <div>
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.title}</h3>
                  <p className="text-xs text-foreground-muted mt-0.5">{action.desc}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
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
    </div>
  </div>
);