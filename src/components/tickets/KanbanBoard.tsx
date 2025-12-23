import { Ticket, TicketStatus } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import { TicketCard } from './TicketCard';

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onTicketMove?: (ticketId: string, newStatus: TicketStatus) => void;
  isSelectable?: boolean;
  selectedTicketIds?: string[];
  onTicketSelect?: (ticketId: string, selected: boolean) => void;
}

const statuses: TicketStatus[] = ['Neu', 'On You', 'On Customer', 'On Hold', 'Closed'];

export function KanbanBoard({ 
  tickets, 
  onTicketClick, 
  onTicketMove,
  isSelectable = false,
  selectedTicketIds = [],
  onTicketSelect
}: KanbanBoardProps) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const ticketsByStatus = statuses.reduce((acc, status) => {
    acc[status] = tickets.filter((t) => t.status === status);
    return acc;
  }, {} as Record<TicketStatus, Ticket[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find((t) => t.id === event.active.id);
    if (ticket) {
      setActiveTicket(ticket);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (over && active.id !== over.id) {
      const newStatus = over.id as TicketStatus;
      if (statuses.includes(newStatus)) {
        onTicketMove?.(active.id as string, newStatus);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tickets={ticketsByStatus[status]}
            onTicketClick={onTicketClick}
            isSelectable={isSelectable}
            selectedTicketIds={selectedTicketIds}
            onTicketSelect={onTicketSelect}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTicket ? (
          <div className="rotate-3 opacity-90">
            <TicketCard ticket={activeTicket} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
