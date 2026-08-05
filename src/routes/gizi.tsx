import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Baby, AlertTriangle, TrendingDown, Activity } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { useRtRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/gizi")({
  head: () => ({
    meta: [
      { title: "Gizi Balita Desa Jatiadi — Status Gizi per RT" },
      {
        name: "description",
        content: "Data status gizi balita Desa Jatiadi: berat badan di bawah garis merah, berat badan kurang, dan gizi buruk per RT.",
      },
      { property: "og:title", content: "Gizi Balita Desa Jatiadi" },
      { property: "og:description", content: "Status gizi balita menurut RT di Desa Jatiadi." },
    ],
  }),
  component: Gizi,
});

type Row = { bb_bawah_garis_merah: number; bb_kurang: number; gizi_buruk: number; total: number };

function Gizi() {
  const { data: years } = useYears("gizi_balita");
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years?.[0] ?? null;
  const { rows, isLoading } = useRtRows<Row>("gizi_balita", activeYear);

  const bgm = sum(rows, "bb_bawah_garis_merah");
  const kurang = sum(rows, "bb_kurang");
  const buruk = sum(rows, "gizi_buruk");
  const total = sum(rows, "total");

  const chart = rows.map((r) => ({
    name: `RT ${r.rt_label}`,
    "BGM": r.bb_bawah_garis_merah,
    "BB Kurang": r.bb_kurang,
    "Gizi Buruk": r.gizi_buruk,
  }));
  const donut = [
    { name: "BB Bawah Garis Merah", value: bgm },
    { name: "BB Kurang", value: kurang },
    { name: "Gizi Buruk", value: buruk },
  ].filter((d) => d.value > 0);

  const columns = [
    { key: "dusun", label: "Dusun" },
    { key: "rt", label: "RT" },
    { key: "bb_bawah_garis_merah", label: "BB Bawah Garis Merah", align: "right" as const },
    { key: "bb_kurang", label: "BB Kurang", align: "right" as const },
    { key: "gizi_buruk", label: "Gizi Buruk", align: "right" as const },
    { key: "total", label: "Total", align: "right" as const },
  ];
  const tableRows = rows.map((r) => ({
    dusun: r.dusun_label,
    rt: r.rt_label,
    bb_bawah_garis_merah: r.bb_bawah_garis_merah,
    bb_kurang: r.bb_kurang,
    gizi_buruk: r.gizi_buruk,
    total: r.total,
  }));

  return (
    <PageShell
      breadcrumb="Gizi"
      title="Gizi Balita"
      description="Kondisi status gizi balita di setiap RT sebagai dasar intervensi kesehatan desa."
      actions={<YearFilter years={years ?? []} value={activeYear} onChange={setYear} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Balita Bermasalah Gizi" value={total} icon={Baby} loading={isLoading} />
        <StatCard label="BB Bawah Garis Merah" value={bgm} icon={TrendingDown} tone="warning" />
        <StatCard label="BB Kurang" value={kurang} icon={Activity} tone="info" />
        <StatCard label="Gizi Buruk" value={buruk} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Status Gizi Balita per RT"
          metadataTable="gizi_balita"
          rows={chart}
          columns={[
            { key: "name", label: "RT" },
            { key: "BGM", label: "BGM" },
            { key: "BB Kurang", label: "BB Kurang" },
            { key: "Gizi Buruk", label: "Gizi Buruk" },
          ]}
          fileName="Gizi Balita per RT"
        >
          <BarsChart
            data={chart}
            xKey="name"
            stacked
            series={[
              { key: "BGM", label: "BGM" },
              { key: "BB Kurang", label: "BB Kurang" },
              { key: "Gizi Buruk", label: "Gizi Buruk" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Proporsi Status Gizi" rows={donut} columns={[{ key: "name", label: "Status" }, { key: "value", label: "Jumlah" }]} fileName="Proporsi Gizi">
          <DonutChart data={donut} />
        </ChartCard>
      </div>

      <ChartCard title="Tabel Gizi Balita per RT" rows={tableRows} columns={columns} fileName="Gizi Balita per RT">
        <DataTable
          columns={columns}
          rows={tableRows}
          loading={isLoading}
          footerRow={{ dusun: "Total Desa", rt: "", bb_bawah_garis_merah: bgm, bb_kurang: kurang, gizi_buruk: buruk, total }}
        />
      </ChartCard>
    </PageShell>
  );
}
