import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/portal/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRows } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

async function downloadFile(
  path: string | null,
  fileName: string
) {
  if (!path) {
    toast.error("Berkas belum tersedia");
    return;
  }

  try {
    // =========================================================
    // GOOGLE DRIVE
    // =========================================================
    const googleDriveMatch = path.match(
      /drive\.google\.com\/file\/d\/([^/]+)/
    );

    if (googleDriveMatch) {
      const fileId = googleDriveMatch[1];

      const downloadUrl =
        `https://drive.google.com/uc?export=download&id=${fileId}`;

      // Jangan menggunakan fetch().
      // Biarkan browser yang menangani download langsung.
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${fileName}.pdf`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("File sedang diunduh");
      return;
    }

    // =========================================================
    // URL FILE BIASA
    // =========================================================
    if (/^https?:\/\//i.test(path)) {
      const link = document.createElement("a");
      link.href = path;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      link.remove();

      return;
    }

    // =========================================================
    // SUPABASE STORAGE
    // =========================================================
    const { data, error } = await supabase.storage
      .from("publikasi")
      .download(path);

    if (error || !data) {
      throw new Error("Gagal mengambil file dari Supabase Storage");
    }

    const extensionMap: Record<string, string> = {
      "application/pdf": ".pdf",
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/msword": ".doc",
    };

    const extension = extensionMap[data.type] || "";

    const cleanName = fileName.replace(/\.[^/.]+$/, "");
    const finalName = `${cleanName}${extension}`;

    const blobUrl = URL.createObjectURL(data);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = finalName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    toast.success(`File berhasil diunduh: ${finalName}`);
  } catch (error) {
    console.error("Gagal mengunduh file:", error);
    toast.error("Gagal mengunduh file");
  }
}

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
              className="surface-card flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md"
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

              {/* Konten */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="secondary">
                    {r.jenis}
                  </Badge>
                </div>

                <div className="min-w-0">
                  <h2 className="font-display text-base font-semibold leading-snug">
                    {r.judul}
                  </h2>

                  {r.deskripsi ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {r.deskripsi}
                    </p>
                  ) : null}
                </div>

                {/* Tombol selalu di posisi paling bawah */}
                <div className="mt-auto pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      void downloadFile(r.file_url, `${r.judul}.pdf`)
                    }
                  >
                    <Download className="mr-2 size-4" />
                    Unduh
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
