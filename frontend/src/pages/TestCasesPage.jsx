import { FileCheck } from 'lucide-react';
import { EmptyState } from '../components/UI/EmptyState';

export const TestCasesPage = () => (
  <div className="space-y-4 animate-fade-in">
    <div>
      <h1 className="text-xl font-semibold text-foreground">Test Cases</h1>
      <p className="text-sm text-foreground-muted mt-0.5">Review and manage generated test cases</p>
    </div>
    
    <EmptyState 
      icon={FileCheck} 
      title="No test cases yet" 
      description="Generate test cases from Jira tickets to see them here." 
      actionLabel="Generate Test Cases" 
      onAction={() => window.location.href = '/tickets'} 
    />
  </div>
);