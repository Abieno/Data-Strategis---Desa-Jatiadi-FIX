import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Stethoscope, Hospital, Syringe, UserPlus } from "lucide-react";

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
      { title: "Kesehatan Desa Jatiadi — Fasilitas & Tenaga Kesehatan" },
      {
        name: "description",
        content: "Data kesehatan Desa Jatiadi: jumlah fasilitas kesehatan seperti posyandu dan poskesdes serta tenaga kesehatan yang tersedia.",
      },
      { property: "og:title", content: "Kesehatan Desa Jatiadi" },
      { property: "og:description", content: "Fasilitas dan tenaga kesehatan yang tersedia di Desa Jatiadi." },
    ],
  }),
  component: Kesehatan,
});

type Fasilitas = { jenis_fasilitas: string; jumlah: number };
type Tenaga = { jenis_tenaga: string; jumlah: number };

function Kesehatan() {
  const { data: years } = useYears("kesehatan_fasilitas");
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years?.[0] ?? null;
  const { data: fasilitas, isLoading } = useRows<Fasilitas>("kesehatan_fasilitas", { year: activeYear, order: "jenis_fasilitas" });
  const { data: tenaga } = useRows<Tenaga>("kesehatan_tenaga", { year: activeYear, order: "jenis_tenaga" });

  const fRows = fasilitas ?? [];
  const tRows = tenaga ?? [];
  const totalF = sum(fRows, "jumlah");
  const totalT = sum(tRows, "jumlah");

  const fChart = fRows.map((r) => ({ name: r.jenis_fasilitas, Jumlah: r.jumlah }));
  const tChart = tRows.map((r) => ({ name: r.jenis_tenaga, value: r.jumlah })).filter((r) => r.value > 0);

  return (
    <PageShell
      breadcrumb="Kesehatan"
      title="Kesehatan"
      description="Ketersediaan fasilitas dan tenaga kesehatan di Desa Jatiadi."
      actions={<YearFilter years={years ?? []} value={activeYear} onChange={setYear} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Fasilitas Kesehatan" value={totalF} icon={Hospital} loading={isLoading} />
        <StatCard label="Total Tenaga Kesehatan" value={totalT} icon={Stethoscope} tone="info" />
        <StatCard label="Jenis Fasilitas" value={fRows.length} icon={Syringe} tone="success" />
        <StatCard label="Jenis Tenaga" value={tRows.length} icon={UserPlus} tone="warning" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Fasilitas Kesehatan"
          metadataTable="kesehatan_fasilitas"
          rows={fChart}
          columns={[{ key: "name", label: "Jenis Fasilitas" }, { key: "Jumlah", label: "Jumlah" }]}
          fileName="Fasilitas Kesehatan"
        >
          <BarsChart data={fChart} xKey="name" horizontal height={340} series={[{ key: "Jumlah", label: "Jumlah" }]} />
        </ChartCard>

        <ChartCard
          title="Tenaga Kesehatan"
          metadataTable="kesehatan_tenaga"
          rows={tChart}
          columns={[{ key: "name", label: "Jenis Tenaga" }, { key: "value", label: "Jumlah" }]}
          fileName="Tenaga Kesehatan"
        >
          <DonutChart data={tChart} height={340} />
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard
          title="Tabel Fasilitas Kesehatan"
          rows={fRows as unknown as Record<string, unknown>[]}
          columns={[{ key: "jenis_fasilitas", label: "Jenis Fasilitas" }, { key: "jumlah", label: "Jumlah" }]}
          fileName="Tabel Fasilitas Kesehatan"
        >
          <DataTable
            columns={[
              { key: "jenis_fasilitas", label: "Jenis Fasilitas" },
              { key: "jumlah", label: "Jumlah", align: "right" },
            ]}
            rows={fRows as unknown as Record<string, unknown>[]}
            loading={isLoading}
            footerRow={{ jenis_fasilitas: "Total", jumlah: totalF }}
          />
        </ChartCard>

        <ChartCard
          title="Tabel Tenaga Kesehatan"
          rows={tRows as unknown as Record<string, unknown>[]}
          columns={[{ key: "jenis_tenaga", label: "Jenis Tenaga" }, { key: "jumlah", label: "Jumlah" }]}
          fileName="Tabel Tenaga Kesehatan"
        >
          <DataTable
            columns={[
              { key: "jenis_tenaga", label: "Jenis Tenaga" },
              { key: "jumlah", label: "Jumlah", align: "right" },
            ]}
            rows={tRows as unknown as Record<string, unknown>[]}
            footerRow={{ jenis_tenaga: "Total", jumlah: totalT }}
          />
        </ChartCard>
      </div>
    </PageShell>
  );
}
