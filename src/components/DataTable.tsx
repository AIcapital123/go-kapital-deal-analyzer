import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export const DataTable = <T,>({ columns, rows, rowKey, onRowClick, emptyMessage = "No records found." }: { columns: TableColumn<T>[]; rows: T[]; rowKey: (row: T) => string; onRowClick?: (row: T) => void; emptyMessage?: string }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead className="border-y border-[#E7EBEF] bg-[#F8FAFB] text-[11px] uppercase tracking-wide text-[#667085]">
        <tr>{columns.map((column) => <th key={column.key} className={cn("whitespace-nowrap px-4 py-3 font-bold", column.className)}>{column.header}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-[#E7EBEF]">
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            onKeyDown={(event) => event.key === "Enter" && onRowClick?.(row)}
            tabIndex={onRowClick ? 0 : undefined}
            className={cn("text-[#344054]", onRowClick && "cursor-pointer transition-colors hover:bg-[#F8FBF8] focus:bg-[#F8FBF8] focus:outline-none")}
          >
            {columns.map((column) => <td key={column.key} className={cn("px-4 py-3.5 align-middle", column.className)}>{column.render(row)}</td>)}
          </tr>
        ))}
        {rows.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-[#667085]">{emptyMessage}</td></tr>}
      </tbody>
    </table>
  </div>
);
