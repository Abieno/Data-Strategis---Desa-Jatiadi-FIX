import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { School, Users, GraduationCap, BookOpen, Mars, Venus,
  Grid3X3,
  Toilet,
  UserRound,
  UsersRound,
  Ban,
 } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { BarsChartsolobawah } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";
import { subBusinessDays } from "date-fns";

export const Route = createFileRoute("/fasilitasbab")({
  head: () => ({
    meta: [
      { title: "Fasilitas Buang Air Besar Desa Jatiadi — Laki-Laki, Perempuan" },
      {
        name: "description",
        content: "Fasilitas Buang Air Besar di Desa Jatiadi.",
      },
      { property: "og:title", content: "Fasilitas Buang Air Besar Desa Jatiadi" },
      { property: "og:description", content: "Rangkuman Fasilitas Buang Air Besar di Desa Jatiadi" },
    ],
  }),
  component: fasilitasbab,
});

type Row = { rt: string; adas: number; adab: number; tidakada: number };

function fasilitasbab() {
  const { data, isLoading } = useRows<Row>("fasilitasbab");
  const rows = data ?? [];

  const adas = sum(rows, "adas");
  const adab = sum(rows, "adab");
  const tidakada = sum(rows, "tidakada");
  const total = adas + adab + tidakada;
  const fasilitasbab = [
    {
      name: "Ada, digunakan hanya anggota keluarga sendiri",
      value: adas,
      percentage: ((adas / total) * 100).toFixed(1),
    },
    {
      name: "Ada, digunakan bersama Anggota Keluarga dari Keluarga tertentu",
      value: adab,
      percentage: ((adab / total) * 100).toFixed(1),
    },
    {
      name: "Tidak ada fasilitas",
      value: tidakada,
      percentage: ((tidakada / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "rt", label: "RT" , align: "center" as const},
    { key: "adas", label: "Ada, digunakan hanya anggota keluarga sendiri", align: "center" as const },
    { key: "adab", label: "Ada, digunakan bersama Anggota Keluarga dari Keluarga tertentu", align: "center" as const },
    { key: "tidakada", label: "Tidak ada fasilitas", align: "center" as const },
  ];

  return (
    <PageShell
      breadcrumb="Fasilitas Buang Air"
      title="Fasilitas Buang Air"
      description="Rekapan Fasilitas Buang Air di Desa Jatiadi"
    >

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Ada, digunakan sendiri" value={adas} icon={UserRound} tone="warning" loading={isLoading} />
        <StatCard label="Ada, digunakan bersama" value={adab} icon={UsersRound} tone="info" loading={isLoading} />
        <StatCard label="Tidak ada fasilitas" value={tidakada} icon={Ban} tone="success"  />
      </div>

       <ChartCard
          title="Komposisi Fasilitas Buang Air"
          columns={[
          { key: "name", label: "Fasilitas Buang Air" },
          { key: "value", label: "Jumlah" },
          { key: "percentage", label: "Persentase" },
          ]}
          rows={fasilitasbab}
          fileName="Atap Bangunan Desa Jatiadi"
      >
          <BarsChartsolobawah data={fasilitasbab} xKey="name"/>
      </ChartCard>

      <ChartCard title="Tabel Atap Bangunan" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Atap Bangunan Desa Jatiadi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
          footerRow={{
            rt: "Total",
            adas: adas,
            adab: adab,
            tidakada: tidakada,
        }}
        />
      </ChartCard>
    </PageShell>
  );
}
