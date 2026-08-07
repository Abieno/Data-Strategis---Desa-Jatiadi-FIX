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
import { DonutChart } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";
import { subBusinessDays } from "date-fns";

export const Route = createFileRoute("/lantai")({
  head: () => ({
    meta: [
      { title: "Lantai Bangunan Desa Jatiadi — Laki-Laki, Perempuan" },
      {
        name: "description",
        content: "Lantai Bangunan di Desa Jatiadi.",
      },
      { property: "og:title", content: "Lantai Bangunan Desa Jatiadi" },
      { property: "og:description", content: "Rangkuman Lantai Bangunan di Desa Jatiadi" },
    ],
  }),
  component: lantai,
});

type Row = { rt: string; mg: number; keramik: number; utt: number; sb: number; tanah: number };

function lantai() {
  const { data, isLoading } = useRows<Row>("lantai");
  const rows = data ?? [];

  const mg = sum(rows, "mg");
  const keramik = sum(rows, "keramik");
  const utt = sum(rows, "utt");
  const sb = sum(rows, "sb");
  const tanah = sum(rows, "tanah");
  const total = mg + keramik + utt + sb + tanah;
  const lantai = [
    {
      name: "Marmer/Granit",
      value: mg,
      percentage: ((mg / total) * 100).toFixed(1),
    },
    {
      name: "Keramik",
      value: keramik,
      percentage: ((keramik / total) * 100).toFixed(1),
    },
    {
      name: "Ubin/Tegel/Teraso",
      value: utt,
      percentage: ((utt / total) * 100).toFixed(1),
    },
    {
      name: "Semen/Bata",
      value: sb,
      percentage: ((sb / total) * 100).toFixed(1),
    },
    {
      name: "Tanah",
      value: tanah,
      percentage: ((tanah / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "rt", label: "RT" , align: "center" as const},
    { key: "mg", label: "Marmer/Granit", align: "center" as const },
    { key: "keramik", label: "Keramik", align: "center" as const },
    { key: "utt", label: "Ubin/Tegel/Teraso", align: "center" as const },
    { key: "sb", label: "Semen/Bata", align: "center" as const },
    { key: "tanah", label: "Tanah", align: "center" as const },
  ];

  return (
    <PageShell
      breadcrumb="Lantai Bangunan"
      title="Lantai Bangunan"
      description="Rekapan Lantai Bangunan di Desa Jatiadi"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <StatCard label="Marmer/Granit" value={mg} icon={BrickWall} tone="info" loading={isLoading} />
        <StatCard label="Keramik" value={keramik} icon={Paintbrush} tone="success" loading={isLoading} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Ubin/Tegel/Teraso" value={utt} icon={PanelsTopLeft} tone="warning" loading={isLoading} />
        <StatCard label="Semen/Bata" value={sb} icon={Grid3X3} tone="info" loading={isLoading} />
        <StatCard label="Tanah" value={tanah} icon={TreePine} tone="success"  />
      </div>

       <ChartCard
               title="Komposisi Jenis Kelamin"
               columns={[
                 { key: "name", label: "Jenis Kelamin" },
                 { key: "value", label: "Jumlah" },
                 { key: "percentage", label: "Persentase" },
               ]}
               rows={lantai}
               fileName="Jenis Kelamin Desa Jatiadi"
             >
               <DonutChart data={lantai} />
             </ChartCard>

      <ChartCard title="Tabel Atap Bangunan" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Atap Bangunan Desa Jatiadi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
          footerRow={{
            rt: "Total",
            mg: mg,
            keramik: keramik,
            utt: utt,
            sb: sb,
            tanah: tanah,
        }}
        />
      </ChartCard>
    </PageShell>
  );
}
