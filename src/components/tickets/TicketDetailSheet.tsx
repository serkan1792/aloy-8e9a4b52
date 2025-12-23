import { useEffect, useRef, useState } from 'react';
import { Ticket, Message, TicketStatus, Channel } from '@/types';
import { getContactById, getCompanyByContactId, getAccountById, agents } from '@/data/mockData';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from './ChatMessage';
import { MessageComposer } from './MessageComposer';
import { TicketInfoPanel } from './TicketInfoPanel';
import { X, Zap, MessageSquare, StickyNote, MessagesSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlanDisplay } from '@/hooks/usePlanDisplay';

interface TicketDetailSheetProps {
  ticket: Ticket | null;
  messages: Message[];
  allTickets: Ticket[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
  onSendMessage: (ticketId: string, content: string, channel: Channel, isInternal: boolean) => void;
  onSimulateReply: (ticketId: string) => void;
  onAssigneeChange?: (ticketId: string, assigneeId: string | undefined) => void;
  onTeamChange?: (ticketId: string, teamId: string | undefined) => void;
  onTagsChange?: (ticketId: string, tagIds: string[]) => void;
  onQuestionTypeChange?: (ticketId: string, questionTypeId: string | undefined) => void;
}

const statuses: TicketStatus[] = ['Neu', 'On You', 'On Customer', 'On Hold', 'Closed'];

const statusColors: Record<TicketStatus, string> = {
  'Neu': 'bg-status-new text-primary-foreground',
  'On You': 'bg-status-on-you text-primary-foreground',
  'On Customer': 'bg-status-on-customer text-primary-foreground',
  'On Hold': 'bg-status-on-hold text-primary-foreground',
  'Closed': 'bg-status-closed text-primary-foreground',
};

export function TicketDetailSheet({
  ticket,
  messages,
  allTickets,
  open,
  onOpenChange,
  onStatusChange,
  onSendMessage,
  onSimulateReply,
  onAssigneeChange,
  onTeamChange,
  onTagsChange,
  onQuestionTypeChange,
}: TicketDetailSheetProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const internalMessagesEndRef = useRef<HTMLDivElement>(null);
  const allMessagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'customer' | 'internal'>('all');
  const { getAccountPlanDisplay, isPremiumPlan } = usePlanDisplay();

  const contact = ticket ? getContactById(ticket.contactId) : null;
  const company = ticket ? getCompanyByContactId(ticket.contactId) : null;
  const account = ticket ? getAccountById(ticket.accountId) : null;

  const ticketMessages = messages.filter((m) => m.ticketId === ticket?.id);
  const externalMessages = ticketMessages.filter((m) => m.messageType === 'external');
  const internalMessages = ticketMessages.filter((m) => m.messageType === 'internal');
  const allMessagesSorted = [...ticketMessages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const lastExternalMessage = externalMessages[externalMessages.length - 1];
  const defaultChannel: Channel = lastExternalMessage?.channel || 'Slack';

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (activeTab === 'all') {
          allMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else if (activeTab === 'customer') {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
          internalMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [open, ticketMessages.length, activeTab]);

  if (!ticket) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[90vw] lg:max-w-[1200px] p-0 flex flex-col !h-screen">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/30">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h2 className="text-base font-semibold text-foreground truncate">
              {ticket.title}
            </h2>
            {account && (
              <Badge variant={isPremiumPlan(account.planId) ? 'default' : 'outline'} className="shrink-0 text-xs">
                {getAccountPlanDisplay(account)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={ticket.status}
              onValueChange={(v) => onStatusChange(ticket.id, v as TicketStatus)}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', statusColors[status])} />
                      <span>{status}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSimulateReply(ticket.id)}
              className="h-8 w-8"
              title="Simulate Customer Reply"
            >
              <Zap className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Column - Chat (2/3) */}
          <div className="flex-[2] flex flex-col min-h-0 border-r border-border">
            {/* Tab List */}
            <div className="px-4 pt-3 pb-0 shrink-0">
              <div className="flex w-full bg-muted rounded-md p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-all",
                    activeTab === 'all' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MessagesSquare className="w-4 h-4" />
                  Alle
                  {ticketMessages.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {ticketMessages.length}
                    </Badge>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('customer')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-all",
                    activeTab === 'customer' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                  Kunde
                  {externalMessages.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {externalMessages.length}
                    </Badge>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('internal')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-sm transition-all",
                    activeTab === 'internal' 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <StickyNote className="w-4 h-4" />
                  Intern
                  {internalMessages.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      {internalMessages.length}
                    </Badge>
                  )}
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className={cn(
              "flex-1 overflow-y-auto p-4 space-y-4",
              activeTab === 'internal' && "bg-amber-50/30 dark:bg-amber-950/10"
            )}>
              {activeTab === 'all' && (
                <>
                  {allMessagesSorted.map((message, index) => {
                    const prevMessage = index > 0 ? allMessagesSorted[index - 1] : null;
                    const showDivider = prevMessage && prevMessage.messageType !== message.messageType;
                    
                    return (
                      <div key={message.id}>
                        {showDivider && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground font-medium px-2">
                              {message.messageType === 'internal' ? 'Interne Notiz' : 'Kundenchat'}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        )}
                        <ChatMessage message={message} showAuthor={message.messageType === 'internal'} />
                      </div>
                    );
                  })}
                  {ticketMessages.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                      Noch keine Nachrichten
                    </div>
                  )}
                  <div ref={allMessagesEndRef} />
                </>
              )}

              {activeTab === 'customer' && (
                <>
                  {externalMessages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {externalMessages.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                      Noch keine Nachrichten
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}

              {activeTab === 'internal' && (
                <>
                  {internalMessages.map((message) => (
                    <ChatMessage key={message.id} message={message} showAuthor />
                  ))}
                  {internalMessages.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                      Noch keine internen Notizen
                    </div>
                  )}
                  <div ref={internalMessagesEndRef} />
                </>
              )}
            </div>

            {/* Composer */}
            <div className="shrink-0">
              <MessageComposer
                defaultChannel={defaultChannel}
                onSend={(content, channel, isInternal) => onSendMessage(ticket.id, content, channel, isInternal)}
                disabled={ticket.status === 'Closed'}
                activeTab={activeTab === 'all' ? 'customer' : activeTab}
              />
            </div>
          </div>

          {/* Right Column - Info Panel (1/3) */}
          <div className="flex-1 min-w-[280px] max-w-[400px] bg-muted/20 overflow-hidden">
            <TicketInfoPanel
              ticket={ticket}
              allTickets={allTickets}
              onAssigneeChange={(id) => onAssigneeChange?.(ticket.id, id)}
              onTeamChange={(id) => onTeamChange?.(ticket.id, id)}
              onTagsChange={(ids) => onTagsChange?.(ticket.id, ids)}
              onQuestionTypeChange={(id) => onQuestionTypeChange?.(ticket.id, id)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
