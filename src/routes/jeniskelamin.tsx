import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { School, Users, GraduationCap, BookOpen, Mars, Venus } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { DonutChart } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/jeniskelamin")({
  head: () => ({
    meta: [
      { title: "Jenis Kelamin Desa Jatiadi — Laki-Laki, Perempuan" },
      {
        name: "description",
        content: "Jenis Kelamin di Desa Jatiadi.",
      },
      { property: "og:title", content: "Jenis Kelamin Desa Jatiadi" },
      { property: "og:description", content: "Rangkuman Jenis Kelamin di Desa Jatiadi" },
    ],
  }),
  component: jeniskelamin,
});

type Row = { lakilaki: number; perempuan: number };

function jeniskelamin() {
  const { data, isLoading } = useRows<Row>("jeniskelamin");
  const rows = data ?? [];

  const lakilaki = sum(rows, "lakilaki");
  const perempuan = sum(rows, "perempuan");
  const total = lakilaki + perempuan;
  const jeniskelamin = [
    {
      name: "Laki-laki",
      value: lakilaki,
      percentage: ((lakilaki / total) * 100).toFixed(1),
    },
    {
      name: "Perempuan",
      value: perempuan,
      percentage: ((perempuan / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "lakilaki", label: "Laki-Laki" , align: "center" as const},
    { key: "perempuan", label: "Perempuan", align: "center" as const },
  ];

  const chart = rows.map((r) => ({ name: r.lakilaki, Sekolah: r.perempuan }));

  return (
    <PageShell
      breadcrumb="Jenis Kelamin"
      title="Jenis Kelamin"
      description="Rekapan Jenis Kelamin di Desa Jatiadi"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Laki-Laki" value={lakilaki} icon={Mars} tone="info" loading={isLoading} />
        <StatCard label="Perempuan" value={perempuan} icon={Venus} tone="success" loading={isLoading} />
        <StatCard label="Jumlah Warga" value={total} icon={Users} tone="warning"  />
      </div>

      <ChartCard
        title="Komposisi Jenis Kelamin"
        columns={[
          { key: "name", label: "Jenis Kelamin" },
          { key: "value", label: "Jumlah" },
          { key: "percentage", label: "Persentase" },
        ]}
        rows={jeniskelamin}
        fileName="Jenis Kelamin Desa Jatiadi"
      >
        <DonutChart data={jeniskelamin} />
      </ChartCard>

      <ChartCard title="Tabel Jenis Kelamin" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Jenis Kelamin Desa Jatiadi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
        />
      </ChartCard>
    </PageShell>
  );
}
