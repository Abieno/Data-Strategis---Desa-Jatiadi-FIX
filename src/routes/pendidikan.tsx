import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Baby,
  BookOpen,
  School,
  GraduationCap,
  University,
 } from "lucide-react"

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/pendidikan")({
  head: () => ({
    meta: [
      { title: "Pendidikan yang Diakses Desa Jatiadi - Sekolah dan Perguruan Tinggi" },
      {
        name: "description",
        content: "Pendidikan yang Diakses di Desa Jatiadi.",
      },
      { propetky: "og:title", content: "Pendidikan yang Diakses Desa Jatiadi" },
      { propetky: "og:description", content: "Rangkuman Pendidikan yang Diakses di Desa Jatiadi" },
    ],
  }),
  component: pendidikan,
});

type Row = { tk: number; ra: number; sd: number; mi: number; smp: number; mts: number; sma: number; ma: number; smk: number; apt: number };

function pendidikan() {
  const { data, isLoading } = useRows<Row>("pendidikan");
  const rows = data ?? [];

  const tk = sum(rows, "tk");
  const ra = sum(rows, "ra");
  const sd = sum(rows, "sd");
  const mi = sum(rows, "mi");
  const smp = sum(rows, "smp");
  const mts = sum(rows, "mts");
  const sma = sum(rows, "sma");
  const ma = sum(rows, "ma");
  const smk = sum(rows, "smk");
  const apt = sum(rows, "apt");
  const tkra = tk + ra;
  const sdmi = sd + mi;
  const smpmts = smp + mts;
  const smamasmk = sma + ma + smk;
  const total = tk + ra + sd + mi + smp + mts + sma + ma + smk + apt;
  const pendidikan = [
    {
      name: "TK/Sederajat",
      value: tkra,
      percentage: ((tkra / total) * 100).toFixed(1),
    },
    {
      name: "SD/Sederajat",
      value: sdmi,
      percentage: ((sdmi / total) * 100).toFixed(1),
    },
    {
      name: "SMP/Sederajat",
      value: smpmts,
      percentage: ((smpmts / total) * 100).toFixed(1),
    },
    {
      name: "SMA/Sederajat",
      value: smamasmk,
      percentage: ((smamasmk / total) * 100).toFixed(1),
    },
    {
      name: "Akademi/Perguruan Tinggi",
      value: apt,
      percentage: ((apt / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "tk", label: "TK" , align: "center" as const},
    { key: "ra", label: "RA", align: "center" as const },
    { key: "sd", label: "SD", align: "center" as const },
    { key: "mi", label: "MI", align: "center" as const },
    { key: "smp", label: "SMP", align: "center" as const },
    { key: "mts", label: "MTS", align: "center" as const },
    { key: "sma", label: "SMA", align: "center" as const },
    { key: "ma", label: "MA", align: "center" as const },
    { key: "smk", label: "SMK", align: "center" as const },
    { key: "apt", label: "Akademi/Perguruan Tinggi", align: "center" as const },
  ];

  return (
    <PageShell
      breadcrumb="Pendidikan yang Diakses"
      title="Pendidikan yang Diakses"
      description="Rekapan Pendidikan yang Diakses di Desa Jatiadi"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <StatCard label="RA/Sederajat" value={tkra} icon={Baby} tone="info" loading={isLoading} />
        <StatCard label="SD/Sederajat" value={sdmi} icon={BookOpen} tone="success" loading={isLoading} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="SMP/Sederajat" value={smpmts} icon={School} tone="warning" loading={isLoading} />
        <StatCard label="SMA/Sederajat" value={smamasmk} icon={GraduationCap} tone="info" loading={isLoading} />
        <StatCard label="Akademi/Perguruan Tinggi" value={apt} icon={University} tone="success"  />
      </div>

       <ChartCard
        title="Komposisi Pendidikan yang Diakses"
        columns={[
          { key: "name", label: "Pendidikan yang Diakses" },
          { key: "value", label: "Jumlah" },
          { key: "percentage", label: "Persentase" },
        ]}
        rows={pendidikan}
        fileName="Pendidikan yang Diakses Desa Jatiadi"
      >
        <DonutChart data={pendidikan} />
      </ChartCard>

      <ChartCard title="Tabel Atap Bangunan" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Atap Bangunan Desa Jatiadi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
        />
      </ChartCard>
    </PageShell>
  );
}
