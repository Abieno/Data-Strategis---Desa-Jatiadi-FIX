import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Store, Building, Home, GraduationCap } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { YearFilter } from "@/components/portal/YearFilter";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRows, useRtRows, useYears, sum } from "@/lib/data";

export const Route = createFileRoute("/umkm")({
  head: () => ({
    meta: [
      { title: "UMKM Desa Jatiadi — Sebaran & Karakteristik Pengusaha" },
      {
        name: "description",
        content: "Data UMKM Desa Jatiadi: jumlah usaha per RT, lapangan usaha menurut KBLI, karakteristik usia, dan tingkat pendidikan pengusaha.",
      },
      { property: "og:title", content: "UMKM Desa Jatiadi" },
      { property: "og:description", content: "Sebaran UMKM per RT, lapangan usaha, dan profil pengusaha di Desa Jatiadi." },
    ],
  }),
  component: Umkm,
});

type PerRt = {
  jumlah_umkm: number;
  bangunan_campuran: number;
  bangunan_khusus_usaha: number;
  di_rumah_online_keliling: number;
};
type Lapangan = { kode_kbli: string; nama_lapangan_usaha: string; jumlah_umkm: number };
type Usia = { kelompok_usia: string; laki_laki: number; perempuan: number; total: number };
type Pendidikan = { tingkat_pendidikan: string; persentase: number };

