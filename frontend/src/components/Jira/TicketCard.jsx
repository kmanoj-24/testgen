import {
  ExternalLink,
  User,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Wand2,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../UI/Card';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { Tooltip } from '../UI/Tooltip';

export const TicketCard = ({ ticket, onGenerate }) => {
  const getStatusVariant = (status) => {
    const map = {
      'To Do': 'muted',
      'In Progress': 'info',
      'Done': 'success',
      'In Review': 'warning',
    };
    return map[status] || 'muted';
  };

  const getPriorityColor = (priority) => {
    const map = {
      'Highest': 'text-danger',
      'High': 'text-warning',
      'Medium': 'text-info',
      'Low': 'text-success',
      'Lowest': 'text-foreground-muted',
    };
    return map[priority] || 'text-foreground-muted';
  };

  const hasAC = !!ticket.acceptanceCriteria;

  return (
    <Card elevated className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" className="font-mono text-xs">
                {ticket.key}
              </Badge>
              <Badge variant={getStatusVariant(ticket.status?.name)}>
                {ticket.status?.name}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-foreground leading-tight">
              {ticket.summary}
            </h3>
          </div>
          <Tooltip content="Open in Jira">
            <a
              href={ticket.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-foreground-subtle hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-4 text-sm">
          {ticket.assignee && (
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <User className="h-4 w-4" />
              <span>{ticket.assignee.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-foreground-muted">
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
            <div className="flex items-center gap-1.5 text-foreground-muted">
              <Tag className="h-4 w-4" />
              <span>{ticket.issueType}</span>
            </div>
          )}
        </div>

        {ticket.description && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Description</h4>
            <div className="text-sm text-foreground-muted whitespace-pre-wrap bg-secondary/50 rounded-xl p-4 max-h-48 overflow-y-auto scrollbar-thin leading-relaxed">
              {ticket.description}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${hasAC ? 'text-success' : 'text-warning'}`} />
            <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Acceptance Criteria</h4>
            {hasAC ? (
              <Badge variant="success" className="text-[10px]">Found</Badge>
            ) : (
              <Badge variant="warning" className="text-[10px]">Not Found</Badge>
            )}
          </div>

          {hasAC ? (
            <div className="bg-success/5 border border-success/20 rounded-xl p-4">
              <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {ticket.acceptanceCriteria}
              </div>
            </div>
          ) : (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-warning mt-0.5" />
                <p className="text-sm text-foreground-muted">
                  No acceptance criteria found in this ticket. The description will be used for test case generation.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <div className={`h-1.5 w-1.5 rounded-full ${hasAC ? 'bg-success' : 'bg-warning'}`} />
          {hasAC ? 'Ready for AI generation' : 'Will use description as fallback'}
        </div>
        <Button
          variant="primary"
          onClick={() => onGenerate?.(ticket.key)}
          disabled={!hasAC}
          icon={Wand2}
        >
          Generate Test Cases
        </Button>
      </CardFooter>
    </Card>
  );
};