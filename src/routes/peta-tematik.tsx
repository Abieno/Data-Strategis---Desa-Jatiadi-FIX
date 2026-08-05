import { lazy, Suspense, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Home, MapPin, AlertTriangle, Wrench } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRows } from "@/lib/data";
import type { RtlhPoint } from "@/components/portal/RtlhMap";

const RtlhMap = lazy(() => import("@/components/portal/RtlhMap"));

export const Route = createFileRoute("/peta-tematik")({
  head: () => ({
    meta: [
      { title: "Peta Tematik RTLH Desa Jatiadi — Peta Interaktif" },
      {
        name: "description",
        content: "Peta tematik interaktif Desa Jatiadi menampilkan sebaran Rumah Tidak Layak Huni (RTLH) lengkap dengan foto dan kategori kerusakan.",
      },
      { property: "og:title", content: "Peta Tematik RTLH Desa Jatiadi" },
      { property: "og:description", content: "Sebaran spasial Rumah Tidak Layak Huni Desa Jatiadi." },
    ],
  }),
  component: PetaTematik,
});

type Row = RtlhPoint & {
  jenis_atap: string | null;
  jenis_dinding: string | null;
  jenis_lantai: string | null;
  jumlah_penghuni: number | null;
  tahun_pendataan: number | null;
};

function PetaTematik() {
  const { data, isLoading } = useRows<Row>("rtlh", { order: "id_rtlh" });
  const [kategori, setKategori] = useState("all");
  const all = data ?? [];

  const points = all.filter((r) => kategori === "all" || r.kategori_kerusakan === kategori);
  const kategoriList = Array.from(new Set(all.map((r) => r.kategori_kerusakan).filter(Boolean))) as string[];

  const tableRows = points.map((r) => ({
    id_rtlh: r.id_rtlh,
    nama_kepala_keluarga: r.nama_kepala_keluarga,
    dusun: r.dusun,
    alamat: r.alamat,
    kategori_kerusakan: r.kategori_kerusakan,
    status: r.status,
    jumlah_penghuni: r.jumlah_penghuni,
  }));
  const columns = [
    { key: "id_rtlh", label: "ID RTLH" },
    { key: "nama_kepala_keluarga", label: "Kepala Keluarga" },
    { key: "dusun", label: "Dusun" },
    { key: "alamat", label: "Alamat" },
    { key: "kategori_kerusakan", label: "Kategori Kerusakan" },
    { key: "status", label: "Status" },
    { key: "jumlah_penghuni", label: "Penghuni", align: "right" as const },
  ];

  return (
    <PageShell
      breadcrumb="Peta Tematik"
      title="Peta Tematik RTLH"
      description="Sebaran spasial Rumah Tidak Layak Huni. Klik penanda untuk melihat detail dan foto rumah."
      actions={
        <Select value={kategori} onValueChange={setKategori}>
          <SelectTrigger className="h-9 w-[190px]" aria-label="Filter kategori kerusakan">
            <SelectValue placeholder="Kategori kerusakan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {kategoriList.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total RTLH" value={all.length} icon={Home} loading={isLoading} />
        <StatCard label="Rusak Berat" value={all.filter((r) => r.kategori_kerusakan === "Rusak Berat").length} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Rusak Sedang" value={all.filter((r) => r.kategori_kerusakan === "Rusak Sedang").length} icon={Wrench} tone="warning" />
        <StatCard label="Ditampilkan di Peta" value={points.length} icon={MapPin} tone="info" />
      </div>

      <ChartCard
        title="Peta Sebaran RTLH"
        description="Layer aktif: Rumah Tidak Layak Huni (RTLH)."
        metadataTable="rtlh"
        rows={tableRows}
        columns={columns}
        fileName="RTLH"
      >
        <ClientOnly fallback={<div className="h-[560px] w-full animate-pulse rounded-xl bg-muted" />}>
          <Suspense fallback={<div className="h-[560px] w-full animate-pulse rounded-xl bg-muted" />}>
            <RtlhMap points={points} />
          </Suspense>
        </ClientOnly>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {[
            ["Rusak Berat", "#dc2626"],
            ["Rusak Sedang", "#ea802a"],
            ["Rusak Ringan", "#16a34a"],
          ].map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="size-3 rounded-full border border-white shadow" style={{ background: color }} /> {label}
            </span>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Tabel Data RTLH" rows={tableRows} columns={columns} fileName="Tabel RTLH">
        <DataTable columns={columns} rows={tableRows} loading={isLoading} />
      </ChartCard>
    </PageShell>
  );
}
