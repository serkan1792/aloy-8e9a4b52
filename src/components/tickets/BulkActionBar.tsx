import { Ticket, TicketStatus, Priority } from '@/types';
import { agents } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Trash2, UserPlus, Flag, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAssign: (assigneeId: string) => void;
  onBulkStatusChange: (status: TicketStatus) => void;
  onBulkPriorityChange: (priority: Priority) => void;
  onBulkDelete: () => void;
}

const statuses: TicketStatus[] = ['Neu', 'On You', 'On Customer', 'On Hold', 'Closed'];
const priorities: Priority[] = ['High', 'Medium', 'Low'];

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkAssign,
  onBulkStatusChange,
  onBulkPriorityChange,
  onBulkDelete,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 bg-card border border-border rounded-xl shadow-lg px-4 py-3">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} ausgewählt
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Assign action */}
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <Select onValueChange={onBulkAssign}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Zuweisen" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status change */}
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          <Select onValueChange={(value) => onBulkStatusChange(value as TicketStatus)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Status ändern" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority change */}
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-muted-foreground" />
          <Select onValueChange={(value) => onBulkPriorityChange(value as Priority)}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Priorität" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Delete action */}
        <Button
          variant="destructive"
          size="sm"
          className="h-8"
          onClick={onBulkDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Löschen
        </Button>
      </div>
    </div>
  );
}
