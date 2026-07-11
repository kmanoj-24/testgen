import { User, Calendar, Flag, Tag, ExternalLink, Sparkles } from 'lucide-react';
import { Badge } from '../UI/Badge';

export const TicketCard = ({ ticket, onGenerate }) => {
  if (!ticket) return null;

  const key = ticket.key;
  const title = ticket.summary;
  const status = ticket.status?.name;
  const priority = ticket.priority?.name;
  const assignee = ticket.assignee?.displayName || 'Unassigned';
  const updated = ticket.updated;
  const type = ticket.issueType;

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

      <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted mb-4">
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

      {/* Generate Test Cases Button */}
      {onGenerate && (
        <button
          onClick={onGenerate}
          className="w-full mt-2 p-2.5 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-primary text-sm font-medium"
        >
          <Sparkles className="h-4 w-4" />
          Generate Test Cases
        </button>
      )}
    </div>
  );
};