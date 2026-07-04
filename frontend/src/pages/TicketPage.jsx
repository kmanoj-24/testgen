import { TicketFetcher } from '../components/Jira/TicketFetcher';

export const TicketPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tickets</h1>
        <p className="text-sm text-foreground-muted mt-1">Enter a Jira ticket key to fetch details and generate AI-powered test cases.</p>
      </div>
      <TicketFetcher />
    </div>
  );
};