import { 
  ExternalLink, 
  User, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '../common/Button';

export const TicketCard = ({ ticket, onGenerate }) => {
  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-gray-100 text-gray-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Done': 'bg-green-100 text-green-700',
      'In Review': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Highest': 'text-red-600',
      'High': 'text-orange-600',
      'Medium': 'text-yellow-600',
      'Low': 'text-green-600',
      'Lowest': 'text-gray-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                {ticket.key}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(ticket.status?.name)}`}>
                {ticket.status?.name}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{ticket.summary}</h3>
          </div>
          <a
            href={ticket.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Meta Info */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-wrap gap-4 text-sm">
          {ticket.assignee && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <User className="h-4 w-4" />
              <span>{ticket.assignee.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Updated {new Date(ticket.updated).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            <span className={`font-medium ${getPriorityColor(ticket.priority?.name)}`}>
              {ticket.priority?.name} Priority
            </span>
          </div>
          {ticket.issueType && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Tag className="h-4 w-4" />
              <span>{ticket.issueType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {ticket.description && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
          <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
            {ticket.description}
          </div>
        </div>
      )}

      {/* Acceptance Criteria - THE KEY PART */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h4 className="text-sm font-semibold text-gray-900">Acceptance Criteria</h4>
          {ticket.acceptanceCriteria ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Found
            </span>
          ) : (
            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
              Not Found
            </span>
          )}
        </div>

        {ticket.acceptanceCriteria ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {ticket.acceptanceCriteria}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              No acceptance criteria found in this ticket. 
              The description will be used for test case generation.
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 flex justify-end">
          <Button 
            variant="primary" 
            onClick={() => onGenerate?.(ticket.key)}
            disabled={!ticket.acceptanceCriteria}
            className={!ticket.acceptanceCriteria ? 'opacity-50' : ''}
          >
            🤖 Generate Test Cases
          </Button>
        </div>
      </div>
    </div>
  );
};