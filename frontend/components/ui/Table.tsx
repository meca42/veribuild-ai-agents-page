import { useState, useMemo, type ReactNode, type KeyboardEvent } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { Checkbox } from './Checkbox';
import { Button } from './Button';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortable?: boolean;
  hideable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  stickyHeader?: boolean;
  className?: string;
}

export const Table = <T,>({
  columns,
  data,
  getRowId,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  pagination = false,
  pageSize = 10,
  emptyMessage = 'No data available',
  stickyHeader = true,
  className,
}: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);

  const visibleColumns = useMemo(
    () => columns.filter((col) => !hiddenColumns.has(col.key)),
    [columns, hiddenColumns]
  );

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;

    const column = columns.find((col) => col.key === sortKey);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aVal = column.accessor(a);
      const bVal = column.accessor(b);
      const aStr = String(aVal ?? '');
      const bStr = String(bVal ?? '');

      if (sortDir === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortKey, sortDir, columns]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    if (sortKey === columnKey) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') {
        setSortDir(null);
        setSortKey(null);
      }
    } else {
      setSortKey(columnKey);
      setSortDir('asc');
    }
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnKey)) {
        next.delete(columnKey);
      } else {
        next.add(columnKey);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(new Set(paginatedData.map(getRowId)));
    } else {
      onSelectionChange?.(new Set());
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    onSelectionChange?.(newSelection);
  };

  const allSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedRows.has(getRowId(row)));

  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, index: number) => {
    const rowCount = paginatedData.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (index < rowCount - 1) {
          setFocusedRowIndex(index + 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          setFocusedRowIndex(index - 1);
        }
        break;
      case ' ':
        if (selectable) {
          e.preventDefault();
          const rowId = getRowId(paginatedData[index]);
          handleSelectRow(rowId, !selectedRows.has(rowId));
        }
        break;
    }
  };

  const hideableColumns = columns.filter((col) => col.hideable !== false);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {hideableColumns.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-neutral-600 dark:text-neutral-400 self-center">Show columns:</span>
          {hideableColumns.map((col) => (
            <Checkbox
              key={col.key}
              label={col.header}
              checked={!hiddenColumns.has(col.key)}
              onChange={(e) => toggleColumnVisibility(col.key)}
            />
          ))}
        </div>
      )}

      <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead
            className={cn(
              'bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700',
              stickyHeader && 'sticky top-0 z-10'
            )}
          >
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <Checkbox checked={allSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100', col.width)}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:text-blue-600 dark:focus:text-blue-400"
                      aria-label={`Sort by ${col.header}`}
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.has(rowId);
                const isFocused = focusedRowIndex === index;

                return (
                  <tr
                    key={rowId}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={() => setFocusedRowIndex(index)}
                    className={cn(
                      'border-b border-neutral-200 dark:border-neutral-700 last:border-b-0',
                      'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                      'focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-800',
                      isSelected && 'bg-blue-50 dark:bg-blue-900/20',
                      isFocused && 'ring-2 ring-inset ring-blue-500'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                        {col.accessor(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
