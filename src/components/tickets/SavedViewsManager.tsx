import { useState } from 'react';
import { SavedView } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bookmark, ChevronDown, Plus, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedViewsManagerProps {
  savedViews: SavedView[];
  activeViewId: string | null;
  hasActiveFilters: boolean;
  onSaveView: (name: string) => void;
  onLoadView: (viewId: string) => void;
  onDeleteView: (viewId: string) => void;
}

export function SavedViewsManager({
  savedViews,
  activeViewId,
  hasActiveFilters,
  onSaveView,
  onLoadView,
  onDeleteView,
}: SavedViewsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewName, setViewName] = useState('');

  const activeView = savedViews.find(v => v.id === activeViewId);

  const handleSave = () => {
    if (viewName.trim()) {
      onSaveView(viewName.trim());
      setViewName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Bookmark className="mr-1.5 h-3.5 w-3.5" />
            {activeView ? activeView.name : 'Ansichten'}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Gespeicherte Ansichten</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {savedViews.length === 0 ? (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
              Keine Ansichten gespeichert
            </div>
          ) : (
            savedViews.map(view => (
              <DropdownMenuItem
                key={view.id}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => onLoadView(view.id)}
              >
                <span className={cn(
                  "flex-1",
                  activeViewId === view.id && "font-medium"
                )}>
                  {view.name}
                </span>
                <div className="flex items-center gap-1">
                  {activeViewId === view.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                  <button
                    className="p-1 hover:bg-destructive/10 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteView(view.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!hasActiveFilters}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Ansicht speichern
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ansicht speichern</DialogTitle>
            <DialogDescription>
              Speichere deine aktuellen Filter als benutzerdefinierte Ansicht.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Name der Ansicht..."
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={!viewName.trim()}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
