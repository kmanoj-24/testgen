import { useState } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { useJira } from '../../hooks/useJira';
import { useAI } from '../../hooks/useAI';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { TicketCard } from './TicketCard';
import { TestCaseResult } from '../AI/TestCaseResult';

export const TicketFetcher = () => {
  const [ticketKey, setTicketKey] = useState('');
  const [inputError, setInputError] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const { ticket, loading: ticketLoading, error: ticketError, fetchTicket, validateTicketKey } = useJira();
  const { result, loading: aiLoading, error: aiError, generateTestCases, reset: resetAI } = useAI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInputError('');
    setShowResults(false);
    resetAI();

    if (!ticketKey.trim()) {
      setInputError('Please enter a ticket key');
      return;
    }

    if (!validateTicketKey(ticketKey.trim().toUpperCase())) {
      setInputError('Invalid format. Use: CDPIDC-1234');
      return;
    }

    await fetchTicket(ticketKey.trim().toUpperCase());
  };

  const handleGenerate = async (key) => {
    setShowResults(true);
    await generateTestCases(key);
  };

  const handleBack = () => {
    setShowResults(false);
    resetAI();
  };

  const handleReset = () => {
    setShowResults(false);
    setTicketKey('');
    resetAI();
  };

  const isLoading = ticketLoading || aiLoading;
  const error = ticketError || aiError;

  if (showResults && result) {
    return <TestCaseResult result={result} onBack={handleBack} onReset={handleReset} />;
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Fetch Jira Ticket</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter a Jira ticket key to extract acceptance criteria and generate test cases
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Jira Ticket Key"
              placeholder="e.g., CDPIDC-1234"
              value={ticketKey}
              onChange={(e) => setTicketKey(e.target.value)}
              error={inputError}
              helper="Format: CDPIDC-1234"
              icon={Search}
            />
          </div>
          <Button 
            type="submit" 
            loading={isLoading}
            disabled={isLoading}
            className="mb-5"
          >
            Fetch Ticket
          </Button>
        </form>
      </div>

      {isLoading && (
        <Loading 
          message={aiLoading ? "AI is generating test cases... This may take a moment." : "Fetching ticket from Jira..."} 
          size="lg" 
        />
      )}

      {error && (
        <div className="card p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {ticket && !showResults && (
        <TicketCard ticket={ticket} onGenerate={handleGenerate} />
      )}
    </div>
  );
};