import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, BookOpen } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { Input } from "@/components/ui/input";
import { useRows } from "@/lib/data";

export const Route = createFileRoute("/metadata")({
  head: () => ({
    meta: [
      { title: "Metadata Indikator — Portal Data Desa Jatiadi" },
      {
        name: "description",
        content: "Definisi, satuan, sumber data, dan frekuensi pembaruan setiap indikator statistik pada Portal Data Strategis Desa Jatiadi.",
      },
      { property: "og:title", content: "Metadata Indikator Desa Jatiadi" },
      { property: "og:description", content: "Definisi dan sumber setiap indikator statistik desa." },
    ],
  }),
  component: Metadata,
});

type Row = {
  nama_tabel: string;
  nama_indikator: string;
  definisi: string | null;
  satuan: string | null;
  sumber_data: string | null;
  frekuensi_pembaruan: string | null;
  tahun: number | null;
};

function Metadata() {
  const { data, isLoading } = useRows<Row>("metadata_indikator", { order: "nama_tabel" });
  const [q, setQ] = useState("");

  const rows = (data ?? []).filter((r) =>
    [r.nama_indikator, r.nama_tabel, r.definisi, r.sumber_data].join(" ").toLowerCase().includes(q.toLowerCase()),
  ) as unknown as Record<string, unknown>[];

  const columns = [
    { key: "nama_indikator", label: "Indikator" },
    { key: "nama_tabel", label: "Tabel Sumber" },
    { key: "definisi", label: "Definisi" },
    { key: "satuan", label: "Satuan" },
    { key: "sumber_data", label: "Sumber Data" },
    { key: "frekuensi_pembaruan", label: "Frekuensi" },
    { key: "tahun", label: "Tahun" },
  ];

  return (
    <PageShell
      breadcrumb="Metadata"
      title="Metadata Indikator"
      description="Rujukan definisi, satuan, sumber, dan frekuensi pembaruan seluruh indikator pada portal ini."
      actions={
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari indikator…"
            className="h-9 w-full pl-9 sm:w-64"
            aria-label="Cari indikator"
          />
        </div>
      }
    >
      <div className="surface-card flex items-start gap-3 p-4 text-sm">
        <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <p className="text-muted-foreground">
          Metadata memastikan setiap angka pada portal dapat ditelusuri asal-usul, definisi, dan periode pendataannya.
        </p>
      </div>

      <ChartCard title="Daftar Metadata" rows={rows} columns={columns} fileName="Metadata Indikator">
        <DataTable columns={columns} rows={rows} loading={isLoading} emptyText="Metadata tidak ditemukan." />
      </ChartCard>
    </PageShell>
  );
}
