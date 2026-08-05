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
            <article key={r.id} className="surface-card flex flex-col gap-3 p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <FileText className="size-5" aria-hidden />
                </span>
                <Badge variant="secondary">{r.jenis}</Badge>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-sm font-semibold leading-snug">{r.judul}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Terbit: {formatDate(r.tanggal_terbit)}</p>
                {r.deskripsi ? <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{r.deskripsi}</p> : null}
              </div>
              <Button size="sm" variant="outline" onClick={() => void openFile(r.file_url)}>
                <Download className="mr-2 size-4" /> Unduh
              </Button>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
