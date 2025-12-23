import { Ticket } from '@/types';
import { TicketCard } from './TicketCard';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DraggableTicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (ticketId: string, selected: boolean) => void;
}

export function DraggableTicketCard({ 
  ticket, 
  onClick, 
  isSelectable = false, 
  isSelected = false, 
  onSelect 
}: DraggableTicketCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: ticket.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <TicketCard 
        ticket={ticket} 
        onClick={onClick} 
        isSelectable={isSelectable}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    </div>
  );
}
