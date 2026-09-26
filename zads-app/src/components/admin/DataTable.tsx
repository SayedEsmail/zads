"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  isLoading?: boolean;
  manualPagination?: boolean;
  page?: number; // 1-indexed
  totalPages?: number;
  totalRows?: number;
  onPageChange?: (newPage: number) => void;
  searchValue?: string;
  onSearchChange?: (newSearch: string) => void;
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = "Search...",
  isLoading,
  manualPagination = false,
  page = 1,
  totalPages = 1,
  totalRows,
  onPageChange,
  searchValue,
  onSearchChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localGlobalFilter, setLocalGlobalFilter] = useState("");

  const effectiveSearch = manualPagination ? (searchValue ?? "") : localGlobalFilter;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      ...(!manualPagination && { globalFilter: localGlobalFilter }),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setLocalGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination
      ? { manualPagination: true, pageCount: totalPages }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          initialState: { pagination: { pageSize: 15 } },
        }),
  });

  const handleSearchChange = (val: string) => {
    if (manualPagination) {
      onSearchChange?.(val);
    } else {
      setLocalGlobalFilter(val);
    }
  };

  const currentPage = manualPagination ? page : table.getState().pagination.pageIndex + 1;
  const maxPage = manualPagination ? Math.max(1, totalPages) : Math.max(1, table.getPageCount());
  const rowsCount = manualPagination ? (totalRows ?? data.length) : table.getFilteredRowModel().rows.length;

  const canPrevious = manualPagination ? currentPage > 1 && !isLoading : table.getCanPreviousPage();
  const canNext = manualPagination ? currentPage < maxPage && !isLoading : table.getCanNextPage();

  const handlePrevious = () => {
    if (manualPagination) {
      if (currentPage > 1) onPageChange?.(currentPage - 1);
    } else {
      table.previousPage();
    }
  };

  const handleNext = () => {
    if (manualPagination) {
      if (currentPage < maxPage) onPageChange?.(currentPage + 1);
    } else {
      table.nextPage();
    }
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        value={effectiveSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full max-w-xs rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-start font-medium text-foreground"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex cursor-pointer items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-muted-foreground">
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                  No data found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-border bg-surface p-4">
            {row.getVisibleCells().map((cell) => {
              const header = table.getHeaderGroups()[0].headers.find((h) => h.id === cell.column.id);
              return (
                <div key={cell.id} className="flex justify-between py-1 text-sm">
                  <span className="text-muted-foreground">
                    {header ? flexRender(header.column.columnDef.header, header.getContext()) : cell.column.id}
                  </span>
                  <span>{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Page {currentPage} of {maxPage}
          {" · "}{rowsCount} rows
        </p>
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={!canPrevious}
            className="rounded-lg border border-border p-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-0 rotate-180" />
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="rounded-lg border border-border p-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-0 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
