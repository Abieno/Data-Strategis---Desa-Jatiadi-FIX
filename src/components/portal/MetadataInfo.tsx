import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data";

type Meta = {
  id: string;
  nama_indikator: string | null;
  definisi: string | null;
  satuan: string | null;
  sumber_data: string | null;
  frekuensi_pembaruan: string | null;
  tahun: number | null;
};

export function MetadataInfo({ table }: { table: string }) {
  const { data } = useRows<Meta>("metadata_indikator", { select: "*" });
  const items = (data ?? []).filter((m) => (m as unknown as { nama_tabel: string }).nama_tabel === table);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" aria-label="Lihat metadata indikator">
          <Info className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <p className="mb-2 text-sm font-semibold">Metadata Indikator</p>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Metadata belum tersedia untuk indikator ini.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((m) => (
              <li key={m.id} className="rounded-lg bg-muted/60 p-3 text-xs">
                <p className="font-semibold text-foreground">{m.nama_indikator}</p>
                {m.definisi ? <p className="mt-1 text-muted-foreground">{m.definisi}</p> : null}
                <dl className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                  <div><dt className="inline font-medium">Satuan: </dt><dd className="inline">{m.satuan ?? "-"}</dd></div>
                  <div><dt className="inline font-medium">Tahun: </dt><dd className="inline">{m.tahun ?? "-"}</dd></div>
                  <div><dt className="inline font-medium">Sumber: </dt><dd className="inline">{m.sumber_data ?? "-"}</dd></div>
                  <div><dt className="inline font-medium">Pembaruan: </dt><dd className="inline">{m.frekuensi_pembaruan ?? "-"}</dd></div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
