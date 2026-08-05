import { toast } from "sonner";

export type ExportColumn = { key: string; label: string };

function fileStamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function exportExcel(rows: Record<string, unknown>[], columns: ExportColumn[], name: string) {
  if (!rows.length) {
    toast.error("Tidak ada data untuk diekspor");
    return;
  }
  const XLSX = await import("xlsx");
  const shaped = rows.map((r) => Object.fromEntries(columns.map((c) => [c.label, r[c.key] ?? ""])));
  const ws = XLSX.utils.json_to_sheet(shaped);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 28) || "Data");
  XLSX.writeFile(wb, `${name}-${fileStamp()}.xlsx`);
  toast.success("Excel berhasil diunduh");
}

export async function exportPdf(
  rows: Record<string, unknown>[],
  columns: ExportColumn[],
  name: string,
  subtitle?: string,
) {
  if (!rows.length) {
    toast.error("Tidak ada data untuk diekspor");
    return;
  }
  const [{ jsPDF }, autoTableMod] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = autoTableMod.default;
  const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait" });
  doc.setFontSize(14);
  doc.text(name, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(subtitle ?? "Portal Data Strategis Desa Jatiadi", 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.label)],
    body: rows.map((r) => columns.map((c) => String(r[c.key] ?? "-"))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [234, 128, 42], textColor: 255 },
    alternateRowStyles: { fillColor: [253, 246, 240] },
  });
  doc.save(`${name}-${fileStamp()}.pdf`);
  toast.success("PDF berhasil diunduh");
}

export async function exportElementImage(el: HTMLElement | null, name: string) {
  if (!el) return;
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(el, {
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    scale: 2,
    logging: false,
  });
  const link = document.createElement("a");
  link.download = `${name}-${fileStamp()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  toast.success("Grafik berhasil diunduh");
}
