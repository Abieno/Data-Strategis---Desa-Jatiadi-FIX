import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { School, Users, GraduationCap, BookOpen, Mars, Venus, House, PanelTop, Layers3 } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { BarsChartsolobawah } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/atap")({
  head: () => ({
    meta: [
      { title: "Atap Bangunan Desa Jatiadi — Laki-Laki, Perempuan" },
      {
        name: "description",
        content: "Atap Bangunan di Desa Jatiadi.",
      },
      { property: "og:title", content: "Atap Bangunan Desa Jatiadi" },
      { property: "og:description", content: "Rangkuman Atap Bangunan di Desa Jatiadi" },
    ],
  }),
  component: atap,
});

type Row = { rt: string; genteng: number; seng: number; asbes: number };

function atap() {
  const { data, isLoading } = useRows<Row>("atap");
  const rows = data ?? [];

  const genteng = sum(rows, "genteng");
  const seng = sum(rows, "seng");
  const asbes = sum(rows, "asbes");
  const total = genteng + seng + asbes;
  const atap = [
    {
      name: "Genteng",
      value: genteng,
      percentage: ((genteng / total) * 100).toFixed(1),
    },
    {
      name: "Seng",
      value: seng,
      percentage: ((seng / total) * 100).toFixed(1),
    },
    {
      name: "Asbes",
      value: asbes,
      percentage: ((asbes / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "rt", label: "RT" , align: "center" as const},
    { key: "genteng", label: "Genteng", align: "center" as const },
    { key: "seng", label: "Seng", align: "center" as const },
    { key: "asbes", label: "Asbes", align: "center" as const },
  ];

  return (
    <PageShell
      breadcrumb="Atap Bangunan"
      title="Atap Bangunan"
      description="Rekapan Atap Bangunan di Desa Jatiadi"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Genteng" value={genteng} icon={House} tone="info" loading={isLoading} />
        <StatCard label="Seng" value={seng} icon={PanelTop} tone="success" loading={isLoading} />
        <StatCard label="Asbes" value={asbes} icon={Layers3} tone="warning"  />
      </div>

        <ChartCard
            title="Komposisi Atap Bangunan"
            columns={[
            { key: "name", label: "Atap Bangunan" },
            { key: "value", label: "Jumlah" },
            { key: "percentage", label: "Persentase" },
            ]}
            rows={atap}
            fileName="Atap Bangunan Desa Jatiadi"
        >
            <BarsChartsolobawah data={atap} xKey="name"/>
        </ChartCard>

      <ChartCard title="Tabel Atap Bangunan" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Atap Bangunan Desa Jatiadi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
          footerRow={{
            rt: "Total",
            genteng: genteng,
            seng: seng,
            asbes: asbes,
        }}
        />
      </ChartCard>
    </PageShell>
  );
}
