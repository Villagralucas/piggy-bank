"use client"

import * as React from "react"
import { useTransition } from "react"
import {
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, SlidersHorizontal, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { createColumns, type TransactionRow } from "./columns"
import { features } from "./data-table-features"

const COLUMN_LABELS: Record<string, string> = {
  occurred_at: "Fecha",
  description: "Descripción",
  accountName: "Cuenta",
  category: "Categoría",
  amount: "Monto",
}

const PAGE_SIZES = [10, 20, 30, 50]

export function TransactionsDataTable({
  data,
  deleteTransaction,
  deleteTransactions,
}: {
  data: TransactionRow[]
  deleteTransaction: (id: string) => Promise<void>
  deleteTransactions: (ids: string[]) => Promise<void>
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pending, startTransition] = useTransition()

  const handleDeleteRow = React.useCallback(
    (id: string) => {
      if (!window.confirm("¿Seguro que quieres eliminar este movimiento?")) return
      startTransition(async () => {
        try {
          await deleteTransaction(id)
          toast.success("Movimiento eliminado")
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "No se pudo eliminar")
        }
      })
    },
    [deleteTransaction]
  )

  const columns = React.useMemo(
    () => createColumns({ onDeleteRow: handleDeleteRow }),
    [handleDeleteRow]
  )

  const table = useTable({
    features,
    data,
    columns,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  })

  const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)

  function handleDeleteSelected() {
    if (!window.confirm(`¿Eliminar ${selectedIds.length} movimiento(s) seleccionados?`))
      return
    startTransition(async () => {
      try {
        await deleteTransactions(selectedIds)
        toast.success("Movimientos eliminados")
        table.setRowSelection({})
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudieron eliminar")
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por descripción..."
          value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 py-1 pr-1 pl-2.5 text-sm">
            <span className="text-muted-foreground">
              {selectedIds.length} seleccionada{selectedIds.length === 1 ? "" : "s"}
            </span>
            <Button
              variant="destructive"
              size="xs"
              onClick={handleDeleteSelected}
              disabled={pending}
            >
              <Trash2 /> Eliminar
            </Button>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="ml-auto">
                <SlidersHorizontal /> Columnas
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
                >
                  {COLUMN_LABELS[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.id === "amount" ? "text-right" : undefined}
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {selectedIds.length} de {table.getFilteredRowModel().rows.length} fila(s)
          seleccionadas.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Filas por página</span>
            <Select
              value={String(table.state.pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-[70px]">
                <SelectValue>{(value: string | null) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Página {table.state.pagination.pageIndex + 1} de{" "}
            {Math.max(table.getPageCount(), 1)}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
