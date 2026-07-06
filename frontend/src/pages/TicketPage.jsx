import { useState } from 'react';
import { TicketFetcher } from '../components/Jira/TicketFetcher';
import { TicketCard } from '../components/Jira/TicketCard';
import { useJira } from '../hooks/useJira';
import { useAI } from '../hooks/useAI';
import { Loading } from '../components/UI/Loading';
import { AlertCircle, Sparkles } from 'lucide-react';

export const TicketPage = () => {
  const { ticket, loading: jiraLoading, error: jiraError, fetchTicket } = useJira();
  const { result: aiResult, loading: aiLoading, error: aiError, generateTestCases } = useAI();
  const [activeTab, setActiveTab] = useState('details');
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleFetch = async (key) => {
    setHasGenerated(false);
    await fetchTicket(key);
    // Don't auto-generate — let user click the button
  };

  const handleGenerate = async () => {
    if (!ticket) return;
    setHasGenerated(true);
    await generateTestCases(ticket);
  };

  const isLoading = jiraLoading || aiLoading;
  const error = jiraError || aiError;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Tickets</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Fetch Jira tickets and generate AI test cases</p>
      </div>
      
      <TicketFetcher onFetch={handleFetch} />

      {jiraLoading && <Loading message="Fetching ticket..." />}

      {jiraError && (
        <div className="card p-4 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">{jiraError}</p>
          </div>
        </div>
      )}

      {ticket && (
        <div className="space-y-4">
          <TicketCard ticket={ticket} />
          
          {/* Generate Test Cases Button */}
          {!hasGenerated && !aiResult && (
            <button
              onClick={handleGenerate}
              disabled={aiLoading}
              className="w-full card p-4 border-dashed border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-primary font-medium disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {aiLoading ? 'Generating...' : 'Generate Test Cases'}
            </button>
          )}

          {aiLoading && hasGenerated && (
            <Loading message="Generating test cases with AI..." />
          )}

          {aiError && (
            <div className="card p-4 border-destructive/50 bg-destructive/5">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{aiError}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {['details', 'test-cases', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium capitalize transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-foreground-muted hover:text-foreground'}`}
              >
                {tab.replace('-', ' ')}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="card p-4 space-y-3">
              <DetailRow label="Status" value={ticket.status?.name} />
              <DetailRow label="Priority" value={ticket.priority?.name} />
              <DetailRow label="Assignee" value={ticket.assignee?.displayName || 'Unassigned'} />
              <DetailRow label="Issue Type" value={ticket.issueType} />
              <DetailRow label="Labels" value={ticket.labels?.join(', ') || 'None'} />
              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {typeof ticket.description === 'string' 
                    ? ticket.description 
                    : JSON.stringify(ticket.description, null, 2)}
                </p>
              </div>
              {ticket.acceptanceCriteria && (
                <div>
                  <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-1">Acceptance Criteria</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.acceptanceCriteria}</p>
                </div>
              )}
            </div>
          )}

          {/* Test Cases Tab */}
          {activeTab === 'test-cases' && (
            <div className="card">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Generated Test Cases</h3>
              </div>
              <div className="p-4">
                {aiResult ? (
                  <pre className="text-xs font-mono text-foreground-muted overflow-x-auto">
                    {JSON.stringify(aiResult, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-foreground-muted text-center py-8">
                    Click "Generate Test Cases" to create AI-powered test cases
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card p-4">
              <p className="text-sm text-foreground-muted">No history available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper component
const DetailRow = ({ label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-xs font-medium text-foreground-muted uppercase tracking-wide w-32 shrink-0">{label}</span>
    <span className="text-sm text-foreground">{value || '—'}</span>
  </div>
);