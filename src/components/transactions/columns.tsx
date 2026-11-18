"use client"

import type { Column } from "@tanstack/react-table"
import { createColumnHelper } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, MoreHorizontal, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Category, Transaction } from "@/lib/types"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

import type { TransactionsTableFeatures } from "./data-table-features"

export type TransactionRow = Transaction & {
  accountName: string
  category?: Category
}

const columnHelper = createColumnHelper<TransactionsTableFeatures, TransactionRow>()

function SortableHeader<TValue>({
  column,
  label,
  className,
}: {
  column: Column<TransactionsTableFeatures, TransactionRow, TValue>
  label: string
  className?: string
}) {
  const sorted = column.getIsSorted()
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("-ml-2.5 h-7 px-2", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="ml-1.5 size-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-1.5 size-3.5" />
      ) : (
        <ArrowUpDown className="ml-1.5 size-3.5 text-muted-foreground" />
      )}
    </Button>
  )
}

export function createColumns({
  onDeleteRow,
}: {
  onDeleteRow: (id: string) => void
}) {
  return columnHelper.columns([
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("occurred_at", {
      header: ({ column }) => <SortableHeader column={column} label="Fecha" />,
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{formatDate(getValue())}</span>
      ),
      sortFn: "datetime",
    }),
    columnHelper.accessor("description", {
      header: ({ column }) => <SortableHeader column={column} label="Descripción" />,
      cell: ({ getValue }) => getValue() || "—",
      filterFn: "includesString",
      sortFn: "text",
    }),
    columnHelper.accessor("accountName", {
      header: "Cuenta",
      sortFn: "text",
    }),
    columnHelper.accessor("category", {
      id: "category",
      header: "Categoría",
      cell: ({ getValue }) => {
        const category = getValue()
        return category ? (
          <Badge
            variant="secondary"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
            }}
          >
            {category.name}
          </Badge>
        ) : (
          "—"
        )
      },
      enableSorting: false,
    }),
    columnHelper.accessor("amount", {
      header: ({ column }) => <SortableHeader column={column} label="Monto" />,
      cell: ({ row }) => (
        <div
          className={cn(
            "text-right font-medium whitespace-nowrap",
            row.original.type === "income" ? "text-success" : "text-destructive"
          )}
        >
          {row.original.type === "income" ? "+" : "-"}
          {formatCurrency(row.original.amount)}
        </div>
      ),
      sortFn: "basic",
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-xs">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.original.id)}
            >
              <Copy /> Copiar ID
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteRow(row.original.id)}
            >
              <Trash2 /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
  ])
}
