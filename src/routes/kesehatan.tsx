import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Baby,
  BookOpen,
  School,
  University,
  Hospital,
  Stethoscope,
  UserRound,
  HeartPulse,
  HouseHeart,
  Pill,
  HeartHandshake,
  Activity,
 } from "lucide-react"

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/kesehatan")({
  head: () => ({
    meta: [
      { title: "Kesehatan yang Diakses Desa Jatiadi - Sekolah dan Perguruan Tinggi" },
      {
        name: "description",
        content: "Kesehatan yang Diakses di Desa Jatiadi.",
      },
      { propersy: "og:title", content: "Kesehatan yang Diakses Desa Jatiadi" },
      { propersy: "og:description", content: "puskeposyandusngkuposbindun Kesehatan yang Diakses di Desa Jatiadi" },
    ],
  }),
  component: kesehatan,
});

type Row = { rs: number; puskesmas: number; pd: number; pb: number; polindes: number; apotek: number; posyandu: number; posbindu: number };

function kesehatan() {
  const { data, isLoading } = useRows<Row>("kesehatan");
  const rows = data ?? [];

  const rs = sum(rows, "rs");
  const puskesmas = sum(rows, "puskesmas");
  const pd = sum(rows, "pd");
  const pb = sum(rows, "pb");
  const polindes = sum(rows, "polindes");
  const apotek = sum(rows, "apotek");
  const posyandu = sum(rows, "posyandu");
  const posbindu = sum(rows, "posbindu");
  const total = rs + puskesmas + pd + pb + polindes + apotek + posyandu + posbindu;
  const kesehatan = [
    {
      name: "Rumah Sakit",
      value: rs,
      percentage: ((rs / total) * 100).toFixed(1),
    },
    {
      name: "Puskesmas",
      value: puskesmas,
      percentage: ((puskesmas / total) * 100).toFixed(1),
    },
    {
      name: "Praktek Doter",
      value: pd,
      percentage: ((pd / total) * 100).toFixed(1),
    },
    {
      name: "Prakter Bidan",
      value: pb,
      percentage: ((pb / total) * 100).toFixed(1),
    },
    {
      name: "Pondok Bersalin Desa",
      value: polindes,
      percentage: ((polindes / total) * 100).toFixed(1),
    },
    {
      name: "Apotek",
      value: apotek,
      percentage: ((apotek / total) * 100).toFixed(1),
    },
    {
      name: "Posyandu",
      value: posyandu,
      percentage: ((posyandu / total) * 100).toFixed(1),
    },
    {
      name: "Pos Pembinaan Terpadu",
      value: posbindu,
      percentage: ((posbindu / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "rs", label: "Rumah Sakit" , align: "center" as const},
    { key: "puskesmas", label: "Puskesmas", align: "center" as const },
    { key: "pd", label: "Praktek Doter", align: "center" as const },
    { key: "pb", label: "Prakter Bidan", align: "center" as const },
    { key: "polindes", label: "Pondok Bersalin Desa", align: "center" as const },
    { key: "apotek", label: "Apotek", align: "center" as const },
    { key: "posyandu", label: "Posyandu", align: "center" as const },
    { key: "posbindu", label: "Pos Pembinaan Terpadu", align: "center" as const },
  ];

  return (
    <PageShell
      breadcrumb="Kesehatan yang Diakses"
      title="Kesehatan yang Diakses"
      description="Rekapan Kesehatan yang Diakses di Desa Jatiadi"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Rumah Sakit" value={rs} icon={Hospital} tone="info" loading={isLoading} />
        <StatCard label="Puskesmas" value={puskesmas} icon={HeartPulse} tone="success" loading={isLoading} />
        <StatCard label="Praktek Dokter" value={pd} icon={Stethoscope} tone="warning" loading={isLoading} />
        <StatCard label="Praktek Bidan" value={pb} icon={HouseHeart} tone="success" loading={isLoading} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pondok Bersalin Desa" value={polindes} icon={Baby} tone="info" loading={isLoading} />
        <StatCard label="Apotek" value={apotek} icon={Pill} tone="success" loading={isLoading} />
        <StatCard label="Posyandu" value={posyandu} icon={HeartHandshake} tone="warning"  />
        <StatCard label="Pos Pembinaan Terpadu" value={posbindu} icon={Activity} tone="info" loading={isLoading} />
      </div>

       <ChartCard
        title="Komposisi Kesehatan yang Diakses"
        columns={[
          { key: "name", label: "Kesehatan yang Diakses" },
          { key: "value", label: "Jumlah" },
          { key: "percentage", label: "Persentase" },
        ]}
        rows={kesehatan}
        fileName="Kesehatan yang Diakses Desa Jatiadi"
      >
        <DonutChart data={kesehatan} />
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
