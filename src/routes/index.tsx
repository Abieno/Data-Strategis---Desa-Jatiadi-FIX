import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Home as HomeIcon, Store, HeartHandshake, ArrowRight, MapPin } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { useRows, useRtRows, sum } from "@/lib/data";
import { allNavItems } from "@/lib/nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Data Strategis Desa Jatiadi | Desa Cantik" },
      {
        name: "description",
        content:
          "Portal satu data Desa Jatiadi: kependudukan, keluarga, pendidikan, kesehatan, UMKM, dan peta tematik RTLH dalam satu dasbor interaktif.",
      },
      { property: "og:title", content: "Portal Data Strategis Desa Jatiadi" },
      {
        property: "og:description",
        content: "Dasbor statistik desa: penduduk, keluarga, UMKM, dan peta tematik RTLH Desa Jatiadi.",
      },
    ],
  }),
  component: Beranda,
});

type Profil = {
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  luas_wilayah_ha: number | null;
  tinggi_wilayah_mdpl: number | null;
  tahun_data: number | null;
};

type Kependudukan = {
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

function Beranda() {
  const { data: profil } = useRows<Profil>("desa_profil", { limit: 1 });
  const { rows: penduduk, isLoading } = useRtRows<Kependudukan>("kependudukan_per_rt", null);
  const { rows: keluarga } = useRtRows<{ jumlah_kk: number }>("karakteristik_keluarga", null);
  const { rows: umkm } = useRtRows<{ jumlah_umkm: number }>("umkm_per_rt", null);
  const { data: rtlh } = useRows<{ id: string }>("rtlh", { select: "id" });

  const p = profil?.[0];
  const totalPenduduk = sum(penduduk, "total");
  const laki = sum(penduduk, "laki_laki");
  const perempuan = sum(penduduk, "perempuan");

  const perRt = penduduk.map((r) => ({
    name: `RT ${r.rt_label}`,
    "Laki-laki": r.laki_laki,
    Perempuan: r.perempuan,
  }));

  const agama = [
    { name: "Islam", value: sum(penduduk, "islam") },
    { name: "Protestan", value: sum(penduduk, "protestan") },
    { name: "Katolik", value: sum(penduduk, "katolik") },
    { name: "Hindu", value: sum(penduduk, "hindu") },
    { name: "Budha", value: sum(penduduk, "budha") },
    { name: "Lainnya", value: sum(penduduk, "lainnya") },
  ].filter((a) => a.value > 0);

  return (
    <PageShell
      title={`Selamat datang di Portal Data Desa ${p?.nama_desa ?? "Jatiadi"}`}
      description="Satu pintu data strategis desa — statistik sosial, ekonomi, dan spasial yang diperbarui berkala melalui sinkronisasi spreadsheet."
    >
      {p ? (
        <div className="surface-card flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <MapPin className="size-4 text-primary" aria-hidden />
            Kec. {p.kecamatan}, {p.kabupaten}, {p.provinsi}
          </span>
          <span className="text-muted-foreground">Luas wilayah: {p.luas_wilayah_ha ?? "-"} Ha</span>
          <span className="text-muted-foreground">Ketinggian: {p.tinggi_wilayah_mdpl ?? "-"} mdpl</span>
          <span className="text-muted-foreground">Tahun data: {p.tahun_data ?? "-"}</span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Penduduk" value={totalPenduduk} icon={Users} loading={isLoading} hint={`${laki} laki-laki · ${perempuan} perempuan`} />
        <StatCard label="Jumlah Keluarga" value={sum(keluarga, "jumlah_kk")} icon={HeartHandshake} tone="info" />
        <StatCard label="Jumlah UMKM" value={sum(umkm, "jumlah_umkm")} icon={Store} tone="success" />
        <StatCard label="Rumah Tidak Layak Huni" value={rtlh?.length ?? 0} icon={HomeIcon} tone="warning" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Penduduk per RT menurut Jenis Kelamin"
          description="Distribusi penduduk laki-laki dan perempuan di seluruh RT."
          metadataTable="kependudukan_per_rt"
          rows={perRt}
          columns={[
            { key: "name", label: "RT" },
            { key: "Laki-laki", label: "Laki-laki" },
            { key: "Perempuan", label: "Perempuan" },
          ]}
          fileName="Penduduk per RT"
        >
          <BarsChart
            data={perRt}
            xKey="name"
            stacked
            series={[
              { key: "Laki-laki", label: "Laki-laki", color: "var(--male)" },
              { key: "Perempuan", label: "Perempuan", color: "var(--female)" },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Komposisi Pemeluk Agama"
          description="Jumlah penduduk menurut agama yang dianut."
          rows={agama}
          columns={[
            { key: "name", label: "Agama" },
            { key: "value", label: "Jumlah" },
          ]}
          fileName="Pemeluk Agama"
        >
          <DonutChart data={agama} />
        </ChartCard>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Jelajahi Data</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allNavItems
            .filter((i) => i.url !== "/")
            .map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className="surface-card group flex items-start gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-sm font-semibold">
                    {item.title}
                    <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </PageShell>
  );
}
