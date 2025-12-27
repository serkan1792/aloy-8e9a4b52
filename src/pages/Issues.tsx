import { useState, useCallback } from 'react';
import { Ticket, Message, TicketStatus, Channel, Priority } from '@/types';
import { initialTickets, initialMessages, agents } from '@/data/mockData';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { KanbanBoard } from '@/components/tickets/KanbanBoard';
import { TicketDetailSheet } from '@/components/tickets/TicketDetailSheet';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { TicketSearch } from '@/components/tickets/TicketSearch';
import { SavedViewsManager } from '@/components/tickets/SavedViewsManager';
import { BulkActionBar } from '@/components/tickets/BulkActionBar';
import { useTicketFilters } from '@/hooks/useTicketFilters';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Issues() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const { toast } = useToast();

  const {
    filters,
    filteredTickets,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    savedViews,
    activeViewId,
    saveView,
    loadView,
    deleteView,
    searchQuery,
    setSearchQuery,
  } = useTicketFilters({ tickets, messages });

  const handleTicketClick = useCallback((ticket: Ticket) => {
    if (isSelectionMode) {
      setSelectedTicketIds(prev => 
        prev.includes(ticket.id)
          ? prev.filter(id => id !== ticket.id)
          : [...prev, ticket.id]
      );
    } else {
      setSelectedTicket(ticket);
      setSheetOpen(true);
    }
  }, [isSelectionMode]);

  const handleTicketSelect = useCallback((ticketId: string, selected: boolean) => {
    setSelectedTicketIds(prev => 
      selected 
        ? [...prev, ticketId]
        : prev.filter(id => id !== ticketId)
    );
  }, []);

  const handleStatusChange = useCallback((ticketId: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date() } : t
      )
    );
    setSelectedTicket((prev) =>
      prev?.id === ticketId ? { ...prev, status: newStatus, updatedAt: new Date() } : prev
    );
  }, []);

  const handleAssigneeChange = useCallback((ticketId: string, assigneeId: string | undefined) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, assigneeId, updatedAt: new Date() } : t
      )
    );
    setSelectedTicket((prev) =>
      prev?.id === ticketId ? { ...prev, assigneeId, updatedAt: new Date() } : prev
    );
  }, []);

  const handleSendMessage = useCallback(
    (ticketId: string, content: string, channel: Channel, isInternal: boolean) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        ticketId,
        content,
        senderType: 'Agent',
        channel,
        timestamp: new Date(),
        messageType: isInternal ? 'internal' : 'external',
        authorId: 'agent-1',
      };

      setMessages((prev) => [...prev, newMessage]);

      if (!isInternal) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId ? { ...t, status: 'On Customer', updatedAt: new Date() } : t
          )
        );
        setSelectedTicket((prev) =>
          prev?.id === ticketId ? { ...prev, status: 'On Customer', updatedAt: new Date() } : prev
        );
      }
    },
    []
  );

  const handleSimulateReply = useCallback(
    (ticketId: string) => {
      const customerReplies = [
        'Vielen Dank für die schnelle Antwort!',
        'Ich habe das versucht, aber es funktioniert immer noch nicht.',
        'Können Sie mir bitte mehr Details dazu geben?',
        'Das hat geholfen, aber ich habe noch eine weitere Frage.',
        'Wann kann ich mit einer Lösung rechnen?',
      ];

      const randomReply = customerReplies[Math.floor(Math.random() * customerReplies.length)];
      const ticket = tickets.find((t) => t.id === ticketId);
      const lastMessage = messages.filter((m) => m.ticketId === ticketId).pop();

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        ticketId,
        content: randomReply,
        senderType: 'Customer',
        channel: lastMessage?.channel || ticket?.source === 'Email' ? 'Email' : 'Slack',
        timestamp: new Date(),
        messageType: 'external',
      };

      setMessages((prev) => [...prev, newMessage]);

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: 'On You', updatedAt: new Date() } : t
        )
      );
      setSelectedTicket((prev) =>
        prev?.id === ticketId ? { ...prev, status: 'On You', updatedAt: new Date() } : prev
      );
    },
    [tickets, messages]
  );

  const handleSaveView = useCallback((name: string) => {
    saveView(name);
  }, [saveView]);

  const handleDeleteView = useCallback((viewId: string) => {
    deleteView(viewId);
  }, [deleteView]);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
      setSelectedTicketIds([]);
    }
  }, [isSelectionMode]);

  const clearSelection = useCallback(() => {
    setSelectedTicketIds([]);
    setIsSelectionMode(false);
  }, []);

  const handleBulkAssign = useCallback((assigneeId: string) => {
    setTickets(prev => 
      prev.map(t => 
        selectedTicketIds.includes(t.id) 
          ? { ...t, assigneeId, updatedAt: new Date() }
          : t
      )
    );
    const agent = agents.find(a => a.id === assigneeId);
    toast({
      title: 'Zuweisung geändert',
      description: `${selectedTicketIds.length} Issues wurden ${agent?.name} zugewiesen.`,
    });
    clearSelection();
  }, [selectedTicketIds, toast, clearSelection]);

  const handleBulkStatusChange = useCallback((status: TicketStatus) => {
    setTickets(prev => 
      prev.map(t => 
        selectedTicketIds.includes(t.id) 
          ? { ...t, status, updatedAt: new Date() }
          : t
      )
    );
    toast({
      title: 'Status geändert',
      description: `${selectedTicketIds.length} Issues wurden auf "${status}" gesetzt.`,
    });
    clearSelection();
  }, [selectedTicketIds, toast, clearSelection]);

  const handleBulkPriorityChange = useCallback((priority: Priority) => {
    setTickets(prev => 
      prev.map(t => 
        selectedTicketIds.includes(t.id) 
          ? { ...t, priority, updatedAt: new Date() }
          : t
      )
    );
    toast({
      title: 'Priorität geändert',
      description: `${selectedTicketIds.length} Issues wurden auf "${priority}" gesetzt.`,
    });
    clearSelection();
  }, [selectedTicketIds, toast, clearSelection]);

  const handleBulkDelete = useCallback(() => {
    setTickets(prev => prev.filter(t => !selectedTicketIds.includes(t.id)));
    toast({
      title: 'Issues gelöscht',
      description: `${selectedTicketIds.length} Issues wurden gelöscht.`,
    });
    clearSelection();
  }, [selectedTicketIds, toast, clearSelection]);

  return (
    <>
      <Helmet>
        <title>Issues - SupportHub</title>
        <meta name="description" content="Verwalten Sie alle Support-Issues" />
      </Helmet>
      
      <div className="flex h-screen bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-hidden">
          <header className="h-auto min-h-16 border-b border-border px-6 py-4">
            <div className="flex items-center justify-between mb-3 gap-4">
              <div className="flex-shrink-0 flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-foreground">All Issues</h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredTickets.length} von {tickets.length} Issues
                    {(hasActiveFilters || searchQuery) && ' (gefiltert)'}
                  </p>
                </div>
                <Button
                  variant={isSelectionMode ? "secondary" : "outline"}
                  size="sm"
                  onClick={toggleSelectionMode}
                  className="h-8"
                >
                  {isSelectionMode ? (
                    <>
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Auswahl beenden
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4 mr-1" />
                      Auswählen
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <TicketSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="w-64"
                />
                <SavedViewsManager
                  savedViews={savedViews}
                  activeViewId={activeViewId}
                  hasActiveFilters={hasActiveFilters}
                  onSaveView={handleSaveView}
                  onLoadView={loadView}
                  onDeleteView={handleDeleteView}
                />
              </div>
            </div>
            <TicketFilters
              filters={filters}
              onUpdateFilter={updateFilter}
              onResetFilters={resetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </header>

          <div className="p-6 h-[calc(100vh-9rem)] overflow-hidden">
            <KanbanBoard 
              tickets={filteredTickets} 
              onTicketClick={handleTicketClick} 
              onTicketMove={handleStatusChange}
              isSelectable={isSelectionMode}
              selectedTicketIds={selectedTicketIds}
              onTicketSelect={handleTicketSelect}
            />
          </div>
        </main>

        <TicketDetailSheet
          ticket={selectedTicket}
          messages={messages}
          allTickets={tickets}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onStatusChange={handleStatusChange}
          onSendMessage={handleSendMessage}
          onSimulateReply={handleSimulateReply}
          onAssigneeChange={handleAssigneeChange}
        />

        <BulkActionBar
          selectedCount={selectedTicketIds.length}
          onClearSelection={clearSelection}
          onBulkAssign={handleBulkAssign}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkPriorityChange={handleBulkPriorityChange}
          onBulkDelete={handleBulkDelete}
        />
      </div>
    </>
  );
}
