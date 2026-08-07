import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Ban,
  School,
  BookOpen,
  GraduationCap,
  BadgeCheck,
  University,
  Award,
} from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { BarsChartsolo } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/ijazahtertinggi")({
  head: () => ({
    meta: [
      { title: "Ijazah Tertinggi — Belum Punya Ijazah sampai S2" },
      {
        name: "description",
        content: "Ijazah Tertinggi di Desa Jatiadi.",
      },
      { property: "og:title", content: "Ijazah Tertinggi Desa Jatiadi" },
      { property: "og:description", content: "Rangkuman Ijazah Tertinggi di Desa Jatiadi" },
    ],
  }),
  component: ijazahtertinggi,
});

type Row = { tidakpunyaijazah: number; sd: number; smp: number; sma: number; ahlipratamamudamadya: number; sarjana: number; magister: number };

function ijazahtertinggi() {
  const { data, isLoading } = useRows<Row>("ijazahtertinggi");
  const rows = data ?? [];

  const tidakpunyaijazah = sum(rows, "tidakpunyaijazah");
  const sd = sum(rows, "sd");
  const smp = sum(rows, "smp");
  const sma = sum(rows, "sma");
  const ahlipratamamudamadya = sum(rows, "ahlipratamamudamadya");
  const sarjana = sum(rows, "sarjana");
  const magister = sum(rows, "magister");
  const total = tidakpunyaijazah + sd + smp + sma + ahlipratamamudamadya + sarjana + magister;
  const ijazahtertinggi = [
    {
      name: "Tidak Punya Ijazah SD",
      value: tidakpunyaijazah,
      percentage: ((tidakpunyaijazah / total) * 100).toFixed(1),
    },
    {
      name: "SD/Sederajat",
      value: sd,
      percentage: ((sd / total) * 100).toFixed(1),
    },
    {
      name: "SMP/Sederajat",
      value: smp,
      percentage: ((smp / total) * 100).toFixed(1),
    },
    {
      name: "SMA/Sederajat",
      value: sma,
      percentage: ((sma / total) * 100).toFixed(1),
    },
    {
      name: "D1/D2/D3",
      value: ahlipratamamudamadya,
      percentage: ((ahlipratamamudamadya / total) * 100).toFixed(1),
    },
    {
      name: "D4/S1",
      value: sarjana,
      percentage: ((sarjana / total) * 100).toFixed(1),
    },
    {
      name: "S2",
      value: magister,
      percentage: ((magister / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "tidakpunyaijazah", label: "Tidak Punya Ijazah SD" , align: "center" as const},
    { key: "sd", label: "SD/Sederajat", align: "center" as const },
    { key: "smp", label: "SMP/Sederajat" , align: "center" as const},
    { key: "sma", label: "SMA/Sederajat" , align: "center" as const},
    { key: "ahlipratamamudamadya", label: "D1/D2/D3" , align: "center" as const},
    { key: "sarjana", label: "D4/S1" , align: "center" as const},
    { key: "magister", label: "S2" , align: "center" as const},
  ];

  return (
    <PageShell
      breadcrumb="Ijazah Kertinggi"
      title="Ijazah Tertinggi"
      description="Rekapan Ijazah Tertinggi di Desa Jatiadi"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tidak Punya Ijazah SD" value={tidakpunyaijazah} icon={Ban} tone="info" loading={isLoading} />
        <StatCard label="SD/Sederajat" value={sd} icon={School} tone="success" loading={isLoading} />
        <StatCard label="SMP/Sederajat" value={smp} icon={BookOpen} tone="warning" />
        <StatCard label="SMA/Sederajat" value={sma} icon={GraduationCap} tone="info"  />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="D1/D2/D3" value={ahlipratamamudamadya} icon={BadgeCheck} tone="success" loading={isLoading} />
        <StatCard label="D4/S1" value={sarjana} icon={University} tone="warning" loading={isLoading} />
        <StatCard label="S2" value={magister} icon={Award} tone="info" />
      </div>

      <ChartCard
        title="Komposisi Ijazah Terakhir"
        columns={[
          { key: "name", label: "Ijazah Terakhir" },
          { key: "value", label: "Jumlah" },
          { key: "percentage", label: "Persentase" },
        ]}
        rows={ijazahtertinggi}
        fileName="Ijazah Terakhir Desa Jatiadi"
      >
        <BarsChartsolo data={ijazahtertinggi} xKey="name"/>
      </ChartCard>

      <ChartCard title="Tabel Ijazah Tertinggi" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Jenis Kelamin Desa Jatiadi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
        />
      </ChartCard>
    </PageShell>
  );
}
