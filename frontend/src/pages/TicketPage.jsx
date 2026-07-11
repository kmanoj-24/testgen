import { useState } from 'react';
import { TicketFetcher } from '../components/Jira/TicketFetcher';
import { TicketCard } from '../components/Jira/TicketCard';
import { useJira } from '../hooks/useJira';
import { useAI } from '../hooks/useAI';
import { Loading } from '../components/UI/Loading';
import { AlertCircle, Sparkles } from 'lucide-react';

export const TicketPage = () => {
  const { ticket, loading: jiraLoading, error: jiraError } = useJira();
  const { result: aiResult, loading: aiLoading, error: aiError, generateTestCases } = useAI();
  const [activeTab, setActiveTab] = useState('details');
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleFetch = (fetchedTicket) => {
    // Ticket fetched successfully - TicketFetcher shows the ticket card
    // No auto-generation
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

      {/* Rest of your TicketPage content if needed */}
    </div>
  );
};