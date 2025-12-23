import { useState, useEffect, useCallback } from 'react';

export interface ColumnDefinition {
  id: string;
  label: string;
  defaultVisible: boolean;
}

export function useColumnConfig(storageKey: string, columns: ColumnDefinition[]) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return columns.filter(c => c.defaultVisible).map(c => c.id);
      }
    }
    return columns.filter(c => c.defaultVisible).map(c => c.id);
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  }, [storageKey, visibleColumns]);

  const toggleColumn = useCallback((columnId: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnId)) {
        // Don't allow removing the last column
        if (prev.length <= 1) return prev;
        return prev.filter(id => id !== columnId);
      }
      return [...prev, columnId];
    });
  }, []);

  const isColumnVisible = useCallback((columnId: string) => {
    return visibleColumns.includes(columnId);
  }, [visibleColumns]);

  const resetToDefault = useCallback(() => {
    setVisibleColumns(columns.filter(c => c.defaultVisible).map(c => c.id));
  }, [columns]);

  return {
    visibleColumns,
    toggleColumn,
    isColumnVisible,
    resetToDefault,
    allColumns: columns,
  };
}
