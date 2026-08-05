import { createFileRoute } from "@tanstack/react-router";
import { Landmark, Layers, Users, Ruler } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { BarsChart } from "@/components/portal/charts";
import { useRows, sum } from "@/lib/data";

export const Route = createFileRoute("/profil-desa")({
  head: () => ({
    meta: [
      { title: "Profil Desa Jatiadi — Wilayah, Dusun & RT" },
      {
        name: "description",
        content: "Profil administratif Desa Jatiadi: luas wilayah, ketinggian, daftar dusun, RW, RT, dan jarak ke kantor desa.",
      },
      { property: "og:title", content: "Profil Desa Jatiadi" },
      { property: "og:description", content: "Data wilayah, dusun, RW dan RT Desa Jatiadi." },
    ],
  }),
  component: ProfilDesa,
});

type Profil = {
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  luas_wilayah_ha: number | null;
  tinggi_wilayah_mdpl: number | null;
  lokasi_kantor_desa: string | null;
  sumber_data: string | null;
  tahun_data: number | null;
};

type Dusun = { id: string; nama_dusun: string; jumlah_rw: number; jumlah_rt: number };
type Rt = {
  id: string;
  nomor_rt: string;
  nomor_rw: string;
  jarak_ke_kantor_desa_km: number | null;
  dusun: { nama_dusun: string } | null;
};

function ProfilDesa() {
  const { data: profil } = useRows<Profil>("desa_profil", { limit: 1 });
  const { data: dusun, isLoading } = useRows<Dusun>("dusun", { order: "nama_dusun" });
  const { data: rt } = useRows<Rt>("rt", { select: "*, dusun:dusun_id(nama_dusun)", order: "nomor_rt" });

  const p = profil?.[0];
  const dusunRows = (dusun ?? []).map((d) => ({
    nama_dusun: d.nama_dusun,
    jumlah_rw: d.jumlah_rw,
    jumlah_rt: d.jumlah_rt,
  }));
  const rtRows = (rt ?? []).map((r) => ({
    dusun: r.dusun?.nama_dusun ?? "-",
    nomor_rw: r.nomor_rw,
    nomor_rt: r.nomor_rt,
    jarak: r.jarak_ke_kantor_desa_km ?? "-",
  }));

  const chart = dusunRows.map((d) => ({ name: d.nama_dusun, RT: d.jumlah_rt, RW: d.jumlah_rw }));

  return (
    <PageShell
      breadcrumb="Profil Desa"
      title="Profil Desa"
      description={`Gambaran administratif dan kewilayahan Desa ${p?.nama_desa ?? "Jatiadi"}.`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Luas Wilayah" value={Number(p?.luas_wilayah_ha ?? 0)} suffix="Ha" icon={Ruler} />
        <StatCard label="Ketinggian" value={Number(p?.tinggi_wilayah_mdpl ?? 0)} suffix="mdpl" icon={Landmark} tone="info" />
        <StatCard label="Jumlah Dusun" value={dusunRows.length} icon={Layers} tone="success" />
        <StatCard label="Jumlah RT" value={sum(dusunRows, "jumlah_rt")} icon={Users} tone="warning" hint={`${sum(dusunRows, "jumlah_rw")} RW`} />
      </div>

      <div className="surface-card p-5">
        <h2 className="mb-3 font-display text-base font-semibold">Identitas Wilayah</h2>
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Nama Desa", p?.nama_desa],
            ["Kecamatan", p?.kecamatan],
            ["Kabupaten", p?.kabupaten],
            ["Provinsi", p?.provinsi],
            ["Lokasi Kantor Desa", p?.lokasi_kantor_desa],
            ["Sumber Data", p?.sumber_data],
            ["Tahun Data", p?.tahun_data?.toString()],
          ].map(([k, v]) => (
            <div key={k as string} className="border-b pb-2">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 font-medium">{v ?? "-"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ChartCard
        title="Jumlah RT dan RW per Dusun"
        metadataTable="dusun"
        rows={chart}
        columns={[
          { key: "name", label: "Dusun" },
          { key: "RW", label: "Jumlah RW" },
          { key: "RT", label: "Jumlah RT" },
        ]}
        fileName="RT RW per Dusun"
      >
        <BarsChart
          data={chart}
          xKey="name"
          series={[
            { key: "RW", label: "RW" },
            { key: "RT", label: "RT" },
          ]}
        />
      </ChartCard>

      <ChartCard
        title="Daftar RT"
        description="Rincian RT beserta dusun dan jarak ke kantor desa."
        rows={rtRows}
        columns={[
          { key: "dusun", label: "Dusun" },
          { key: "nomor_rw", label: "RW" },
          { key: "nomor_rt", label: "RT" },
          { key: "jarak", label: "Jarak ke Kantor Desa (km)" },
        ]}
        fileName="Daftar RT"
      >
        <DataTable
          loading={isLoading}
          columns={[
            { key: "dusun", label: "Dusun" },
            { key: "nomor_rw", label: "RW" },
            { key: "nomor_rt", label: "RT" },
            { key: "jarak", label: "Jarak ke Kantor Desa (km)", align: "right" },
          ]}
          rows={rtRows}
        />
      </ChartCard>
    </PageShell>
  );
}
