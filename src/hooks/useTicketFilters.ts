import { useState, useCallback, useMemo, useEffect } from 'react';
import { Ticket, Message, TicketFilters, SavedView, defaultFilters } from '@/types';
import { getContactById } from '@/data/mockData';

const SAVED_VIEWS_KEY = 'supporthub-saved-views';
const ACTIVE_VIEW_KEY = 'supporthub-active-view';

interface UseTicketFiltersOptions {
  tickets: Ticket[];
  messages: Message[];
}

export function useTicketFilters({ tickets, messages }: UseTicketFiltersOptions) {
  const [filters, setFilters] = useState<TicketFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    const saved = localStorage.getItem(SAVED_VIEWS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((view: SavedView) => ({
          ...view,
          createdAt: new Date(view.createdAt),
          filters: {
            ...defaultFilters, // Ensure all fields exist with defaults
            ...view.filters,
            statuses: view.filters.statuses || [],
            dateRange: {
              from: view.filters.dateRange?.from ? new Date(view.filters.dateRange.from) : null,
              to: view.filters.dateRange?.to ? new Date(view.filters.dateRange.to) : null,
            },
          },
        }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [activeViewId, setActiveViewId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_VIEW_KEY);
  });

  // Load active view on mount
  useEffect(() => {
    if (activeViewId) {
      const view = savedViews.find(v => v.id === activeViewId);
      if (view) {
        setFilters({
          ...defaultFilters,
          ...view.filters,
          statuses: view.filters.statuses || [],
        });
      }
    }
  }, []);

  // Persist saved views
  useEffect(() => {
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(savedViews));
  }, [savedViews]);

  // Persist active view
  useEffect(() => {
    if (activeViewId) {
      localStorage.setItem(ACTIVE_VIEW_KEY, activeViewId);
    } else {
      localStorage.removeItem(ACTIVE_VIEW_KEY);
    }
  }, [activeViewId]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search query filter (title + messages)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = ticket.title.toLowerCase().includes(query);
        const ticketMessages = messages.filter(m => m.ticketId === ticket.id);
        const messageMatch = ticketMessages.some(m => 
          m.content.toLowerCase().includes(query)
        );
        if (!titleMatch && !messageMatch) {
          return false;
        }
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(ticket.status)) {
        return false;
      }

      // Priority filter
      if (filters.priorities.length > 0 && !filters.priorities.includes(ticket.priority)) {
        return false;
      }

      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(ticket.source)) {
        return false;
      }

      // Assignee filter
      if (filters.assigneeIds.length > 0) {
        if (!ticket.assigneeId || !filters.assigneeIds.includes(ticket.assigneeId)) {
          return false;
        }
      }

      // Company filter
      if (filters.companyIds.length > 0) {
        const contact = getContactById(ticket.contactId);
        if (!contact || !filters.companyIds.includes(contact.companyId)) {
          return false;
        }
      }

      // Date range filter (based on createdAt)
      if (filters.dateRange.from) {
        if (ticket.createdAt < filters.dateRange.from) {
          return false;
        }
      }
      if (filters.dateRange.to) {
        const toEnd = new Date(filters.dateRange.to);
        toEnd.setHours(23, 59, 59, 999);
        if (ticket.createdAt > toEnd) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, messages, filters, searchQuery]);

  const updateFilter = useCallback(<K extends keyof TicketFilters>(
    key: K,
    value: TicketFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActiveViewId(null); // Clear active view when filters change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setActiveViewId(null);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.statuses.length > 0 ||
      filters.priorities.length > 0 ||
      filters.sources.length > 0 ||
      filters.assigneeIds.length > 0 ||
      filters.companyIds.length > 0 ||
      filters.dateRange.from !== null ||
      filters.dateRange.to !== null
    );
  }, [filters]);

  const saveView = useCallback((name: string) => {
    const newView: SavedView = {
      id: `view-${Date.now()}`,
      name,
      filters: { ...filters },
      createdAt: new Date(),
    };
    setSavedViews(prev => [...prev, newView]);
    setActiveViewId(newView.id);
    return newView;
  }, [filters]);

  const loadView = useCallback((viewId: string) => {
    const view = savedViews.find(v => v.id === viewId);
    if (view) {
      setFilters(view.filters);
      setActiveViewId(viewId);
    }
  }, [savedViews]);

  const deleteView = useCallback((viewId: string) => {
    setSavedViews(prev => prev.filter(v => v.id !== viewId));
    if (activeViewId === viewId) {
      setActiveViewId(null);
    }
  }, [activeViewId]);

  const updateViewName = useCallback((viewId: string, newName: string) => {
    setSavedViews(prev => 
      prev.map(v => v.id === viewId ? { ...v, name: newName } : v)
    );
  }, []);

  return {
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
    updateViewName,
    searchQuery,
    setSearchQuery,
  };
}
