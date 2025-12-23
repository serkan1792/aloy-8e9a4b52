import { useState } from 'react';
import { Priority, Source, TicketStatus, TicketFilters as TFilters } from '@/types';
import { companies, agents } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, X, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfDay, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TicketFiltersProps {
  filters: TFilters;
  onUpdateFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const statuses: TicketStatus[] = ['Neu', 'On You', 'On Customer', 'On Hold', 'Closed'];
const priorities: Priority[] = ['High', 'Medium', 'Low'];
const sources: Source[] = ['Slack', 'Email', 'Chat'];

const statusLabels: Record<TicketStatus, string> = {
  'Neu': 'Neu',
  'On You': 'On You',
  'On Customer': 'On Customer',
  'On Hold': 'On Hold',
  'Closed': 'Geschlossen',
};

const priorityLabels: Record<Priority, string> = {
  High: 'Hoch',
  Medium: 'Mittel',
  Low: 'Niedrig',
};

type DatePreset = {
  label: string;
  getValue: () => { from: Date; to: Date };
};

const datePresets: DatePreset[] = [
  {
    label: 'Heute',
    getValue: () => {
      const today = startOfDay(new Date());
      return { from: today, to: new Date() };
    },
  },
  {
    label: 'Gestern',
    getValue: () => {
      const yesterday = startOfDay(subDays(new Date(), 1));
      const yesterdayEnd = startOfDay(new Date());
      return { from: yesterday, to: yesterdayEnd };
    },
  },
  {
    label: 'Letzte 7 Tage',
    getValue: () => {
      const from = startOfDay(subDays(new Date(), 7));
      return { from, to: new Date() };
    },
  },
  {
    label: 'Letzte 30 Tage',
    getValue: () => {
      const from = startOfDay(subDays(new Date(), 30));
      return { from, to: new Date() };
    },
  },
  {
    label: 'Letzte 90 Tage',
    getValue: () => {
      const from = startOfDay(subDays(new Date(), 90));
      return { from, to: new Date() };
    },
  },
];

export function TicketFilters({
  filters,
  onUpdateFilter,
  onResetFilters,
  hasActiveFilters,
}: TicketFiltersProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const toggleStatus = (status: TicketStatus) => {
    const current = filters.statuses;
    if (current.includes(status)) {
      onUpdateFilter('statuses', current.filter(s => s !== status));
    } else {
      onUpdateFilter('statuses', [...current, status]);
    }
  };

  const togglePriority = (priority: Priority) => {
    const current = filters.priorities;
    if (current.includes(priority)) {
      onUpdateFilter('priorities', current.filter(p => p !== priority));
    } else {
      onUpdateFilter('priorities', [...current, priority]);
    }
  };

  const toggleSource = (source: Source) => {
    const current = filters.sources;
    if (current.includes(source)) {
      onUpdateFilter('sources', current.filter(s => s !== source));
    } else {
      onUpdateFilter('sources', [...current, source]);
    }
  };

  const toggleAssignee = (agentId: string) => {
    const current = filters.assigneeIds;
    if (current.includes(agentId)) {
      onUpdateFilter('assigneeIds', current.filter(id => id !== agentId));
    } else {
      onUpdateFilter('assigneeIds', [...current, agentId]);
    }
  };

  const toggleCompany = (companyId: string) => {
    const current = filters.companyIds;
    if (current.includes(companyId)) {
      onUpdateFilter('companyIds', current.filter(id => id !== companyId));
    } else {
      onUpdateFilter('companyIds', [...current, companyId]);
    }
  };

  const applyDatePreset = (preset: DatePreset) => {
    const { from, to } = preset.getValue();
    onUpdateFilter('dateRange', { from, to });
    setDatePopoverOpen(false);
  };

  const getDateButtonLabel = () => {
    if (!filters.dateRange.from && !filters.dateRange.to) {
      return 'Erstellt am';
    }
    
    // Check if it matches a preset
    for (const preset of datePresets) {
      const { from, to } = preset.getValue();
      if (
        filters.dateRange.from &&
        filters.dateRange.to &&
        format(filters.dateRange.from, 'yyyy-MM-dd') === format(from, 'yyyy-MM-dd') &&
        format(filters.dateRange.to, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd')
      ) {
        return preset.label;
      }
    }

    // Custom range
    return `${filters.dateRange.from ? format(filters.dateRange.from, 'dd.MM.yy', { locale: de }) : '...'} - ${filters.dateRange.to ? format(filters.dateRange.to, 'dd.MM.yy', { locale: de }) : '...'}`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filter:</span>
      </div>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Status
            {filters.statuses.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                {filters.statuses.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Status wählen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statuses.map(status => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={filters.statuses.includes(status)}
              onCheckedChange={() => toggleStatus(status)}
            >
              {statusLabels[status]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Priorität
            {filters.priorities.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                {filters.priorities.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Priorität wählen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {priorities.map(priority => (
            <DropdownMenuCheckboxItem
              key={priority}
              checked={filters.priorities.includes(priority)}
              onCheckedChange={() => togglePriority(priority)}
            >
              {priorityLabels[priority]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Source Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Quelle
            {filters.sources.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                {filters.sources.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Quelle wählen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sources.map(source => (
            <DropdownMenuCheckboxItem
              key={source}
              checked={filters.sources.includes(source)}
              onCheckedChange={() => toggleSource(source)}
            >
              {source}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assignee Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Mitarbeiter
            {filters.assigneeIds.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                {filters.assigneeIds.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Mitarbeiter wählen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {agents.map(agent => (
            <DropdownMenuCheckboxItem
              key={agent.id}
              checked={filters.assigneeIds.includes(agent.id)}
              onCheckedChange={() => toggleAssignee(agent.id)}
            >
              {agent.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Company Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Unternehmen
            {filters.companyIds.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                {filters.companyIds.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Unternehmen wählen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {companies.map(company => (
            <DropdownMenuCheckboxItem
              key={company.id}
              checked={filters.companyIds.includes(company.id)}
              onCheckedChange={() => toggleCompany(company.id)}
            >
              {company.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Range Filter */}
      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
            {getDateButtonLabel()}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets */}
            <div className="border-r p-2 space-y-1">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">Schnellauswahl</p>
              {datePresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm h-8"
                  onClick={() => applyDatePreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            {/* Calendar */}
            <div>
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.from || undefined,
                  to: filters.dateRange.to || undefined,
                }}
                onSelect={(range) => {
                  onUpdateFilter('dateRange', {
                    from: range?.from || null,
                    to: range?.to || null,
                  });
                }}
                locale={de}
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
          </div>
          {(filters.dateRange.from || filters.dateRange.to) && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onUpdateFilter('dateRange', { from: null, to: null });
                  setDatePopoverOpen(false);
                }}
              >
                Datum zurücksetzen
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground hover:text-foreground"
          onClick={onResetFilters}
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Zurücksetzen
        </Button>
      )}
    </div>
  );
}
