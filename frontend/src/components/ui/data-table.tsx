import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentResponse, cn, getTableRowColour, statuses } from "@/lib/utils";
import { socket } from "@/socket";
import { useState } from "react";
import { Button } from "./button";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import { Input } from "./input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable<StudentResponse>({
    data: data as StudentResponse[],
    columns: columns as ColumnDef<StudentResponse>[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter answers..."
            value={
              (table.getColumn("answer")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("answer")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        </div>
        <div className="flex items-center space-x-2">
          {!!table.getFilteredSelectedRowModel().rows.length && (
            <>
              <Button
                className="h-8"
                variant="destructive"
                onClick={() => {
                  table.getFilteredSelectedRowModel().rows.forEach((row) => {
                    const data = row.original as StudentResponse;
                    socket.emitEvent("s_delete_answer", data.id);
                  });
                  table.resetRowSelection();
                }}
              >
                Delete
              </Button>
              <Button
                className="h-8"
                variant="default"
                onClick={() => {
                  table.getFilteredSelectedRowModel().rows.forEach((row) => {
                    const data = row.original as StudentResponse;
                    socket.emitEvent(
                      "s_update_response_status",
                      data,
                      "Correct"
                    );
                  });
                  table.resetRowSelection();
                }}
              >
                Mark Correct
              </Button>
            </>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(getTableRowColour(row.original.status))}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