function Umkm() {
  const { data: years } = useYears("umkm_per_rt");
  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years?.[0] ?? null;

  const { rows, isLoading } = useRtRows<PerRt>("umkm_per_rt", activeYear);
  const { data: lapangan } = useRows<Lapangan>("umkm_lapangan_usaha", { year: activeYear, order: "jumlah_umkm", ascending: false });
  const { data: usia } = useRows<Usia>("umkm_karakteristik_pengusaha", { year: activeYear, order: "kelompok_usia" });
  const { data: pendidikan } = useRows<Pendidikan>("umkm_pendidikan_pengusaha", { year: activeYear, order: "persentase", ascending: false });

  const totalUmkm = sum(rows, "jumlah_umkm");
  const campuran = sum(rows, "bangunan_campuran");
  const khusus = sum(rows, "bangunan_khusus_usaha");
  const rumah = sum(rows, "di_rumah_online_keliling");

  const perRtChart = rows.map((r) => ({ name: `RT ${r.rt_label}`, UMKM: r.jumlah_umkm }));
  const perRtTable = rows.map((r) => ({
    dusun: r.dusun_label,
    rt: r.rt_label,
    jumlah_umkm: r.jumlah_umkm,
    bangunan_campuran: r.bangunan_campuran,
    bangunan_khusus_usaha: r.bangunan_khusus_usaha,
    di_rumah_online_keliling: r.di_rumah_online_keliling,
  }));
  const perRtColumns = [
    { key: "dusun", label: "Dusun" },
    { key: "rt", label: "RT" },
    { key: "jumlah_umkm", label: "Jumlah UMKM", align: "right" as const },
    { key: "bangunan_campuran", label: "Bangunan Campuran", align: "right" as const },
    { key: "bangunan_khusus_usaha", label: "Bangunan Khusus Usaha", align: "right" as const },
    { key: "di_rumah_online_keliling", label: "Di Rumah/Online/Keliling", align: "right" as const },
  ];

  const lapanganChart = (lapangan ?? []).map((r) => ({ name: `${r.kode_kbli} - ${r.nama_lapangan_usaha}`, UMKM: r.jumlah_umkm }));
  const usiaChart = (usia ?? []).map((r) => ({ name: r.kelompok_usia, "Laki-laki": r.laki_laki, Perempuan: r.perempuan }));
  const pendidikanChart = (pendidikan ?? []).map((r) => ({ name: r.tingkat_pendidikan, value: Number(r.persentase) }));

  return (
    <PageShell
      breadcrumb="UMKM"
      title="UMKM"
      description="Profil usaha mikro, kecil, dan menengah di Desa Jatiadi beserta karakteristik pengusahanya."
      actions={<YearFilter years={years ?? []} value={activeYear} onChange={setYear} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total UMKM" value={totalUmkm} icon={Store} loading={isLoading} />
        <StatCard label="Bangunan Khusus Usaha" value={khusus} icon={Building} tone="info" />
        <StatCard label="Bangunan Campuran" value={campuran} icon={Home} tone="success" />
        <StatCard label="Di Rumah / Online / Keliling" value={rumah} icon={GraduationCap} tone="warning" />
      </div>

      <Tabs defaultValue="sebaran">
        <TabsList className="flex-wrap">
          <TabsTrigger value="sebaran">Sebaran per RT</TabsTrigger>
          <TabsTrigger value="lapangan">Lapangan Usaha</TabsTrigger>
          <TabsTrigger value="pengusaha">Karakteristik Pengusaha</TabsTrigger>
        </TabsList>

        <TabsContent value="sebaran" className="mt-4 space-y-5">
          <ChartCard
            title="Jumlah UMKM per RT"
            metadataTable="umkm_per_rt"
            rows={perRtChart}
            columns={[{ key: "name", label: "RT" }, { key: "UMKM", label: "Jumlah UMKM" }]}
            fileName="UMKM per RT"
          >
            <BarsChart data={perRtChart} xKey="name" series={[{ key: "UMKM", label: "UMKM" }]} />
          </ChartCard>
          <ChartCard title="Tabel UMKM per RT" rows={perRtTable} columns={perRtColumns} fileName="Tabel UMKM per RT">
            <DataTable
              columns={perRtColumns}
              rows={perRtTable}
              loading={isLoading}
              footerRow={{
                dusun: "Total Desa",
                rt: "",
                jumlah_umkm: totalUmkm,
                bangunan_campuran: campuran,
                bangunan_khusus_usaha: khusus,
                di_rumah_online_keliling: rumah,
              }}
            />
          </ChartCard>
        </TabsContent>

        <TabsContent value="lapangan" className="mt-4 space-y-5">
          <ChartCard
            title="UMKM menurut Lapangan Usaha (KBLI)"
            metadataTable="umkm_lapangan_usaha"
            rows={lapanganChart}
            columns={[{ key: "name", label: "Lapangan Usaha" }, { key: "UMKM", label: "Jumlah UMKM" }]}
            fileName="UMKM per Lapangan Usaha"
          >
            <BarsChart
              data={lapanganChart}
              xKey="name"
              horizontal
              height={Math.max(320, lapanganChart.length * 34)}
              series={[{ key: "UMKM", label: "UMKM" }]}
            />
          </ChartCard>
          <ChartCard
            title="Tabel Lapangan Usaha"
            rows={(lapangan ?? []) as unknown as Record<string, unknown>[]}
            columns={[
              { key: "kode_kbli", label: "Kode KBLI" },
              { key: "nama_lapangan_usaha", label: "Lapangan Usaha" },
              { key: "jumlah_umkm", label: "Jumlah UMKM" },
            ]}
            fileName="Tabel Lapangan Usaha"
          >
            <DataTable
              columns={[
                { key: "kode_kbli", label: "Kode KBLI" },
                { key: "nama_lapangan_usaha", label: "Lapangan Usaha" },
                { key: "jumlah_umkm", label: "Jumlah UMKM", align: "right" },
              ]}
              rows={(lapangan ?? []) as unknown as Record<string, unknown>[]}
            />
          </ChartCard>
        </TabsContent>

        <TabsContent value="pengusaha" className="mt-4 space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <ChartCard
              title="Pengusaha menurut Kelompok Usia"
              metadataTable="umkm_karakteristik_pengusaha"
              rows={usiaChart}
              columns={[
                { key: "name", label: "Kelompok Usia" },
                { key: "Laki-laki", label: "Laki-laki" },
                { key: "Perempuan", label: "Perempuan" },
              ]}
              fileName="Pengusaha menurut Usia"
            >
              <BarsChart
                data={usiaChart}
                xKey="name"
                stacked
                series={[
                  { key: "Laki-laki", label: "Laki-laki", color: "var(--male)" },
                  { key: "Perempuan", label: "Perempuan", color: "var(--female)" },
                ]}
              />
            </ChartCard>
            <ChartCard
              title="Tingkat Pendidikan Pengusaha (%)"
              metadataTable="umkm_pendidikan_pengusaha"
              rows={pendidikanChart}
              columns={[{ key: "name", label: "Tingkat Pendidikan" }, { key: "value", label: "Persentase (%)" }]}
              fileName="Pendidikan Pengusaha"
            >
              <DonutChart data={pendidikanChart} />
            </ChartCard>
          </div>
          <ChartCard
            title="Tabel Karakteristik Pengusaha"
            rows={(usia ?? []) as unknown as Record<string, unknown>[]}
            columns={[
              { key: "kelompok_usia", label: "Kelompok Usia" },
              { key: "laki_laki", label: "Laki-laki" },
              { key: "perempuan", label: "Perempuan" },
              { key: "total", label: "Total" },
            ]}
            fileName="Tabel Karakteristik Pengusaha"
          >
            <DataTable
              columns={[
                { key: "kelompok_usia", label: "Kelompok Usia" },
                { key: "laki_laki", label: "Laki-laki", align: "right" },
                { key: "perempuan", label: "Perempuan", align: "right" },
                { key: "total", label: "Total", align: "right" },
              ]}
              rows={(usia ?? []) as unknown as Record<string, unknown>[]}
              footerRow={{
                kelompok_usia: "Total",
                laki_laki: sum(usia ?? [], "laki_laki"),
                perempuan: sum(usia ?? [], "perempuan"),
                total: sum(usia ?? [], "total"),
              }}
            />
          </ChartCard>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
