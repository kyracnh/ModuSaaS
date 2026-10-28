"use client";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function DataTable<T>({
  data,
  columns,
}: {
  data: T[];
  columns: ColumnDef<T>[];
}) {
  "use no memo";
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState("");
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  return (
    <div>
      <Input
        aria-label="Filter table"
        placeholder="Filter rows…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 max-w-xs"
      />
      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((g) => (
              <tr key={g.id}>
                {g.headers.map((h) => (
                  <th
                    key={h.id}
                    scope="col"
                    className="border-b border-border p-3"
                  >
                    <Button
                      variant="ghost"
                      onClick={h.column.getToggleSortingHandler()}
                      disabled={!h.column.getCanSort()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === "asc"
                        ? " ↑"
                        : h.column.getIsSorted() === "desc"
                          ? " ↓"
                          : ""}
                    </Button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((c) => (
                  <td className="border-b border-border p-3" key={c.id}>
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!table.getRowModel().rows.length && (
          <p className="p-4 text-sm">No matching rows.</p>
        )}
      </div>
    </div>
  );
}
