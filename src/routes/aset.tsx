import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bike,
  Car,
  Laptop,
  Beef,
  Merge,
  ChessKnight,
  Badge,
  MonitorSmartphone,
} from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { DonutChart } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/aset")({
  head: () => ({
    meta: [
      { title: "Aset yang Dimiliki — Belum Punya Ijazah sampai S2" },
      {
        name: "description",
        content: "Aset yang Dimiliki di Desa Jatiadi.",
      },
      { property: "og:title", content: "Aset yang Dimiliki Desa Jatiadi" },
      { property: "og:description", content: "Rangkuman Aset yang Dimiliki di Desa Jatiadi" },
    ],
  }),
  component: aset,
});

type Row = { mobil: number; motor: number; klt: number; ternaksapi: number; ternakkerbau: number; ternakkambing: number; ternakkuda: number };

function aset() {
  const { data, isLoading } = useRows<Row>("aset");
  const rows = data ?? [];

  const mobil = sum(rows, "mobil");
  const motor = sum(rows, "motor");
  const klt = sum(rows, "klt");
  const ternaksapi = sum(rows, "ternaksapi");
  const ternakkerbau = sum(rows, "ternakkerbau");
  const ternakkambing = sum(rows, "ternakkambing");
  const ternakkuda = sum(rows, "ternakkuda");
  const total = mobil + motor + klt + ternaksapi + ternakkerbau + ternakkambing + ternakkuda;
  const aset = [
    {
      name: "Jumlah Keluarga yang Mempunyai Sepeda Motor",
      value: motor,
      percentage: ((motor / total) * 100).toFixed(1),
    },
    {
      name: "Jumlah Keluarga yang Mempunyai Mobil",
      value: mobil,
      percentage: ((mobil / total) * 100).toFixed(1),
    },
    {
      name: "Jumlah Keluarga yang Mempunyai Komputer/Laptop/Tablet",
      value: klt,
      percentage: ((klt / total) * 100).toFixed(1),
    },
    {
      name: "Jumlah Keluarga yang Mempunyai Ternak Sapi",
      value: ternaksapi,
      percentage: ((ternaksapi / total) * 100).toFixed(1),
    },
    {
      name: "Jumlah Keluarga yang Mempunyai Ternak Kerbau",
      value: ternakkerbau,
      percentage: ((ternakkerbau / total) * 100).toFixed(1),
    },
    {
      name: "Jumlah Keluarga yang Mempunyai Ternak Kambing",
      value: ternakkambing,
      percentage: ((ternakkambing / total) * 100).toFixed(1),
    },
    {
      name: "Jumlah Keluarga yang Mempunyai Ternak Kuda",
      value: ternakkuda,
      percentage: ((ternakkuda / total) * 100).toFixed(1),
    },
  ];

  const columns = [
    { key: "motor", label: "Jumlah Keluarga yang Mempunyai Sepeda Motor" , align: "center" as const},
    { key: "mobil", label: "Jumlah Keluarga yang Mempunyai Mobil", align: "center" as const },
    { key: "klt", label: "Jumlah Keluarga yang Mempunyai Komputer/Laptop/Tablet" , align: "center" as const},
    { key: "ternaksapi", label: "Jumlah Keluarga yang Mempunyai Ternak Sapi" , align: "center" as const},
    { key: "ternakkerbau", label: "Jumlah Keluarga yang Mempunyai Ternak Kerbau" , align: "center" as const},
    { key: "ternakkambing", label: "Jumlah Keluarga yang Mempunyai Ternak Kambing" , align: "center" as const},
    { key: "ternakkuda", label: "Jumlah Keluarga yang Mempunyai Ternak Kuda" , align: "center" as const},
  ];

  return (
    <PageShell
      breadcrumb="Aset yang Dimiliki"
      title="Aset yang Dimiliki"
      description="Rekapan Aset yang Dimiliki di Desa Jatiadi"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Memiliki Sepeda Motor" value={motor} icon={Bike} tone="info" loading={isLoading} />
        <StatCard label="Memiliki Mobil" value={mobil} icon={Car} tone="success" loading={isLoading} />
        <StatCard label="Memiliki Komputer/Laptop/Tablet" value={klt} icon={Laptop} tone="warning" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Memiliki Sapi" value={ternaksapi} icon={Beef} tone="info" />
        <StatCard label="Memiliki Kerbau" value={ternakkerbau} icon={Merge} tone="success" loading={isLoading} />
        <StatCard label="Memiliki Kambing" value={ternakkambing} icon={Badge} tone="warning" loading={isLoading} />
        <StatCard label="Memiliki Kuda" value={ternakkuda} icon={ChessKnight} tone="info" />
      </div>

      <ChartCard
        title="Komposisi Aset yang Dimiliki"
        columns={[
          { key: "name", label: "Aset yang Dimiliki" },
          { key: "value", label: "Jumlah" },
          { key: "percentage", label: "Persentase" },
        ]}
        rows={aset}
        fileName="Jenis Kelamin Desa Jatiadi"
      >
        <DonutChart data={aset} />
      </ChartCard>

      <ChartCard title="Tabel Aset yang Dimiliki" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Jenis Kelamin Desa Jatiadi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
        />
      </ChartCard>
    </PageShell>
  );
}
