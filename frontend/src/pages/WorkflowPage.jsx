import { GitBranch } from 'lucide-react';
import { EmptyState } from '../components/UI/EmptyState';

export const WorkflowPage = () => (
  <div className="space-y-4 animate-fade-in">
    <div>
      <h1 className="text-xl font-semibold text-foreground">Workflow</h1>
      <p className="text-sm text-foreground-muted mt-0.5">Configure automation and integrations</p>
    </div>
    
    <EmptyState 
      icon={GitBranch} 
      title="No workflows configured" 
      description="Set up automated test generation workflows." 
    />
  </div>
);