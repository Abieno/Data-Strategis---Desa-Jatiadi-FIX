import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CloudLightning, Flame, Droplets, Wind } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { useRtRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/bencana")({
  head: () => ({
    meta: [
      { title: "Bencana Alam Desa Jatiadi — Kejadian per RT" },
      {
        name: "description",
        content: "Data kejadian bencana alam di Desa Jatiadi: kekeringan, kebakaran lahan, banjir, gempa, angin puyuh, longsor, dan abrasi per RT.",
      },
      { property: "og:title", content: "Bencana Alam Desa Jatiadi" },
      { property: "og:description", content: "Kejadian bencana alam menurut jenis dan RT di Desa Jatiadi." },
    ],
  }),
  component: Bencana,
});

const JENIS = [
  ["kekeringan_lahan", "Kekeringan Lahan"],
  ["kebakaran_lahan", "Kebakaran Lahan"],
  ["banjir", "Banjir"],
  ["banjir_bandang", "Banjir Bandang"],
  ["gempa", "Gempa"],
  ["angin_puyuh", "Angin Puyuh"],
  ["longsor", "Longsor"],
  ["abrasi", "Abrasi"],
] as const;

type Row = Record<(typeof JENIS)[number][0], number> & { total: number };

function Bencana() {
  const { data: years } = useYears("bencana_alam");
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years?.[0] ?? null;
  const { rows, isLoading } = useRtRows<Row>("bencana_alam", activeYear);

  const total = sum(rows, "total");
  const perJenis = JENIS.map(([k, label]) => ({ name: label, value: sum(rows, k) })).filter((d) => d.value > 0);
  const perRt = rows.map((r) => ({ name: `RT ${r.rt_label}`, Kejadian: r.total }));

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

  return (
    <PageShell
      breadcrumb="Bencana"
      title="Bencana Alam"
      description="Rekapitulasi kejadian bencana alam menurut jenis dan wilayah RT."
      actions={<YearFilter years={years ?? []} value={activeYear} onChange={setYear} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Kejadian" value={total} icon={CloudLightning} tone="warning" loading={isLoading} />
        <StatCard label="Kekeringan Lahan" value={sum(rows, "kekeringan_lahan")} icon={Droplets} tone="info" />
        <StatCard label="Kebakaran Lahan" value={sum(rows, "kebakaran_lahan")} icon={Flame} tone="destructive" />
        <StatCard label="Angin Puyuh" value={sum(rows, "angin_puyuh")} icon={Wind} tone="success" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Kejadian Bencana per RT"
          metadataTable="bencana_alam"
          rows={perRt}
          columns={[{ key: "name", label: "RT" }, { key: "Kejadian", label: "Kejadian" }]}
          fileName="Bencana per RT"
        >
          <BarsChart data={perRt} xKey="name" series={[{ key: "Kejadian", label: "Kejadian" }]} />
        </ChartCard>
        <ChartCard
          title="Komposisi Jenis Bencana"
          rows={perJenis}
          columns={[{ key: "name", label: "Jenis" }, { key: "value", label: "Kejadian" }]}
          fileName="Jenis Bencana"
        >
          <DonutChart data={perJenis} />
        </ChartCard>
      </div>

      <ChartCard title="Tabel Bencana Alam per RT" rows={tableRows} columns={columns} fileName="Bencana Alam per RT">
        <DataTable
          columns={columns}
          rows={tableRows}
          loading={isLoading}
          footerRow={{ dusun: "Total Desa", rt: "", ...Object.fromEntries(JENIS.map(([k]) => [k, sum(rows, k)])), total }}
        />
      </ChartCard>
    </PageShell>
  );
}
