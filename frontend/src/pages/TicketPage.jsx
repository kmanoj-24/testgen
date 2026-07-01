import { TicketFetcher } from '../components/Jira/TicketFetcher';

export const TicketPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fetch Jira Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter a Jira ticket key to view its details and acceptance criteria
        </p>
      </div>
      <TicketFetcher />
    </div>
  );
};