import { Link } from 'react-router-dom';
import { Ticket, FileSpreadsheet, GitBranch, Wand2, ArrowRight } from 'lucide-react';
import { Card } from '../UI/Card';

const actions = [
  {
    title: 'Fetch Jira Tickets',
    description: 'Import tickets and extract acceptance criteria',
    icon: Ticket,
    href: '/tickets',
    color: 'bg-primary/10 text-primary',
    gradient: 'hover:border-primary/30',
  },
  {
    title: 'Generate Test Cases',
    description: 'Use AI to create comprehensive test cases',
    icon: Wand2,
    href: '/tickets',
    color: 'bg-success/10 text-success',
    gradient: 'hover:border-success/30',
  },
  {
    title: 'Review Test Cases',
    description: 'Approve, reject, or edit generated cases',
    icon: FileSpreadsheet,
    href: '/testcases',
    color: 'bg-warning/10 text-warning',
    gradient: 'hover:border-warning/30',
  },
  {
    title: 'Manage Workflow',
    description: 'Configure automation and integrations',
    icon: GitBranch,
    href: '/workflow',
    color: 'bg-info/10 text-info',
    gradient: 'hover:border-info/30',
  },
];

export const QuickActions = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {actions.map((action, i) => (
        <Link
          key={action.title}
          to={action.href}
          className={`group surface-hover p-5 rounded-xl border border-border transition-all duration-300 animate-fade-in-up ${action.gradient}`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl ${action.color} transition-transform duration-300 group-hover:scale-110`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-foreground-subtle opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </div>
        </Link>
      ))}
    </div>
  );
};