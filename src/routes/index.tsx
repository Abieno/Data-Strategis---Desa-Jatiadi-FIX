import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Home as HomeIcon,
  Store,
  HeartHandshake,
  ArrowRight,
  MapPin,
} from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { BarsChart, DonutChart } from "@/components/portal/charts";
import { useRows, sum } from "@/lib/data";
import { allNavItems } from "@/lib/nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sistem Informasi Data Strategis - Desa Jatiadi" },
      {
        name: "description",
        content:
          "Sistem Informasi yang berisi data-data Desa Jatiadi: kependudukan, tempat tinggal, fasilitas sosial, peta, dan lain-lain.",
      },
      { property: "og:title", content: "Sistem Informasi Data Strategis - Desa Jatiadi" },
      {
        property: "og:description",
        content: "Sistem Informasi yang berisi data-data Desa Jatiadi: kependudukan, tempat tinggal, fasilitas sosial, peta, dan lain-lain.",
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

type AtapRow = {
  rt: string;
  genteng: number;
  seng: number;
  asbes: number;
};

type JenisKelaminRow = {
  lakilaki: number;
  perempuan: number;
};

function Beranda() {
    const { data: profil } = useRows("desa_profil", { limit: 1 });
    
    const {
      data: atapData,
      isLoading: isLoadingAtap,
    } = useRows<AtapRow>("atap");

    const {
      data: jenisKelaminData,
      isLoading: isLoadingJenisKelamin,
    } = useRows<JenisKelaminRow>("jeniskelamin");

    const atapRows = atapData ?? [];
    const jenisKelaminRows = jenisKelaminData ?? [];

    const p = profil?.[0];

    // ==========================================
    // DATA ATAP
    // ==========================================

    const genteng = sum(atapRows, "genteng");
    const seng = sum(atapRows, "seng");
    const asbes = sum(atapRows, "asbes");

    // Total rumah = seluruh jenis atap
    const totalRumah = genteng + seng + asbes ;

    // Jumlah RT = jumlah baris RT pada tabel atap
    const totalRT = atapRows.length;

    // ==========================================
    // DATA JENIS KELAMIN
    // ==========================================

    const laki = sum(jenisKelaminRows, "lakilaki");
    const perempuan = sum(jenisKelaminRows, "perempuan");

    // Total penduduk
    const totalPenduduk = laki + perempuan;

    // ==========================================
    // DATA GRAFIK
    // ==========================================

    const perRt = atapRows.map((r) => ({
      name: `RT ${r.rt}`,
      Genteng: r.genteng,
      Seng: r.seng,
      Asbes: r.asbes,
    }));

    const agama: { name: string; value: number }[] = [];

    return (
    <PageShell
      title={`Selamat Datang di Portal Data Strategis - Desa Jatiadi`}
      description="Sistem Informasi data strategis desa — diperbarui secara real-time di spreadsheet."
    >

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Jumlah RT"
          value={totalRT}
          icon={Users}
          loading={isLoadingAtap}
          hint="Jumlah RT berdasarkan data atap"
        />

        <StatCard
          label="Jumlah Penduduk"
          value={totalPenduduk}
          icon={HeartHandshake}
          tone="info"
          loading={isLoadingJenisKelamin}
          hint={`${laki} laki-laki · ${perempuan} perempuan`}
        />

        <StatCard
          label="Jumlah Rumah"
          value={totalRumah}
          icon={HomeIcon}
          tone="success"
          loading={isLoadingAtap}
          hint={`${genteng} genteng · ${seng} seng · ${asbes} asbes`}
        />
      </div>

      <div className="surface-card p-5">
        <h2 className="mb-3 font-display text-base font-semibold">
          Identitas Wilayah
        </h2>

        <div className="divide-y">
          <div className="grid grid-cols-[180px_1fr] gap-4 py-3 text-sm">
            <span className="font-medium">Nama Desa</span>
            <span>Jatiadi</span>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-4 py-3 text-sm">
            <span className="font-medium">Kecamatan</span>
            <span>Gending</span>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-4 py-3 text-sm">
            <span className="font-medium">Kabupaten</span>
            <span>Probolinggo</span>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-4 py-3 text-sm">
            <span className="font-medium">Provinsi</span>
            <span>Jawa Timur</span>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-4 py-3 text-sm">
            <span className="font-medium">Luas Wilayah</span>
            <span>229 Ha</span>
          </div>

          <div className="grid grid-cols-[180px_1fr] gap-4 py-3 text-sm">
            <span className="font-medium">Tahun Data</span>
            <span>2026</span>
          </div>
        </div>
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
