import { useState } from 'react';
import { Ticket, InfoPanelSection, defaultSectionOrder, Tag as TagType, QuestionType } from '@/types';
import { 
  getContactById, 
  getCompanyByContactId, 
  getAccountById, 
  getAgentById,
  getTeamById,
  getTagById,
  getQuestionTypeById,
  getCompaniesByAccountId,
  getContactsByAccountId,
  getRecentTicketsByAccountId,
  agents,
  teams,
  tags as initialTags,
  questionTypes as initialQuestionTypes,
} from '@/data/mockData';
import { CollapsibleSection } from './CollapsibleSection';
import { AgentAvatar } from './AgentAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  FileText, 
  Building2, 
  User, 
  Clock,
  Users,
  Tag,
  HelpCircle,
  AlertCircle,
  Calendar,
  Timer,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Plus,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface TicketInfoPanelProps {
  ticket: Ticket;
  allTickets: Ticket[];
  onAssigneeChange?: (assigneeId: string | undefined) => void;
  onTeamChange?: (teamId: string | undefined) => void;
  onTagsChange?: (tagIds: string[]) => void;
  onQuestionTypeChange?: (questionTypeId: string | undefined) => void;
}

const priorityColors = {
  High: 'bg-destructive/10 text-destructive border-destructive/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  Low: 'bg-success/10 text-success border-success/20',
};

const statusColors = {
  'Neu': 'bg-status-new',
  'On You': 'bg-status-on-you',
  'On Customer': 'bg-status-on-customer',
  'On Hold': 'bg-status-on-hold',
  'Closed': 'bg-status-closed',
};

