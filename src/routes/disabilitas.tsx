import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Accessibility, Eye, Ear, PersonStanding } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart } from "@/components/portal/charts";
import { useRtRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/disabilitas")({
  head: () => ({
    meta: [
      { title: "Penduduk Disabilitas Desa Jatiadi — Data per RT" },
      {
        name: "description",
        content: "Data penyandang disabilitas Desa Jatiadi menurut jenis: tuna netra, rungu, wicara, daksa, grahita, laras, dan ganda per RT.",
      },
      { property: "og:title", content: "Penduduk Disabilitas Desa Jatiadi" },
      { property: "og:description", content: "Jumlah penyandang disabilitas menurut jenis dan RT." },
    ],
  }),
  component: Disabilitas,
});

const JENIS = [
  ["tuna_netra", "Tuna Netra"],
  ["tuna_rungu", "Tuna Rungu"],
  ["tuna_wicara", "Tuna Wicara"],
  ["tuna_rungu_wicara", "Tuna Rungu-Wicara"],
  ["tuna_daksa", "Tuna Daksa"],
  ["tuna_grahita", "Tuna Grahita"],
  ["tuna_laras", "Tuna Laras"],
  ["tuna_ganda", "Tuna Ganda"],
  ["tuna_eks_sakit_kusta", "Eks Sakit Kusta"],
] as const;

type Row = Record<(typeof JENIS)[number][0], number> & { total: number };

function Disabilitas() {
  const { data: years } = useYears("penduduk_disabilitas");
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years?.[0] ?? null;
  const { rows, isLoading } = useRtRows<Row>("penduduk_disabilitas", activeYear);

  const total = sum(rows, "total");
  const perJenis = JENIS.map(([key, label]) => ({ name: label, Jumlah: sum(rows, key) })).filter((d) => d.Jumlah > 0);

  const columns = [
    { key: "dusun", label: "Dusun" },
    { key: "rt", label: "RT" },
    ...JENIS.map(([key, label]) => ({ key, label, align: "right" as const })),
    { key: "total", label: "Total", align: "right" as const },
  ];

  const tableRows = rows.map((r) => ({
    dusun: r.dusun_label,
    rt: r.rt_label,
    ...Object.fromEntries(JENIS.map(([k]) => [k, r[k]])),
    total: r.total,
  }));

  const perRt = rows.map((r) => ({ name: `RT ${r.rt_label}`, Jumlah: r.total }));

  return (
    <PageShell
      breadcrumb="Disabilitas"
      title="Penduduk Disabilitas"
      description="Jumlah penyandang disabilitas menurut jenis dan sebarannya per RT."
      actions={<YearFilter years={years ?? []} value={activeYear} onChange={setYear} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Penyandang Disabilitas" value={total} icon={Accessibility} loading={isLoading} />
        <StatCard label="Tuna Netra" value={sum(rows, "tuna_netra")} icon={Eye} tone="info" />
        <StatCard label="Tuna Rungu" value={sum(rows, "tuna_rungu")} icon={Ear} tone="warning" />
        <StatCard label="Tuna Daksa" value={sum(rows, "tuna_daksa")} icon={PersonStanding} tone="success" />
      </div>

      <ChartCard
        title="Disabilitas menurut Jenis"
        metadataTable="penduduk_disabilitas"
        rows={perJenis}
        columns={[{ key: "name", label: "Jenis" }, { key: "Jumlah", label: "Jumlah" }]}
        fileName="Disabilitas menurut Jenis"
      >
        <BarsChart data={perJenis} xKey="name" horizontal height={360} series={[{ key: "Jumlah", label: "Jumlah" }]} />
      </ChartCard>

      <ChartCard
        title="Sebaran Disabilitas per RT"
        rows={perRt}
        columns={[{ key: "name", label: "RT" }, { key: "Jumlah", label: "Jumlah" }]}
        fileName="Disabilitas per RT"
      >
        <BarsChart data={perRt} xKey="name" series={[{ key: "Jumlah", label: "Jumlah" }]} />
      </ChartCard>

      <ChartCard title="Tabel Disabilitas per RT" rows={tableRows} columns={columns} fileName="Disabilitas per RT">
        <DataTable
          columns={columns}
          rows={tableRows}
          loading={isLoading}
          footerRow={{
            dusun: "Total Desa",
            rt: "",
            ...Object.fromEntries(JENIS.map(([k]) => [k, sum(rows, k)])),
            total,
          }}
        />
      </ChartCard>
    </PageShell>
  );
}
