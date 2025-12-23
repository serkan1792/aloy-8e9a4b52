import { useState } from 'react';
import { ChevronDown, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ 
  id, 
  title, 
  icon, 
  children, 
  defaultOpen = true 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "border border-border rounded-lg bg-card overflow-hidden",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="p-2 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between py-2 pr-3 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <span className="text-sm font-medium text-foreground">{title}</span>
          </div>
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )} 
          />
        </button>
      </div>
      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}
