import { User, Calendar, Flag, Tag, ExternalLink } from 'lucide-react';
import { Badge } from '../UI/Badge';

export const TicketCard = ({ ticket }) => {
  if (!ticket) return null;

  // Map API fields to component variables
  const key = ticket.key;
  const title = ticket.summary;           // API uses 'summary', not 'title'
  const status = ticket.status?.name;      // object → string
  const priority = ticket.priority?.name;  // object → string
  const assignee = ticket.assignee?.displayName || 'Unassigned';
  const updated = ticket.updated;          // may be undefined
  const type = ticket.issueType;           // API uses 'issueType', not 'type'

  return (
    <div className="card-hover p-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge variant="primary" className="font-mono text-xs">{key}</Badge>
        <Badge variant="success">{status}</Badge>
        <button className="ml-auto p-1.5 rounded-md hover:bg-secondary text-foreground-subtle hover:text-foreground transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      <h3 className="text-sm font-medium text-foreground leading-relaxed mb-4">
        {title}
      </h3>

      <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          {assignee}
        </span>
        {updated && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {updated}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Flag className="h-3.5 w-3.5 text-warning" />
          <span className="text-warning">{priority}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" />
          {type}
        </span>
      </div>
    </div>
  );
};