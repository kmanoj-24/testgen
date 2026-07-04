import { GitBranch } from 'lucide-react';
import { EmptyState } from '../components/UI/EmptyState';

export const WorkflowPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Workflow</h1>
        <p className="text-sm text-foreground-muted mt-1">Configure automation rules and integrations</p>
      </div>
      <EmptyState icon={GitBranch} title="Workflow Automation" description="Configure your CI/CD pipeline integrations and auto-approval rules." />
    </div>
  );
};