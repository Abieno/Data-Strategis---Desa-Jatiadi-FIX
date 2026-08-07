import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { School, Users, GraduationCap, BookOpen, Mars, BottleWineIcon,
  Droplets,
  CircleDot,
  Waves,
  MoreHorizontal,
 } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { BarsChartsolo} from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";
import { subBusinessDays } from "date-fns";

export const Route = createFileRoute("/airminum")({
  head: () => ({
    meta: [
      { title: "Air Minum yang Digunakan Desa Jatiadi — Laki-Laki, Perempuan" },
      {
        name: "description",
        content: "Air Minum yang Digunakan di Desa Jatiadi.",
      },
      { property: "og:title", content: "Air Minum yang Digunakan Desa Jatiadi" },
      { property: "og:description", content: "Rangkuman Air Minum yang Digunakan Besar di Desa Jatiadi" },
    ],
  }),
  component: airminum,
});

type Row = { rt: string; akb: number; aiu: number; sbp: number; st: number; lainnya: number };

function airminum() {
  const { data, isLoading } = useRows<Row>("airminum");
  const rows = data ?? [];

  const akb = sum(rows, "akb");
  const aiu = sum(rows, "aiu");
  const sbp = sum(rows, "sbp");
  const st = sum(rows, "st");
  const lainnya = sum(rows, "lainnya");
  const total = akb + aiu + sbp + st + lainnya;
  const airminum = [
    {
      name: "Air kemasan bermerk",
      value: akb,
      percentage: ((akb / total) * 100).toFixed(1),
    },
    {
      name: "Air Isi Ulang",
      value: aiu,
      percentage: ((aiu / total) * 100).toFixed(1),
    },
    {
      name: "Sumur Bor/Pompa",
      value: sbp,
      percentage: ((sbp / total) * 100).toFixed(1),
    },
     {
      name: "Sumur Terlindung",
      value: st,
      percentage: ((st / total) * 100).toFixed(1),
    },
    {
      name: "Lainnya",
      value: lainnya,
      percentage: ((lainnya / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "rt", label: "RT" , align: "center" as const},
    { key: "akb", label: "Air kemasan bermerk", align: "center" as const },
    { key: "aiu", label: "Air Isi Ulang", align: "center" as const },
    { key: "sbp", label: "Sumur Bor/Pompa", align: "center" as const },
    { key: "st", label: "Sumur Terlindung", align: "center" as const },
    { key: "lainnya", label: "Lainnya", align: "center" as const },
  ];

  return (
    <PageShell
      breadcrumb="Air Minum yang Digunakan"
      title="Air Minum yang Digunakan"
      description="Rekapan Air Minum yang Digunakan di Desa Jatiadi"
    >

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <StatCard label="Air kemasan bermerk" value={akb} icon={BottleWineIcon} tone="warning" loading={isLoading} />
        <StatCard label="Air Isi Ulang" value={aiu} icon={Droplets} tone="info" loading={isLoading} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Sumur Bor/Pompa" value={sbp} icon={CircleDot} tone="success" loading={isLoading} />
        <StatCard label="Sumur Terlindung" value={st} icon={Waves} tone="warning" loading={isLoading} />
        <StatCard label="Lainnya" value={lainnya} icon={MoreHorizontal} tone="info"  />
      </div>

       <ChartCard
            title="Komposisi Air Minum yang Digunakan"
            columns={[
            { key: "name", label: "Air Minum yang Digunakan" },
            { key: "value", label: "Jumlah" },
            { key: "percentage", label: "Persentase" },
            ]}
            rows={airminum}
            fileName="Atap Bangunan Desa Jatiadi"
        >
            <BarsChartsolo data={airminum} xKey="name"/>
        </ChartCard>

      <ChartCard title="Tabel Air Minum yang Digunakan" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Atap Bangunan Desa Jatiadi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
          footerRow={{
            rt: "Total",
            akb: akb,
            aiu: aiu,
            sbp: sbp,
            st: st,
            lainnya: lainnya,
        }}
        />
      </ChartCard>
    </PageShell>
  );
}
