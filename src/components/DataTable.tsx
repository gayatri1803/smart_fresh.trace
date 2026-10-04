import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchFilter,
  pageSize = 8,
  onRowClick,
  emptyMessage = 'No records found matching criteria',
  className = '',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    if (searchFilter) {
      return data.filter((item) => searchFilter(item, query));
    }
    return data.filter((item) => {
      return Object.values(item as Record<string, unknown>).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchFilter]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      return sortDirection === 'asc' ? 1 : -1;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div
      className={`bg-bg-card border border-border-card rounded-[16px] overflow-hidden transition-all duration-200 hover:shadow-soft-hover ${className}`}
    >
      {/* Search Header Bar */}
      {searchable && (
        <div className="p-4 border-b border-border-card bg-[#FBF7F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-[#F5EFE6] border border-border-card rounded-lg pl-9 pr-3 py-1.5 text-xs text-content placeholder:text-content-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div className="text-xs text-content-muted self-end sm:self-center tabular-nums">
            Showing <span className="font-medium text-content">{sortedData.length}</span> entries
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F4ECE0] border-b border-border-card text-content-muted uppercase tracking-wider font-semibold text-[11px]">
              {columns.map((col, idx) => {
                const isSorted = col.accessorKey && sortKey === col.accessorKey;
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <th
                    key={idx}
                    scope="col"
                    style={{ width: col.width }}
                    className={`py-3 px-4 ${alignClass} ${
                      col.sortable ? 'cursor-pointer select-none hover:text-content hover:bg-[#EFE5D7]' : ''
                    } transition-colors`}
                    onClick={() => col.sortable && handleSort(col.accessorKey)}
                  >
                    <div
                      className={`inline-flex items-center gap-1 ${
                        col.align === 'right' ? 'justify-end w-full' : col.align === 'center' ? 'justify-center w-full' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="shrink-0 text-content-muted">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-accent" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-accent" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-card/60">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 px-4 text-center text-content-muted italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : paginatedData.map((item, rowIdx) => {
                const itemId = (item as { id?: string | number }).id ?? rowIdx;
                return (
                  <tr
                    key={itemId}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? 'button' : undefined}
                    aria-label={onRowClick ? `View consignment details for #${itemId}` : undefined}
                    onClick={() => onRowClick && onRowClick(item)}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowClick(item);
                            }
                          }
                        : undefined
                    }
                    className={`transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#F5EFE6] focus-visible:ring-1 focus-visible:ring-[#1F4D3A]/40 ${
                      onRowClick ? 'cursor-pointer hover:bg-[#F5EFE6]' : 'hover:bg-[#FAF4EB]'
                    }`}
                  >
                  {columns.map((col, colIdx) => {
                    const alignClass =
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left';

                    const content = col.cell
                      ? col.cell(item)
                      : col.accessorKey
                      ? String((item as Record<string, unknown>)[col.accessorKey as string] ?? '')
                      : null;

                    return (
                      <td
                        key={colIdx}
                        className={`py-3.5 px-4 text-content ${alignClass} tabular-nums`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-border-card bg-[#FBF7F0] flex items-center justify-between text-xs text-content-muted">
          <span className="tabular-nums">
            Page <span className="font-semibold text-content">{currentPage}</span> of{' '}
            <span className="font-semibold text-content">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-border-card bg-[#F5EFE6] text-content hover:bg-[#EFE6D7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-border-card bg-[#F5EFE6] text-content hover:bg-[#EFE6D7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
