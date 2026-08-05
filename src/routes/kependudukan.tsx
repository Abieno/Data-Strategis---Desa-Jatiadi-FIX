import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, User, UserRound, Percent } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { useRtRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/kependudukan")({
  head: () => ({
    meta: [
      { title: "Kependudukan Desa Jatiadi — Jumlah Penduduk per RT" },
      {
        name: "description",
        content: "Statistik kependudukan Desa Jatiadi: jumlah penduduk laki-laki dan perempuan serta komposisi agama per RT.",
      },
      { property: "og:title", content: "Kependudukan Desa Jatiadi" },
      { property: "og:description", content: "Jumlah penduduk dan komposisi agama per RT di Desa Jatiadi." },
    ],
  }),
  component: Kependudukan,
});

type Row = {
  laki_laki: number;
  perempuan: number;
  total: number;
  islam: number;
  protestan: number;
  katolik: number;
  hindu: number;
  budha: number;
  lainnya: number;
};

function Kependudukan() {
  const { data: years } = useYears("kependudukan_per_rt");
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years?.[0] ?? null;
  const { rows, isLoading } = useRtRows<Row>("kependudukan_per_rt", activeYear);

  const laki = sum(rows, "laki_laki");
  const perempuan = sum(rows, "perempuan");
  const total = sum(rows, "total");
  const rasio = perempuan ? (laki / perempuan) * 100 : 0;

  const tableRows = rows.map((r) => ({
    dusun: r.dusun_label,
    rt: r.rt_label,
    laki_laki: r.laki_laki,
    perempuan: r.perempuan,
    total: r.total,
    islam: r.islam,
    lainnya: r.protestan + r.katolik + r.hindu + r.budha + r.lainnya,
  }));

  const chart = rows.map((r) => ({ name: `RT ${r.rt_label}`, "Laki-laki": r.laki_laki, Perempuan: r.perempuan }));
  const agama = [
    { name: "Islam", value: sum(rows, "islam") },
    { name: "Protestan", value: sum(rows, "protestan") },
    { name: "Katolik", value: sum(rows, "katolik") },
    { name: "Hindu", value: sum(rows, "hindu") },
    { name: "Budha", value: sum(rows, "budha") },
    { name: "Lainnya", value: sum(rows, "lainnya") },
  ].filter((a) => a.value > 0);

  const columns = [
    { key: "dusun", label: "Dusun" },
    { key: "rt", label: "RT" },
    { key: "laki_laki", label: "Laki-laki", align: "right" as const },
    { key: "perempuan", label: "Perempuan", align: "right" as const },
    { key: "total", label: "Total", align: "right" as const },
    { key: "islam", label: "Islam", align: "right" as const },
    { key: "lainnya", label: "Agama Lain", align: "right" as const },
  ];

  return (
    <PageShell
      breadcrumb="Kependudukan"
      title="Kependudukan"
      description="Jumlah penduduk menurut jenis kelamin dan agama di setiap RT."
      actions={<YearFilter years={years ?? []} value={activeYear} onChange={setYear} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Penduduk" value={total} icon={Users} loading={isLoading} />
        <StatCard label="Laki-laki" value={laki} icon={User} tone="info" loading={isLoading} />
        <StatCard label="Perempuan" value={perempuan} icon={UserRound} tone="female" loading={isLoading} />
        <StatCard label="Rasio Jenis Kelamin" value={Math.round(rasio)} icon={Percent} tone="success" hint="Laki-laki per 100 perempuan" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Penduduk per RT"
          metadataTable="kependudukan_per_rt"
          rows={chart}
          columns={[
            { key: "name", label: "RT" },
            { key: "Laki-laki", label: "Laki-laki" },
            { key: "Perempuan", label: "Perempuan" },
          ]}
          fileName="Penduduk per RT"
        >
          <BarsChart
            data={chart}
            xKey="name"
            series={[
              { key: "Laki-laki", label: "Laki-laki", color: "var(--male)" },
              { key: "Perempuan", label: "Perempuan", color: "var(--female)" },
            ]}
          />
        </ChartCard>
        <ChartCard title="Penduduk menurut Agama" rows={agama} columns={[{ key: "name", label: "Agama" }, { key: "value", label: "Jumlah" }]} fileName="Penduduk menurut Agama">
          <DonutChart data={agama} />
        </ChartCard>
      </div>

      <ChartCard title="Tabel Kependudukan per RT" rows={tableRows} columns={columns} fileName="Kependudukan per RT">
        <DataTable
          columns={columns}
          rows={tableRows}
          loading={isLoading}
          footerRow={{
            dusun: "Total Desa",
            rt: "",
            laki_laki: laki,
            perempuan: perempuan,
            total,
            islam: sum(rows, "islam"),
            lainnya: total - sum(rows, "islam"),
          }}
        />
      </ChartCard>
    </PageShell>
  );
}
