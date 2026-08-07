import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { School, Users, GraduationCap, BookOpen, Mars, Venus,
  BrickWall,
  Paintbrush,
  PanelsTopLeft,
  Grid3X3,
  TreePine,
 } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { BarsChartsolo } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/dinding")({
  head: () => ({
    meta: [
      { title: "Dinding Bangunan Desa Jatiadi — Laki-Laki, Perempuan" },
      {
        name: "description",
        content: "Dinding Bangunan di Desa Jatiadi.",
      },
      { property: "og:title", content: "Dinding Bangunan Desa Jatiadi" },
      { property: "og:description", content: "Rangkuman Dinding Bangunan di Desa Jatiadi" },
    ],
  }),
  component: dinding,
});

type Row = { rt: string; tembok: number; pa: number; kaggc: number; ab: number; bambu: number };

function dinding() {
  const { data, isLoading } = useRows<Row>("dinding");
  const rows = data ?? [];

  const tembok = sum(rows, "tembok");
  const pa = sum(rows, "pa");
  const kaggc = sum(rows, "kaggc");
  const ab = sum(rows, "ab");
  const bambu = sum(rows, "bambu");
  const total = tembok + pa + kaggc + ab + bambu;
  const dinding = [
    {
      name: "Tembok",
      value: tembok,
      percentage: ((tembok / total) * 100).toFixed(1),
    },
    {
      name: "Plasteran Anyaman",
      value: pa,
      percentage: ((pa / total) * 100).toFixed(1),
    },
    {
      name: "Kayu/Apan/Gysum/GRC/Calcilboard",
      value: kaggc,
      percentage: ((kaggc / total) * 100).toFixed(1),
    },
    {
      name: "Anyaman Bambu",
      value: ab,
      percentage: ((ab / total) * 100).toFixed(1),
    },
    {
      name: "Bambu",
      value: bambu,
      percentage: ((bambu / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "rt", label: "RT" , align: "center" as const},
    { key: "tembok", label: "Tembok", align: "center" as const },
    { key: "pa", label: "Plasteran Anyaman", align: "center" as const },
    { key: "kaggc", label: "Kayu/Apan/Gysum/GRC/Calcilboard", align: "center" as const },
    { key: "ab", label: "Anyaman Bambu", align: "center" as const },
    { key: "bambu", label: "Bambu", align: "center" as const },
  ];

  return (
    <PageShell
      breadcrumb="Dinding Bangunan"
      title="Dinding Bangunan"
      description="Rekapan Dinding Bangunan di Desa Jatiadi"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <StatCard label="Tembok" value={tembok} icon={BrickWall} tone="info" loading={isLoading} />
        <StatCard label="Plasteran Anyaman" value={pa} icon={Paintbrush} tone="success" loading={isLoading} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Kayu/Apan/Gysum/GRC/Calcilboard" value={kaggc} icon={PanelsTopLeft} tone="warning" loading={isLoading} />
        <StatCard label="Anyaman Bambu" value={ab} icon={Grid3X3} tone="info" loading={isLoading} />
        <StatCard label="Bambu" value={bambu} icon={TreePine} tone="success"  />
      </div>

        <ChartCard
            title="Komposisi Atap Bangunan"
            columns={[
            { key: "name", label: "Atap Bangunan" },
            { key: "value", label: "Jumlah" },
            { key: "percentage", label: "Persentase" },
            ]}
            rows={dinding}
            fileName="Atap Bangunan Desa Jatiadi"
        >
            <BarsChartsolo data={dinding} xKey="name"/>
        </ChartCard>

      <ChartCard title="Tabel Atap Bangunan" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Atap Bangunan Desa Jatiadi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
          footerRow={{
            rt: "Total",
            tembok: tembok,
            pa: pa,
            kaggc: kaggc,
            ab: ab,
            bambu: bambu,
        }}
        />
      </ChartCard>
    </PageShell>
  );
}
