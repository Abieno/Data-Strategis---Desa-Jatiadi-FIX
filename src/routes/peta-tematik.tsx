import { lazy, Suspense, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Home, MapPin, AlertTriangle, Wrench } from "lucide-react";

import { PageShell } from "@/components/portal/PageShell";
import { StatCard } from "@/components/portal/StatCard";
import { ChartCard } from "@/components/portal/ChartCard";
import { DataTable } from "@/components/portal/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRows } from "@/lib/data";
import type { RtlhPoint } from "@/components/portal/RtlhMap";

const RtlhMap = lazy(() => import("@/components/portal/RtlhMap"));

export const Route = createFileRoute("/peta-tematik")({
  head: () => ({
    meta: [
      { title: "Peta Tematik RTLH Desa Jatiadi — Peta Interaktif" },
      {
        name: "description",
        content:
          "Peta tematik interaktif Desa Jatiadi menampilkan sebaran Rumah Tidak Layak Huni (RTLH) lengkap dengan foto.",
      },
      { property: "og:title", content: "Peta Tematik RTLH Desa Jatiadi" },
      { property: "og:description", content: "Sebaran spasial Rumah Tidak Layak Huni Desa Jatiadi." },
    ],
  }),
  component: PetaTematik,
});

type RtlhRow = {
  foto_url: string | null;
  latkoordinat: number;
  longkoordinat: number;
};

const TABLE_COLUMNS = [
  { key: "foto_url", label: "Link URL Foto" },
  { key: "latkoordinat", label: "Latitude" },
  { key: "longkoordinat", label: "Longitude" },
];

function PetaTematik() {
  const { data, isLoading } = useRows<RtlhRow>("rtlh_maps");
  const rows = data ?? [];

  // Titik yang dikirim ke peta -- hanya yang koordinatnya valid.
  const points: RtlhPoint[] = rows
    .filter(
      (r) =>
        Number.isFinite(Number(r.latkoordinat)) &&
        Number.isFinite(Number(r.longkoordinat))
    )
    .map((r) => ({
      latkoordinat: Number(r.latkoordinat),
      longkoordinat: Number(r.longkoordinat),
      foto_url: r.foto_url ?? null,
  }));

  const tableRows = rows.map((r) => ({
    foto_url: r.foto_url,
    latkoordinat: r.latkoordinat,
    longkoordinat: r.longkoordinat,
  }));

  return (
    <PageShell
      breadcrumb="Peta"
      title="Peta Tematik"
      description="Sebaran spasial Rumah Tidak Layak Huni Desa Jatiadi. Klik penanda untuk melihat foto rumah."
    >
      <ChartCard
        title="Peta Sebaran Desa Jatiadi"
        description="Klik pada penanda untuk melihat foto rumah"
        metadataTable="rtlh_maps"
        rows={rows}
        columns={TABLE_COLUMNS}
        fileName="Peta Tematik Desa Jatiadi"
      >
        <ClientOnly fallback={<div className="h-[560px] w-full animate-pulse rounded-xl bg-muted" />}>
          <Suspense fallback={<div className="h-[560px] w-full animate-pulse rounded-xl bg-muted" />}>
            <RtlhMap points={points} />
          </Suspense>
        </ClientOnly>
      </ChartCard>

      <ChartCard
        title="Tabel Data Koordinat Rumah"
        rows={tableRows}
        columns={TABLE_COLUMNS}
        fileName="Tabel RTLH"
      >
        <DataTable
          columns={TABLE_COLUMNS}
          rows={tableRows}
          loading={isLoading}
        />
      </ChartCard>
    </PageShell>
  );
}
