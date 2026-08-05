import { useRef, useState, type ReactNode } from "react";
import { Download, Expand, FileSpreadsheet, FileText, Image as ImageIcon, Shrink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetadataInfo } from "@/components/portal/MetadataInfo";
import { exportElementImage, exportExcel, exportPdf, type ExportColumn } from "@/lib/export";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  metadataTable?: string;
  rows?: Record<string, unknown>[];
  columns?: ExportColumn[];
  fileName?: string;
  toolbar?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function ChartCard({
  title,
  description,
  metadataTable,
  rows,
  columns,
  fileName,
  toolbar,
  className,
  children,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  const canExportData = !!rows?.length && !!columns?.length;
  const name = fileName ?? title;

  return (
    <section
      className={cn(
        "surface-card flex flex-col p-5",
        full && "fixed inset-3 z-50 overflow-auto shadow-2xl",
        className,
      )}
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex items-center gap-1">
          {toolbar}
          {metadataTable ? <MetadataInfo table={metadataTable} /> : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Unduh data">
                <Download className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={!canExportData}
                onSelect={() => canExportData && exportExcel(rows!, columns!, name)}
              >
                <FileSpreadsheet className="mr-2 size-4" /> Unduh Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!canExportData}
                onSelect={() => canExportData && exportPdf(rows!, columns!, name)}
              >
                <FileText className="mr-2 size-4" /> Unduh PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void exportElementImage(bodyRef.current, name)}>
                <ImageIcon className="mr-2 size-4" /> Unduh Gambar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={full ? "Keluar layar penuh" : "Layar penuh"}
            onClick={() => setFull((v) => !v)}
          >
            {full ? <Shrink className="size-4" /> : <Expand className="size-4" />}
          </Button>
        </div>
      </header>

      <div ref={bodyRef} className={cn("flex-1", full && "min-h-[70vh]")}>
        {children}
      </div>
    </section>
  );
}
