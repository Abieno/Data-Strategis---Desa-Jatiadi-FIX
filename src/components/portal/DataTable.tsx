import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { nf } from "@/lib/format";

export type Column = { key: string; label: string; align?: "left" | "right"; format?: "number" | "text" };

type Props = {
  columns: Column[];
  rows: Record<string, unknown>[];
  loading?: boolean;
  emptyText?: string;
  footerRow?: Record<string, unknown> | undefined;
};

export function DataTable({ columns, rows, loading, emptyText = "Belum ada data.", footerRow }: Props) {
  const render = (col: Column, row: Record<string, unknown>) => {
    const v = row[col.key];
    if (v == null || v === "") return "-";
    if (col.format === "number" || typeof v === "number") return nf.format(Number(v));
    return String(v);
  };

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60">
            {columns.map((c) => (
              <TableHead key={c.key} className={cn("whitespace-nowrap text-xs font-semibold", c.align === "right" && "text-right")}>
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c.key}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow key={i} className="hover:bg-primary-soft/50">
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    className={cn("whitespace-nowrap text-sm", c.align === "right" && "text-right tabular-nums")}
                  >
                    {render(c, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
          {footerRow && rows.length > 0 ? (
            <TableRow className="bg-primary-soft/70 font-semibold">
              {columns.map((c) => (
                <TableCell key={c.key} className={cn("text-sm", c.align === "right" && "text-right tabular-nums")}>
                  {render(c, footerRow)}
                </TableCell>
              ))}
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
