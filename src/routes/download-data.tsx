import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText, Database } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/portal/PageShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { exportExcel, exportPdf } from "@/lib/export";
import { titleCase } from "@/lib/format";

export const Route = createFileRoute("/download-data")({
  head: () => ({
    meta: [
      { title: "Download Data — Portal Data Strategis Desa Jatiadi" },
      {
        name: "description",
        content: "Unduh seluruh tabel indikator Desa Jatiadi dalam format Excel atau PDF: kependudukan, keluarga, kesehatan, UMKM, dan RTLH.",
      },
      { property: "og:title", content: "Download Data Desa Jatiadi" },
      { property: "og:description", content: "Unduh tabel indikator desa dalam format Excel atau PDF." },
    ],
  }),
  component: DownloadData,
});

const TABLES: { table: string; label: string; group: string }[] = [
  { table: "desa_profil", label: "Profil Desa", group: "Profil" },
  { table: "dusun", label: "Dusun", group: "Profil" },
  { table: "rt", label: "RT", group: "Profil" },
  { table: "kependudukan_per_rt", label: "Kependudukan per RT", group: "Sosial" },
  { table: "karakteristik_keluarga", label: "Karakteristik Keluarga", group: "Sosial" },
  { table: "penduduk_disabilitas", label: "Penduduk Disabilitas", group: "Sosial" },
  { table: "pendidikan_sekolah", label: "Pendidikan", group: "Sosial" },
  { table: "kesehatan_fasilitas", label: "Fasilitas Kesehatan", group: "Sosial" },
  { table: "kesehatan_tenaga", label: "Tenaga Kesehatan", group: "Sosial" },
  { table: "gizi_balita", label: "Gizi Balita", group: "Sosial" },
  { table: "bencana_alam", label: "Bencana Alam", group: "Sosial" },
  { table: "ekonomi_fasilitas", label: "Fasilitas Ekonomi", group: "Ekonomi" },
  { table: "umkm_per_rt", label: "UMKM per RT", group: "Ekonomi" },
  { table: "umkm_lapangan_usaha", label: "UMKM Lapangan Usaha", group: "Ekonomi" },
  { table: "umkm_karakteristik_pengusaha", label: "Karakteristik Pengusaha UMKM", group: "Ekonomi" },
  { table: "umkm_pendidikan_pengusaha", label: "Pendidikan Pengusaha UMKM", group: "Ekonomi" },
  { table: "rtlh", label: "Rumah Tidak Layak Huni", group: "Spasial" },
  { table: "metadata_indikator", label: "Metadata Indikator", group: "Referensi" },
];

async function fetchTable(table: string) {
  const { data, error } = await supabase.from(table as never).select("*");
  if (error) throw error;
  return (data ?? []) as unknown as Record<string, unknown>[];
}

function columnsOf(rows: Record<string, unknown>[]) {
  const keys = Object.keys(rows[0] ?? {}).filter((k) => !["id", "created_at", "updated_at"].includes(k));
  return keys.map((k) => ({ key: k, label: titleCase(k) }));
}

function DownloadData() {
  const run = async (table: string, label: string, kind: "xlsx" | "pdf") => {
    try {
      const rows = await fetchTable(table);
      if (!rows.length) {
        toast.error("Tabel masih kosong");
        return;
      }
      const cols = columnsOf(rows);
      if (kind === "xlsx") await exportExcel(rows, cols, label);
      else await exportPdf(rows, cols, label);
    } catch {
      toast.error("Gagal mengunduh data");
    }
  };

  const groups = Array.from(new Set(TABLES.map((t) => t.group)));

  return (
    <PageShell
      breadcrumb="Download Data"
      title="Download Data"
      description="Unduh seluruh tabel indikator desa dalam format Excel (.xlsx) atau PDF."
    >
      <div className="surface-card flex items-start gap-3 p-4 text-sm">
        <Database className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <p className="text-muted-foreground">
          Data bersifat terbuka dan dapat digunakan kembali dengan mencantumkan sumber: Portal Data Strategis Desa Jatiadi.
        </p>
      </div>

      {groups.map((g) => (
        <section key={g}>
          <h2 className="mb-3 font-display text-base font-semibold">{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TABLES.filter((t) => t.group === g).map((t) => (
              <div key={t.table} className="surface-card flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.table}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" className="size-8" aria-label={`Unduh Excel ${t.label}`} onClick={() => void run(t.table, t.label, "xlsx")}>
                    <FileSpreadsheet className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="size-8" aria-label={`Unduh PDF ${t.label}`} onClick={() => void run(t.table, t.label, "pdf")}>
                    <FileText className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Download className="size-3.5" aria-hidden /> Berkas diunduh langsung dari basis data terkini.
      </p>
    </PageShell>
  );
}
