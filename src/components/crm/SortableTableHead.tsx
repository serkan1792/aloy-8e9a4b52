import { TableHead } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortDirection } from '@/hooks/useTableSort';
import { cn } from '@/lib/utils';

interface SortableTableHeadProps {
  column: string;
  label: string;
  sortDirection: SortDirection;
  sortIndex?: number;
  isMultiSort?: boolean;
  onSort: (column: string, isMultiSort: boolean) => void;
  className?: string;
}

export function SortableTableHead({
  column,
  label,
  sortDirection,
  sortIndex = -1,
  isMultiSort = false,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = sortDirection !== null;

  const handleClick = (e: React.MouseEvent) => {
    onSort(column, e.shiftKey);
  };

  return (
    <TableHead
      className={cn(
        'cursor-pointer select-none hover:bg-muted/50 transition-colors',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <div className="flex items-center">
          {isActive && sortDirection === 'asc' && (
            <ArrowUp className="h-4 w-4 text-primary" />
          )}
          {isActive && sortDirection === 'desc' && (
            <ArrowDown className="h-4 w-4 text-primary" />
          )}
          {!isActive && (
            <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />
          )}
          {isMultiSort && sortIndex > 0 && (
            <span className="ml-0.5 text-xs font-medium text-primary bg-primary/10 rounded-full w-4 h-4 flex items-center justify-center">
              {sortIndex}
            </span>
          )}
        </div>
      </div>
    </TableHead>
  );
}
