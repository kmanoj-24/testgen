import { useState } from 'react';
import { Search, AlertTriangle, Wand2, ArrowLeft, RotateCcw } from 'lucide-react';
import { useJira } from '../../hooks/useJira';
import { useAI } from '../../hooks/useAI';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { Loading } from '../UI/Loading';
import { Card } from '../UI/Card';
import { TicketCard } from './TicketCard';
import { TestCaseResult } from '../AI/TestCaseResult';

export const TicketFetcher = ({ onFetch }) => {  // ← accept onFetch prop
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

    const key = ticketKey.trim().toUpperCase();
    if (!key) {
      setInputError('Please enter a ticket key');
      return;
    }
    if (!validateTicketKey(key)) {
      setInputError('Invalid format. Use: CDPIDC-1234');
      return;
    }

    const fetchedTicket = await fetchTicket(key);
    
    // Call parent's onFetch if provided
    if (onFetch && fetchedTicket) {
      onFetch(fetchedTicket);
    }
  };

  const handleGenerate = async () => {
    if (!ticket) return;
    setShowResults(true);
    // ← Pass full ticket object, not just the key string
    await generateTestCases(ticket);
  };

  const handleBack = () => {
    setShowResults(false);
    resetAI();
  };

  const handleReset = () => {
    setShowResults(false);
    setTicketKey('');
    setInputError('');
    resetAI();
  };

  const isLoading = ticketLoading || aiLoading;
  const error = ticketError || aiError;

  if (showResults && result) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Generated Test Cases</h2>
            <p className="text-sm text-foreground-muted">{result.ticketKey} — {result.ticketSummary}</p>
          </div>
        </div>
        <TestCaseResult result={result} onBack={handleBack} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card elevated className="p-6 sm:p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Search className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Fetch Jira Ticket</h2>
          </div>
          <p className="text-sm text-foreground-muted">
            Enter a Jira ticket key to extract acceptance criteria and generate AI-powered test cases
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Jira Ticket Key"
              placeholder="e.g., CDPIDC-1234"
              value={ticketKey}
              onChange={(e) => {
                setTicketKey(e.target.value);
                setInputError('');
              }}
              error={inputError}
              helper="Format: CDPIDC-1234"
              icon={Search}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            icon={Search}
            className="w-full sm:w-auto mb-0.5"
          >
            Fetch Ticket
          </Button>
        </form>
      </Card>

      {isLoading && (
        <Loading
          message={aiLoading ? "AI is generating comprehensive test cases... This may take a moment." : "Fetching ticket from Jira..."}
          size="lg"
        />
      )}

      {error && (
        <Card className="border-danger/20 bg-danger/5 p-5 animate-fade-in-scale">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-danger/10">
              <AlertTriangle className="h-5 w-5 text-danger" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-danger">Error</h3>
              <p className="text-sm text-danger/80 mt-1">{error}</p>
              <Button variant="ghost" size="sm" onClick={handleReset} className="mt-3" icon={RotateCcw}>
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {ticket && !showResults && (
        <div className="animate-fade-in-up">
          <TicketCard ticket={ticket} onGenerate={handleGenerate} />
        </div>
      )}
    </div>
  );
};