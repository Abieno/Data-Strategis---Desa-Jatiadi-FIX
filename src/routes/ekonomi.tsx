import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Layers, ShoppingBag, Landmark } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { useRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/ekonomi")({
  head: () => ({
    meta: [
      { title: "Ekonomi Desa Jatiadi — Fasilitas Ekonomi Desa" },
      {
        name: "description",
        content: "Data fasilitas ekonomi Desa Jatiadi menurut kategori: perdagangan, jasa, lembaga keuangan, dan sarana penunjang usaha.",
      },
      { property: "og:title", content: "Ekonomi Desa Jatiadi" },
      { property: "og:description", content: "Fasilitas ekonomi desa menurut kategori dan sub kategori." },
    ],
  }),
  component: Ekonomi,
});

type Row = { kategori: string; sub_kategori: string | null; jumlah: number };

function Ekonomi() {
  const { data: years } = useYears("ekonomi_fasilitas");
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years?.[0] ?? null;
  const { data, isLoading } = useRows<Row>("ekonomi_fasilitas", { year: activeYear, order: "kategori" });
  const rows = data ?? [];

  const total = sum(rows, "jumlah");
  const byKategori = Object.values(
    rows.reduce<Record<string, { name: string; value: number }>>((acc, r) => {
      acc[r.kategori] ??= { name: r.kategori, value: 0 };
      acc[r.kategori]!.value += r.jumlah;
      return acc;
    }, {}),
  );
  const detail = rows.map((r) => ({ name: r.sub_kategori ?? r.kategori, Jumlah: r.jumlah }));

  const columns = [
    { key: "kategori", label: "Kategori" },
    { key: "sub_kategori", label: "Sub Kategori" },
    { key: "jumlah", label: "Jumlah", align: "right" as const },
  ];

  return (
    <PageShell
      breadcrumb="Ekonomi"
      title="Fasilitas Ekonomi"
      description="Ketersediaan sarana dan fasilitas ekonomi yang menopang aktivitas usaha di desa."
      actions={<YearFilter years={years ?? []} value={activeYear} onChange={setYear} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Fasilitas Ekonomi" value={total} icon={Building2} loading={isLoading} />
        <StatCard label="Kategori Fasilitas" value={byKategori.length} icon={Layers} tone="info" />
        <StatCard label="Jenis Sub Kategori" value={rows.length} icon={ShoppingBag} tone="success" />
        <StatCard
          label="Kategori Terbanyak"
          value={Math.max(0, ...byKategori.map((k) => k.value))}
          icon={Landmark}
          tone="warning"
          hint={byKategori.slice().sort((a, b) => b.value - a.value)[0]?.name ?? "-"}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Fasilitas Ekonomi menurut Sub Kategori"
          metadataTable="ekonomi_fasilitas"
          rows={detail}
          columns={[{ key: "name", label: "Sub Kategori" }, { key: "Jumlah", label: "Jumlah" }]}
          fileName="Fasilitas Ekonomi"
        >
          <BarsChart data={detail} xKey="name" horizontal height={Math.max(320, detail.length * 32)} series={[{ key: "Jumlah", label: "Jumlah" }]} />
        </ChartCard>
        <ChartCard
          title="Proporsi per Kategori"
          rows={byKategori}
          columns={[{ key: "name", label: "Kategori" }, { key: "value", label: "Jumlah" }]}
          fileName="Kategori Ekonomi"
        >
          <DonutChart data={byKategori} />
        </ChartCard>
      </div>

      <ChartCard title="Tabel Fasilitas Ekonomi" rows={rows as unknown as Record<string, unknown>[]} columns={columns} fileName="Tabel Fasilitas Ekonomi">
        <DataTable
          columns={columns}
          rows={rows as unknown as Record<string, unknown>[]}
          loading={isLoading}
          footerRow={{ kategori: "Total", sub_kategori: "", jumlah: total }}
        />
      </ChartCard>
    </PageShell>
  );
}
