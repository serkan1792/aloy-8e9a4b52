import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2 } from 'lucide-react';
import { ColumnDefinition } from '@/hooks/useColumnConfig';

interface ColumnConfigDropdownProps {
  columns: ColumnDefinition[];
  visibleColumns: string[];
  onToggleColumn: (columnId: string) => void;
  onReset: () => void;
}

export function ColumnConfigDropdown({
  columns,
  visibleColumns,
  onToggleColumn,
  onReset,
}: ColumnConfigDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
        <DropdownMenuLabel>Spalten anzeigen</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          const isVisible = visibleColumns.includes(column.id);
          const isOnlyOne = visibleColumns.length === 1 && isVisible;
          
          return (
            <DropdownMenuItem
              key={column.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                if (!isOnlyOne) {
                  onToggleColumn(column.id);
                }
              }}
              disabled={isOnlyOne}
            >
              <Checkbox 
                checked={isVisible} 
                className="pointer-events-none"
              />
              <span>{column.label}</span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onReset} className="cursor-pointer">
          Zurücksetzen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
