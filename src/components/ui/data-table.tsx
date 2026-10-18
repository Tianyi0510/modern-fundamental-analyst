"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  FlexRender,
  type Header,
  type Row,
  type ReactTable,
  type RowData,
  type TableFeatures,
} from "@tanstack/react-table";
import { Empty, EmptyDescription } from "./empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

// The feature owns its table instance, columns, optional models and localized copy.
export function DataTable<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  emptyMessage,
  renderRow,
  headerProps,
  headerRowClassName,
  footer,
  ...props
}: Omit<ComponentProps<typeof Table>, "children"> & {
  table: ReactTable<TFeatures, TData>;
  emptyMessage: string;
  renderRow?: (row: Row<TFeatures, TData>) => ReactNode;
  headerProps?: (header: Header<TFeatures, TData>) => ComponentProps<"th">;
  headerRowClassName?: string;
  footer?: ReactNode;
}) {
  const rows = table.getRowModel().rows;
  return (
    <Table {...props}>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} className={headerRowClassName}>
            {group.headers.map((header) => (
              <TableHead key={header.id} scope="col" colSpan={header.colSpan} {...headerProps?.(header)}>
                {header.isPlaceholder ? null : <FlexRender header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length ? (
          rows.map((row) =>
            renderRow ? (
              renderRow(row)
            ) : (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ),
          )
        ) : (
          <TableRow>
            <TableCell colSpan={table.getAllLeafColumns().length} className="py-8 text-center">
              <Empty>
                <EmptyDescription>{emptyMessage}</EmptyDescription>
              </Empty>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      {footer}
    </Table>
  );
}