const TAG_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function TicketInfoPanel({ 
  ticket, 
  allTickets,
  onAssigneeChange,
  onTeamChange,
  onTagsChange,
  onQuestionTypeChange,
}: TicketInfoPanelProps) {
  const [sectionOrder, setSectionOrder] = useState<InfoPanelSection[]>(defaultSectionOrder);
  const [tags, setTags] = useState<TagType[]>(initialTags);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(initialQuestionTypes);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [newQuestionTypeName, setNewQuestionTypeName] = useState('');
  const [newQuestionTypeColor, setNewQuestionTypeColor] = useState(TAG_COLORS[0]);
  const [isQuestionTypePopoverOpen, setIsQuestionTypePopoverOpen] = useState(false);
  
  const contact = getContactById(ticket.contactId);
  const company = getCompanyByContactId(ticket.contactId);
  const account = getAccountById(ticket.accountId);
  const assignee = ticket.assigneeId ? getAgentById(ticket.assigneeId) : undefined;
  const team = ticket.teamId ? getTeamById(ticket.teamId) : undefined;
  const ticketTags = ticket.tagIds.map(id => getTagById(id)).filter(Boolean);
  const questionType = ticket.questionTypeId ? getQuestionTypeById(ticket.questionTypeId) : undefined;

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    const newTag: TagType = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
    };
    setTags(prev => [...prev, newTag]);
    setNewTagName('');
    setNewTagColor(TAG_COLORS[0]);
    setIsTagPopoverOpen(false);
    toast({ title: 'Tag erstellt', description: `Tag "${newTag.name}" wurde hinzugefügt.` });
  };

  const handleCreateQuestionType = () => {
    if (!newQuestionTypeName.trim()) return;
    const newQt: QuestionType = {
      id: `qt-${Date.now()}`,
      name: newQuestionTypeName.trim(),
      color: newQuestionTypeColor,
    };
    setQuestionTypes(prev => [...prev, newQt]);
    setNewQuestionTypeName('');
    setNewQuestionTypeColor(TAG_COLORS[0]);
    setIsQuestionTypePopoverOpen(false);
    toast({ title: 'Question Type erstellt', description: `"${newQt.name}" wurde hinzugefügt.` });
  };
  
  const accountCompanies = getCompaniesByAccountId(ticket.accountId);
  const accountContacts = getContactsByAccountId(ticket.accountId);
  const recentTickets = getRecentTicketsByAccountId(ticket.accountId, ticket.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as InfoPanelSection);
        const newIndex = items.indexOf(over.id as InfoPanelSection);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const renderSection = (sectionId: InfoPanelSection) => {
    switch (sectionId) {
      case 'details':
        return (
          <CollapsibleSection 
            key="details" 
            id="details" 
            title="Details" 
            icon={<FileText className="h-4 w-4" />}
          >
            <div className="space-y-3">
              {/* Assignee */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Assignee
                </span>
                <Select
                  value={ticket.assigneeId || 'unassigned'}
                  onValueChange={(v) => onAssigneeChange?.(v === 'unassigned' ? undefined : v)}
                >
                  <SelectTrigger className="h-7 w-[140px] text-xs">
                    <SelectValue>
                      <div className="flex items-center gap-1.5">
                        <AgentAvatar agent={assignee} size="xs" />
                        <span className="truncate">{assignee?.name || 'Nicht zugewiesen'}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Nicht zugewiesen</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-1.5">
                          <AgentAvatar agent={agent} size="xs" />
                          <span>{agent.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Team
                </span>
                <Select
                  value={ticket.teamId || 'none'}
                  onValueChange={(v) => onTeamChange?.(v === 'none' ? undefined : v)}
                >
                  <SelectTrigger className="h-7 w-[140px] text-xs">
                    <SelectValue>
                      <span className="truncate">{team?.name || 'Kein Team'}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Team</SelectItem>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Account */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Account
                </span>
                <span className="text-xs font-medium">{account?.name}</span>
              </div>

              {/* Requester */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Requester
                </span>
                <div className="text-right">
                  <p className="text-xs font-medium">{contact?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{contact?.email}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Tags
                  </span>
                  <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Neuen Tag erstellen</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsTagPopoverOpen(false)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Tag Name..."
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          className="h-8 text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {TAG_COLORS.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                                newTagColor === color ? "border-foreground" : "border-transparent"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewTagColor(color)}
                            />
                          ))}
                        </div>
                        <Button size="sm" className="w-full h-7 text-xs" onClick={handleCreateTag} disabled={!newTagName.trim()}>
                          Tag erstellen
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ticketTags.length > 0 ? (
                    ticketTags.map(tag => tag && (
                      <Badge 
                        key={tag.id} 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0"
                        style={{ borderColor: tag.color, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Keine Tags</span>
                  )}
                </div>
              </div>

              {/* Question Type */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" /> Question Type
                  </span>
                  <Popover open={isQuestionTypePopoverOpen} onOpenChange={setIsQuestionTypePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Neuen Question Type erstellen</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsQuestionTypePopoverOpen(false)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Question Type Name..."
                          value={newQuestionTypeName}
                          onChange={(e) => setNewQuestionTypeName(e.target.value)}
                          className="h-8 text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateQuestionType()}
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {TAG_COLORS.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                                newQuestionTypeColor === color ? "border-foreground" : "border-transparent"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => setNewQuestionTypeColor(color)}
                            />
                          ))}
                        </div>
                        <Button size="sm" className="w-full h-7 text-xs" onClick={handleCreateQuestionType} disabled={!newQuestionTypeName.trim()}>
                          Question Type erstellen
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Select
                  value={ticket.questionTypeId || 'none'}
                  onValueChange={(v) => onQuestionTypeChange?.(v === 'none' ? undefined : v)}
                >
                  <SelectTrigger className="h-7 w-full text-xs">
                    <SelectValue>
                      {questionType ? (
                        <Badge 
                          variant="outline" 
                          className="text-[10px]"
                          style={{ borderColor: questionType.color, color: questionType.color }}
                        >
                          {questionType.name}
                        </Badge>
                      ) : (
                        <span>Nicht kategorisiert</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nicht kategorisiert</SelectItem>
                    {questionTypes.map((qt) => (
                      <SelectItem key={qt.id} value={qt.id}>
                        <Badge 
                          variant="outline" 
                          className="text-[10px]"
                          style={{ borderColor: qt.color, color: qt.color }}
                        >
                          {qt.name}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Priorität
                </span>
                <Badge variant="outline" className={cn('text-[10px]', priorityColors[ticket.priority])}>
                  {ticket.priority}
                </Badge>
              </div>

              {/* Created */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Created
                </span>
                <span className="text-xs">{format(ticket.createdAt, 'dd.MM.yyyy HH:mm', { locale: de })}</span>
              </div>

              {/* First Response SLA */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" /> First Response SLA
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {account?.firstResponseSlaHours}h
                </Badge>
              </div>
            </div>
          </CollapsibleSection>
        );

      case 'account':
        return (
          <CollapsibleSection 
            key="account" 
            id="account" 
            title="Account" 
            icon={<Building2 className="h-4 w-4" />}
            defaultOpen={false}
          >
            <div className="space-y-3">
              {/* Companies */}
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Unternehmen</span>
                <div className="space-y-1">
                  {accountCompanies.map(c => (
                    <div key={c.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1">
                      <span className="font-medium">{c.name}</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span>{c.domain}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>
        );

      case 'contact':
        return (
          <CollapsibleSection 
            key="contact" 
            id="contact" 
            title="Contact" 
            icon={<User className="h-4 w-4" />}
            defaultOpen={false}
          >
            <div className="space-y-2">
              {accountContacts.slice(0, 5).map(c => (
                <div key={c.id} className={cn(
                  "p-2 rounded text-xs",
                  c.id === contact?.id ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                )}>
                  <p className="font-medium">{c.name}</p>
                  <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                    <Mail className="h-3 w-3" />
                    <span>{c.email}</span>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                      <Phone className="h-3 w-3" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>
              ))}
              {accountContacts.length > 5 && (
                <p className="text-[10px] text-muted-foreground text-center">
                  +{accountContacts.length - 5} weitere Kontakte
                </p>
              )}
            </div>
          </CollapsibleSection>
        );

      case 'recentIssues':
        return (
          <CollapsibleSection 
            key="recentIssues" 
            id="recentIssues" 
            title="Recent Issues" 
            icon={<Clock className="h-4 w-4" />}
            defaultOpen={false}
          >
            <div className="space-y-2">
              {recentTickets.length > 0 ? (
                recentTickets.map(t => (
                  <div key={t.id} className="p-2 bg-muted/50 rounded text-xs group hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium line-clamp-1 flex-1">{t.title}</p>
                      <div className={cn('w-2 h-2 rounded-full shrink-0 mt-1', statusColors[t.status])} />
                    </div>
                    <p className="text-muted-foreground mt-0.5">
                      {formatDistanceToNow(t.createdAt, { addSuffix: true, locale: de })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Keine früheren Tickets im letzten Jahr
                </p>
              )}
            </div>
          </CollapsibleSection>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          {sectionOrder.map(renderSection)}
        </SortableContext>
      </DndContext>
    </div>
  );
}
