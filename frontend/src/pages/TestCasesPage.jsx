import { FileSpreadsheet, ArrowRight } from 'lucide-react';
import { EmptyState } from '../components/UI/EmptyState';

export const TestCasesPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Test Cases</h1>
        <p className="text-sm text-foreground-muted mt-1">Review and manage all generated test cases</p>
      </div>
      <EmptyState icon={FileSpreadsheet} title="No test cases yet" description="Generate test cases from Jira tickets to see them here." actionLabel="Generate Test Cases" actionIcon={ArrowRight} onAction={() => window.location.href = '/tickets'} />
    </div>
  );
};