import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { School, Users, GraduationCap, BookOpen } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/pendidikan")({
  head: () => ({
    meta: [
      { title: "Pendidikan Desa Jatiadi — Sekolah, Guru & Murid" },
      {
        name: "description",
        content: "Data fasilitas pendidikan Desa Jatiadi: jumlah sekolah, guru, dan murid menurut jenjang pendidikan.",
      },
      { property: "og:title", content: "Pendidikan Desa Jatiadi" },
      { property: "og:description", content: "Jumlah sekolah, guru, dan murid menurut jenjang di Desa Jatiadi." },
    ],
  }),
  component: Pendidikan,
});

type Row = { jenjang: string; jumlah_sekolah: number; jumlah_guru: number; jumlah_murid: number };

function Pendidikan() {
  const { data: years } = useYears("pendidikan_sekolah");
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years?.[0] ?? null;
  const { data, isLoading } = useRows<Row>("pendidikan_sekolah", { year: activeYear, order: "jenjang" });
  const rows = data ?? [];

  const sekolah = sum(rows, "jumlah_sekolah");
  const guru = sum(rows, "jumlah_guru");
  const murid = sum(rows, "jumlah_murid");
  const rasio = guru ? Math.round(murid / guru) : 0;

  const columns = [
    { key: "jenjang", label: "Jenjang" },
    { key: "jumlah_sekolah", label: "Sekolah", align: "right" as const },
    { key: "jumlah_guru", label: "Guru", align: "right" as const },
    { key: "jumlah_murid", label: "Murid", align: "right" as const },
  ];

  const chart = rows.map((r) => ({ name: r.jenjang, Sekolah: r.jumlah_sekolah, Guru: r.jumlah_guru, Murid: r.jumlah_murid }));

  return (
    <PageShell
      breadcrumb="Pendidikan"
      title="Pendidikan"
      description="Ketersediaan sekolah, guru, dan murid menurut jenjang pendidikan di Desa Jatiadi."
      actions={<YearFilter years={years ?? []} value={activeYear} onChange={setYear} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Jumlah Sekolah" value={sekolah} icon={School} loading={isLoading} />
        <StatCard label="Jumlah Guru" value={guru} icon={Users} tone="info" loading={isLoading} />
        <StatCard label="Jumlah Murid" value={murid} icon={GraduationCap} tone="success" loading={isLoading} />
        <StatCard label="Rasio Murid per Guru" value={rasio} icon={BookOpen} tone="warning" hint="Murid per satu guru" />
      </div>

      <ChartCard
        title="Guru dan Murid menurut Jenjang"
        metadataTable="pendidikan_sekolah"
        rows={chart}
        columns={[
          { key: "name", label: "Jenjang" },
          { key: "Guru", label: "Guru" },
          { key: "Murid", label: "Murid" },
        ]}
        fileName="Guru dan Murid per Jenjang"
      >
        <BarsChart
          data={chart}
          xKey="name"
          series={[
            { key: "Guru", label: "Guru" },
            { key: "Murid", label: "Murid" },
          ]}
        />
      </ChartCard>

      <ChartCard title="Tabel Fasilitas Pendidikan" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Fasilitas Pendidikan">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
          footerRow={{ jenjang: "Total", jumlah_sekolah: sekolah, jumlah_guru: guru, jumlah_murid: murid }}
        />
      </ChartCard>
    </PageShell>
  );
}
