import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/portal/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRows } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/publikasi")({
  head: () => ({
    meta: [
      { title: "Publikasi Desa Jatiadi — Laporan & Infografis" },
      {
        name: "description",
        content: "Kumpulan publikasi Desa Jatiadi: laporan statistik, buku data, dan infografis hasil program Desa Cantik.",
      },
      { property: "og:title", content: "Publikasi Desa Jatiadi" },
      { property: "og:description", content: "Unduh laporan, buku data, dan infografis Desa Jatiadi." },
    ],
  }),
  component: Publikasi,
});

type Row = {
  id: string;
  judul: string;
  jenis: string;
  file_url: string | null;
  gambar_url: string | null;
  tanggal_terbit: string | null;
  deskripsi: string | null;
};

async function openFile(path: string | null) {
  if (!path) {
    toast.error("Berkas belum tersedia");
    return;
  }
  if (/^https?:\/\//.test(path)) {
    window.open(path, "_blank", "noopener");
    return;
  }
  const { data, error } = await supabase.storage.from("publikasi").createSignedUrl(path, 60 * 10);
  if (error || !data) {
    toast.error("Gagal membuka berkas");
    return;
  }
  window.open(data.signedUrl, "_blank", "noopener");
}

function Publikasi() {
  const { data, isLoading } = useRows<Row>("publikasi", { order: "tanggal_terbit", ascending: false });
  const rows = data ?? [];

  return (
    <PageShell
      breadcrumb="Publikasi"
      title="Publikasi"
      description="Dokumen, laporan, dan infografis resmi yang diterbitkan Desa Jatiadi."
    >
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface-card h-40 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="surface-card p-10 text-center text-sm text-muted-foreground">Belum ada publikasi.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <article
              key={r.id}
              className="surface-card overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Gambar */}
              {r.gambar_url ? (
                <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                  <img
                    src={r.gambar_url}
                    alt={r.judul}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted text-muted-foreground">
                  <FileText className="size-10" aria-hidden />
                </div>
              )}

              {/* Keterangan */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="secondary">
                    {r.jenis}
                  </Badge>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-base font-semibold leading-snug">
                    {r.judul}
                  </h2>

                  {r.deskripsi ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {r.deskripsi}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
