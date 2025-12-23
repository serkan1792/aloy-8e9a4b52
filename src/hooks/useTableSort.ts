import { useState, useMemo, useCallback, useEffect } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortItem {
  column: string;
  direction: 'asc' | 'desc';
}

export interface SortState {
  items: SortItem[];
}

const defaultSortState: SortState = { items: [] };

// Multi-column sort with localStorage persistence
export function useDynamicTableSort<T>(
  data: T[],
  getSortValue: (item: T, column: string) => unknown,
  storageKey?: string
) {
  const [sortState, setSortState] = useState<SortState>(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultSortState;
        }
      }
    }
    return defaultSortState;
  });

  // Persist to localStorage
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(sortState));
    }
  }, [storageKey, sortState]);

  const toggleSort = useCallback((column: string, isMultiSort: boolean = false) => {
    setSortState((prev) => {
      const existingIndex = prev.items.findIndex(item => item.column === column);
      const existing = existingIndex >= 0 ? prev.items[existingIndex] : null;

      if (isMultiSort) {
        // Multi-sort mode (Shift+Click)
        if (existing) {
          if (existing.direction === 'asc') {
            // Switch to desc
            const newItems = [...prev.items];
            newItems[existingIndex] = { column, direction: 'desc' };
            return { items: newItems };
          } else {
            // Remove from sort
            return { items: prev.items.filter(item => item.column !== column) };
          }
        } else {
          // Add as new sort column
          return { items: [...prev.items, { column, direction: 'asc' }] };
        }
      } else {
        // Single-sort mode (regular click)
        if (existing) {
          if (existing.direction === 'asc') {
            return { items: [{ column, direction: 'desc' }] };
          } else {
            return { items: [] };
          }
        } else {
          return { items: [{ column, direction: 'asc' }] };
        }
      }
    });
  }, []);

  const sortedData = useMemo(() => {
    if (sortState.items.length === 0) {
      return data;
    }

    return [...data].sort((a, b) => {
      for (const sortItem of sortState.items) {
        const aValue = getSortValue(a, sortItem.column);
        const bValue = getSortValue(b, sortItem.column);

        let comparison = 0;

        // Handle null/undefined
        if (aValue == null && bValue == null) {
          comparison = 0;
        } else if (aValue == null) {
          comparison = 1;
        } else if (bValue == null) {
          comparison = -1;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          const aStr = String(aValue).toLowerCase();
          const bStr = String(bValue).toLowerCase();
          comparison = aStr.localeCompare(bStr, 'de');
        }

        if (comparison !== 0) {
          return sortItem.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [data, sortState, getSortValue]);

  const getSortIndex = useCallback((column: string): number => {
    const index = sortState.items.findIndex(item => item.column === column);
    return index >= 0 ? index + 1 : -1;
  }, [sortState]);

  const getSortDirection = useCallback((column: string): SortDirection => {
    const item = sortState.items.find(item => item.column === column);
    return item?.direction || null;
  }, [sortState]);

  const clearSort = useCallback(() => {
    setSortState({ items: [] });
  }, []);

  return {
    sortState,
    toggleSort,
    sortedData,
    getSortIndex,
    getSortDirection,
    clearSort,
    isMultiSort: sortState.items.length > 1,
  };
}

// Legacy single-column sort (for backward compatibility)
export function useTableSort<T>(
  data: T[],
  defaultSort?: { column: string; direction: SortDirection }
) {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSort?.column || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction || null);

  const toggleSort = useCallback((column: string) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortColumn(null);
      setSortDirection(null);
    } else {
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortColumn];
      const bValue = (b as Record<string, unknown>)[sortColumn];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr, 'de');
      }
      return bStr.localeCompare(aStr, 'de');
    });
  }, [data, sortColumn, sortDirection]);

  return {
    sortState: { column: sortColumn, direction: sortDirection },
    toggleSort,
    sortedData,
  };
}
