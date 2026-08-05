import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Zap, ZapOff, Plug } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { useRtRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/keluarga")({
  head: () => ({
    meta: [
      { title: "Karakteristik Keluarga Desa Jatiadi — Sumber Penerangan" },
      {
        name: "description",
        content: "Jumlah kepala keluarga per RT di Desa Jatiadi dan sumber penerangan rumah tangga: listrik PLN, non-PLN, dan bukan listrik.",
      },
      { property: "og:title", content: "Karakteristik Keluarga Desa Jatiadi" },
      { property: "og:description", content: "Jumlah KK dan sumber penerangan rumah tangga per RT." },
    ],
  }),
  component: Keluarga,
});

type Row = { jumlah_kk: number; kk_listrik_pln: number; kk_listrik_non_pln: number; kk_bukan_listrik: number };

function Keluarga() {
  const { data: years } = useYears("karakteristik_keluarga");
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years?.[0] ?? null;
  const { rows, isLoading } = useRtRows<Row>("karakteristik_keluarga", activeYear);

  const kk = sum(rows, "jumlah_kk");
  const pln = sum(rows, "kk_listrik_pln");
  const nonPln = sum(rows, "kk_listrik_non_pln");
  const bukan = sum(rows, "kk_bukan_listrik");

  const tableRows = rows.map((r) => ({
    dusun: r.dusun_label,
    rt: r.rt_label,
    jumlah_kk: r.jumlah_kk,
    kk_listrik_pln: r.kk_listrik_pln,
    kk_listrik_non_pln: r.kk_listrik_non_pln,
    kk_bukan_listrik: r.kk_bukan_listrik,
  }));

  const columns = [
    { key: "dusun", label: "Dusun" },
    { key: "rt", label: "RT" },
    { key: "jumlah_kk", label: "Jumlah KK", align: "right" as const },
    { key: "kk_listrik_pln", label: "Listrik PLN", align: "right" as const },
    { key: "kk_listrik_non_pln", label: "Listrik Non-PLN", align: "right" as const },
    { key: "kk_bukan_listrik", label: "Bukan Listrik", align: "right" as const },
  ];

  const chart = rows.map((r) => ({
    name: `RT ${r.rt_label}`,
    "PLN": r.kk_listrik_pln,
    "Non-PLN": r.kk_listrik_non_pln,
    "Bukan Listrik": r.kk_bukan_listrik,
  }));

  const donut = [
    { name: "Listrik PLN", value: pln },
    { name: "Listrik Non-PLN", value: nonPln },
    { name: "Bukan Listrik", value: bukan },
  ].filter((d) => d.value > 0);

  return (
    <PageShell
      breadcrumb="Keluarga"
      title="Karakteristik Keluarga"
      description="Jumlah kepala keluarga dan sumber penerangan rumah tangga per RT."
      actions={<YearFilter years={years ?? []} value={activeYear} onChange={setYear} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Jumlah KK" value={kk} icon={HeartHandshake} loading={isLoading} />
        <StatCard label="KK Listrik PLN" value={pln} icon={Zap} tone="success" loading={isLoading} />
        <StatCard label="KK Listrik Non-PLN" value={nonPln} icon={Plug} tone="info" loading={isLoading} />
        <StatCard label="KK Bukan Listrik" value={bukan} icon={ZapOff} tone="destructive" loading={isLoading} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Sumber Penerangan Keluarga per RT"
          metadataTable="karakteristik_keluarga"
          rows={chart}
          columns={[
            { key: "name", label: "RT" },
            { key: "PLN", label: "PLN" },
            { key: "Non-PLN", label: "Non-PLN" },
            { key: "Bukan Listrik", label: "Bukan Listrik" },
          ]}
          fileName="Sumber Penerangan per RT"
        >
          <BarsChart
            data={chart}
            xKey="name"
            stacked
            series={[
              { key: "PLN", label: "PLN" },
              { key: "Non-PLN", label: "Non-PLN" },
              { key: "Bukan Listrik", label: "Bukan Listrik" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Proporsi Sumber Penerangan" rows={donut} columns={[{ key: "name", label: "Kategori" }, { key: "value", label: "Jumlah KK" }]} fileName="Proporsi Penerangan">
          <DonutChart data={donut} />
        </ChartCard>
      </div>

      <ChartCard title="Tabel Karakteristik Keluarga" rows={tableRows} columns={columns} fileName="Karakteristik Keluarga">
        <DataTable
          columns={columns}
          rows={tableRows}
          loading={isLoading}
          footerRow={{ dusun: "Total Desa", rt: "", jumlah_kk: kk, kk_listrik_pln: pln, kk_listrik_non_pln: nonPln, kk_bukan_listrik: bukan }}
        />
      </ChartCard>
    </PageShell>
  );
}
