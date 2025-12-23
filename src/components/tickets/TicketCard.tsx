import { Ticket, Priority, Source } from '@/types';
import { getContactById, getCompanyByContactId, getAgentById } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { AgentAvatar } from './AgentAvatar';
import { cn } from '@/lib/utils';
import { Mail, MessageSquare, Clock, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (ticketId: string, selected: boolean) => void;
}

const SlackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const priorityStyles: Record<Priority, string> = {
  High: 'bg-destructive/10 text-destructive border-destructive/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Low: 'bg-success/10 text-success border-success/20',
};

const sourceIcons: Record<Source, React.ReactNode> = {
  Slack: <SlackIcon className="w-3.5 h-3.5" />,
  Email: <Mail className="w-3.5 h-3.5" />,
  Chat: <MessageSquare className="w-3.5 h-3.5" />,
};

export function TicketCard({ ticket, onClick, isSelectable = false, isSelected = false, onSelect }: TicketCardProps) {
  const contact = getContactById(ticket.contactId);
  const company = getCompanyByContactId(ticket.contactId);
  const assignee = ticket.assigneeId ? getAgentById(ticket.assigneeId) : undefined;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(ticket.id, checked);
  };

  return (
    <div
      className={cn(
        "ticket-card group relative",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      {/* Checkbox for selection mode */}
      {isSelectable && (
        <div 
          className="absolute top-3 left-3 z-10"
          onClick={handleCheckboxClick}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-4 w-4 bg-background"
          />
        </div>
      )}

      {/* Header */}
      <div className={cn("flex items-start justify-between gap-2 mb-3", isSelectable && "pl-6")}>
        <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {ticket.title}
        </h3>
        <Badge 
          variant="outline" 
          className={cn('shrink-0 text-xs', priorityStyles[ticket.priority])}
        >
          {ticket.priority}
        </Badge>
      </div>

      {/* Company & Contact */}
      <div className={cn("mb-3", isSelectable && "pl-6")}>
        <p className="text-sm text-foreground font-medium">{company?.name}</p>
        <p className="text-xs text-muted-foreground">{contact?.name}</p>
      </div>

      {/* Footer */}
      <div className={cn("flex items-center justify-between text-muted-foreground", isSelectable && "pl-6")}>
        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDistanceToNow(ticket.updatedAt, { addSuffix: true, locale: de })}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            {sourceIcons[ticket.source]}
          </div>
          <AgentAvatar agent={assignee} size="sm" />
        </div>
      </div>
    </div>
  );
}
