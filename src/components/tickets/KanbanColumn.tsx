import { Ticket, TicketStatus } from '@/types';
import { DraggableTicketCard } from './DraggableTicketCard';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  status: TicketStatus;
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  isSelectable?: boolean;
  selectedTicketIds?: string[];
  onTicketSelect?: (ticketId: string, selected: boolean) => void;
}

const statusColors: Record<TicketStatus, string> = {
  'Neu': 'bg-status-new',
  'On You': 'bg-status-on-you',
  'On Customer': 'bg-status-on-customer',
  'On Hold': 'bg-status-on-hold',
  'Closed': 'bg-status-closed',
};

const statusLabels: Record<TicketStatus, string> = {
  'Neu': 'Neu',
  'On You': 'On You',
  'On Customer': 'On Customer',
  'On Hold': 'On Hold',
  'Closed': 'Closed',
};

export function KanbanColumn({ 
  status, 
  tickets, 
  onTicketClick, 
  isSelectable = false,
  selectedTicketIds = [],
  onTicketSelect
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className={cn('w-2 h-2 rounded-full', statusColors[status])} />
        <h2 className="text-sm font-semibold text-foreground">{statusLabels[status]}</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={cn(
          'kanban-column space-y-3 min-h-[200px] rounded-lg p-2 transition-colors duration-200',
          isOver && 'bg-primary/5 ring-2 ring-primary/20'
        )}
      >
        {tickets.map((ticket) => (
          <DraggableTicketCard
            key={ticket.id}
            ticket={ticket}
            onClick={() => onTicketClick(ticket)}
            isSelectable={isSelectable}
            isSelected={selectedTicketIds.includes(ticket.id)}
            onSelect={onTicketSelect}
          />
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Keine Tickets
          </div>
        )}
      </div>
    </div>
  );
}
